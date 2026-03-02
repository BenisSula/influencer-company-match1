import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Tenant } from '../entities/tenant.entity';
import { Subscription, SubscriptionStatus } from '../entities/subscription.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {
    // Only initialize Stripe if API key is provided
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover' as any,
      });
    } else {
      console.warn('Stripe not configured - admin payment features disabled');
    }
  }

  async createCustomer(tenant: Tenant, email: string): Promise<string> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
      },
    });

    tenant.stripeCustomerId = customer.id;
    await this.tenantRepository.save(tenant);

    return customer.id;
  }

  async createSubscription(
    tenantId: string,
    priceId: string,
    paymentMethodId?: string,
  ): Promise<Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (!tenant.stripeCustomerId) {
      throw new BadRequestException('Stripe customer not created');
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: tenant.stripeCustomerId,
      });

      await this.stripe.customers.update(tenant.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: tenant.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to database
    const subscription = this.subscriptionRepository.create({
      tenantId: tenant.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      status: this.mapStripeStatus(stripeSubscription.status),
      amount: stripeSubscription.items.data[0].price.unit_amount! / 100,
      currency: stripeSubscription.items.data[0].price.currency,
      interval: stripeSubscription.items.data[0].price.recurring?.interval || 'month',
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Subscription> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const stripeSubscription = await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: !immediate,
      },
    );

    if (immediate) {
      await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.canceledAt = new Date();
    } else {
      subscription.cancelAt = new Date(stripeSubscription.cancel_at! * 1000);
    }

    return this.subscriptionRepository.save(subscription);
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
    }
  }

  private async handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      subscription.status = this.mapStripeStatus(stripeSubscription.status);
      subscription.currentPeriodStart = new Date((stripeSubscription as any).current_period_start * 1000);
      subscription.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
      
      if (stripeSubscription.canceled_at) {
        subscription.canceledAt = new Date(stripeSubscription.canceled_at * 1000);
      }

      await this.subscriptionRepository.save(subscription);
    }
  }

  private async handleInvoicePaymentSucceeded(stripeInvoice: Stripe.Invoice): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (invoice) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
      await this.invoiceRepository.save(invoice);
    } else {
      // Create new invoice record
      const tenant = await this.tenantRepository.findOne({
        where: { stripeCustomerId: stripeInvoice.customer as string },
      });

      if (tenant) {
        const newInvoice = this.invoiceRepository.create({
          tenantId: tenant.id,
          stripeInvoiceId: stripeInvoice.id,
          invoiceNumber: stripeInvoice.number || '',
          status: InvoiceStatus.PAID,
          subtotal: stripeInvoice.subtotal / 100,
          tax: (stripeInvoice as any).tax || 0 / 100,
          total: stripeInvoice.total / 100,
          currency: stripeInvoice.currency,
          lineItems: stripeInvoice.lines.data.map(line => ({
            description: line.description || '',
            quantity: line.quantity || 1,
            unitAmount: (line as any).price?.unit_amount || 0 / 100,
            amount: line.amount / 100,
          })),
          pdfUrl: stripeInvoice.invoice_pdf || null,
          paidAt: new Date(),
        });

        await this.invoiceRepository.save(newInvoice);
      }
    }
  }

  private async handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice): Promise<void> {
    // Handle failed payment - could send notification, update subscription status, etc.
    console.error('Invoice payment failed:', stripeInvoice.id);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { stripeCustomerId: paymentIntent.customer as string },
    });

    if (tenant) {
      const payment = this.paymentRepository.create({
        tenantId: tenant.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: PaymentStatus.SUCCEEDED,
        description: paymentIntent.description || null,
        metadata: paymentIntent.metadata,
      });

      await this.paymentRepository.save(payment);
    }
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELLED,
      trialing: SubscriptionStatus.TRIALING,
      incomplete: SubscriptionStatus.INCOMPLETE,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.INCOMPLETE;
  }

  async getSubscriptionsByTenant(tenantId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentsByTenant(tenantId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getInvoicesByTenant(tenantId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPayments(options: {
    page: number;
    limit: number;
    tenantId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const query = this.paymentRepository.createQueryBuilder('payment')
        .leftJoinAndSelect('payment.subscription', 'subscription')
        .skip((options.page - 1) * options.limit)
        .take(options.limit)
        .orderBy('payment.createdAt', 'DESC');

      if (options.tenantId) {
        query.andWhere('subscription.tenantId = :tenantId', { tenantId: options.tenantId });
      }

      if (options.status) {
        query.andWhere('payment.status = :status', { status: options.status });
      }

      if (options.startDate) {
        query.andWhere('payment.createdAt >= :startDate', { startDate: options.startDate });
      }

      if (options.endDate) {
        query.andWhere('payment.createdAt <= :endDate', { endDate: options.endDate });
      }

      const [data, total] = await query.getManyAndCount();

      return {
        data,
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
      };
    } catch (error) {
      // If there's an error (e.g., no payments table), return empty result
      console.warn('Error fetching payments:', error.message);
      return {
        data: [],
        total: 0,
        page: options.page,
        limit: options.limit,
        totalPages: 0,
      };
    }
  }
}
