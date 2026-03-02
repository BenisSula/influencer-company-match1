import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../auth/entities/user.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { StripeConnectService } from './services/stripe-connect.service';
import { StripeConfig } from '../../config/stripe.config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripeConfig: StripeConfig;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private stripeConnectService: StripeConnectService,
    private configService: ConfigService,
  ) {
    this.stripeConfig = this.configService.get<StripeConfig>('stripe');
  }

  async getOnboardingStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      hasStripeAccount: !!(user.stripeAccountId || user.stripeCustomerId),
      stripeAccountId: user.stripeAccountId,
      stripeCustomerId: user.stripeCustomerId,
      onboardingComplete: user.stripeOnboardingComplete,
    };
  }

  /**
   * Create company onboarding (Stripe Customer)
   * Companies need a customer ID to make payments
   */
  async createCompanyOnboardingLink(userId: string): Promise<{ url?: string; message?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.stripeCustomerId) {
      return { message: 'Already onboarded' };
    }

    try {
      // Create Stripe customer
      const stripe = this.stripeConnectService.getStripeInstance();
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });

      user.stripeCustomerId = customer.id;
      await this.userRepository.save(user);

      this.logger.log(`Company ${userId} onboarded with customer ${customer.id}`);

      return { message: 'Onboarding complete' };
    } catch (error) {
      this.logger.error(`Company onboarding failed: ${error.message}`);
      throw new BadRequestException(`Onboarding failed: ${error.message}`);
    }
  }

  /**
   * Create influencer onboarding (Stripe Connect Account)
   * Influencers need a Connect account to receive payouts
   */
  async createInfluencerOnboardingLink(userId: string): Promise<{ url?: string; message?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.stripeAccountId) {
      return { url: null, message: 'Already onboarded' };
    }

    try {
      // Create Connect account
      const stripe = this.stripeConnectService.getStripeInstance();
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // adjust based on user's country
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: { userId: user.id },
      });

      user.stripeAccountId = account.id;
      await this.userRepository.save(user);

      this.logger.log(`Influencer ${userId} created Connect account ${account.id}`);

      // Generate onboarding link
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      const link = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${frontendUrl}/onboarding/refresh`,
        return_url: `${frontendUrl}/onboarding/complete`,
        type: 'account_onboarding',
      });

      return { url: link.url };
    } catch (error) {
      this.logger.error(`Influencer onboarding failed: ${error.message}`);
      throw new BadRequestException(`Onboarding failed: ${error.message}`);
    }
  }

  async createAccountLink(userId: string, refreshUrl: string, returnUrl: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.stripeAccountId) {
      throw new Error('User does not have a Stripe Connect account');
    }

    const accountLinkUrl = await this.stripeConnectService.createAccountLink(
      user.stripeAccountId,
      refreshUrl,
      returnUrl,
    );

    return { url: accountLinkUrl };
  }

  /**
   * Create payment for collaboration
   * Called when collaboration is accepted
   * Returns either payment object or onboarding requirement
   */
  async createCollaborationPayment(
    collaborationId: string,
    companyId: string,
    influencerId: string,
    budget: number, // in dollars
  ): Promise<{ payment?: Payment; onboardingRequired?: { type: 'company' | 'influencer'; redirectTo: string; message: string } }> {
    this.logger.log(`Creating payment for collaboration ${collaborationId}, budget ${budget}`);

    // 1. Check Stripe key
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey || stripeKey.includes('placeholder') || stripeKey === 'sk_test_...') {
      this.logger.error('Stripe secret key is missing or placeholder');
      throw new BadRequestException('Payment system not configured. Please contact support.');
    }

    // 2. Fetch users
    const company = await this.userRepository.findOne({ where: { id: companyId } });
    const influencer = await this.userRepository.findOne({ where: { id: influencerId } });

    if (!company) {
      this.logger.error(`Company ${companyId} not found`);
      throw new BadRequestException('Company not found');
    }
    if (!influencer) {
      this.logger.error(`Influencer ${influencerId} not found`);
      throw new BadRequestException('Influencer not found');
    }

    // 3. Check onboarding status - NEW PHASE 5 LOGIC
    // Check if company needs onboarding
    if (company.role === UserRole.COMPANY && !company.stripeCustomerId) {
      this.logger.warn(`Company ${companyId} needs onboarding`);
      return {
        onboardingRequired: {
          type: 'company',
          redirectTo: '/onboarding/company',
          message: 'Please complete payment setup before sending collaboration requests.'
        }
      };
    }

    // Check if influencer needs onboarding (for receiving payments)
    if (influencer.role === UserRole.INFLUENCER && !influencer.stripeAccountId) {
      this.logger.warn(`Influencer ${influencerId} needs onboarding`);
      return {
        onboardingRequired: {
          type: 'influencer',
          redirectTo: '/onboarding/influencer',
          message: 'Please complete payout setup before accepting collaborations.'
        }
      };
    }

    // 4. Verify Stripe IDs exist (should be set after onboarding check)
    if (!company.stripeCustomerId) {
      this.logger.error(`Company ${companyId} missing stripeCustomerId`);
      throw new BadRequestException('Company needs to set up payment account first');
    }
    if (!influencer.stripeAccountId) {
      this.logger.error(`Influencer ${influencerId} missing stripeAccountId`);
      throw new BadRequestException('Influencer needs to set up payout account first');
    }

    // 5. Calculate amounts (in cents)
    const amountBudget = Math.round(budget * 100);               // $1,000.00 -> 100000
    const companyFee = Math.round(budget * 0.05 * 100);          // $50.00
    const platformRevenue = Math.round(budget * 0.15 * 100);     // $150.00
    const amountTotal = amountBudget + companyFee;               // $1,050.00

    try {
      // 6. Create Stripe PaymentIntent with destination charge
      const stripe = this.stripeConnectService.getStripeInstance();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountTotal,
        currency: 'usd',
        customer: company.stripeCustomerId,
        application_fee_amount: platformRevenue,
        transfer_data: {
          destination: influencer.stripeAccountId,
        },
        metadata: {
          collaborationId,
          companyId,
          influencerId,
        },
      });

      this.logger.log(`PaymentIntent created: ${paymentIntent.id}`);

      // 6. Save payment record in database
      const payment = this.paymentRepository.create({
        collaborationId,
        companyId,
        influencerId,
        amountTotal,
        amountBudget,
        amountCompanyFee: companyFee,
        amountInfluencerFee: Math.round(budget * 0.1 * 100),     // $100.00
        amountPlatformRevenue: platformRevenue,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret, // store for frontend
      });

      await this.paymentRepository.save(payment);
      this.logger.log(`Payment record saved with id ${payment.id}`);

      return { payment };
    } catch (error) {
      this.logger.error(`Stripe payment creation failed: ${error.message}`);
      throw new BadRequestException(`Payment creation failed: ${error.message}`);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify user is part of this payment
    if (payment.companyId !== userId && payment.influencerId !== userId) {
      throw new BadRequestException('You do not have access to this payment');
    }

    return payment;
  }

  /**
   * Get payment by collaboration ID
   */
  async getPaymentByCollaborationId(collaborationId: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { collaborationId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this collaboration');
    }

    // Verify user is part of this payment
    if (payment.companyId !== userId && payment.influencerId !== userId) {
      throw new BadRequestException('You do not have access to this payment');
    }

    return payment;
  }

  /**
   * Get payments for a user
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: [
        { companyId: userId },
        { influencerId: userId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get client secret for payment
   * Used by frontend to initialize Stripe Elements
   */
  async getClientSecret(paymentId: string, userId: string): Promise<{ clientSecret: string }> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.companyId !== userId && payment.influencerId !== userId) {
      throw new BadRequestException('Access denied');
    }
    if (!payment.clientSecret) {
      // If client secret wasn't stored, retrieve it from Stripe
      const stripe = this.stripeConnectService.getStripeInstance();
      const pi = await stripe.paymentIntents.retrieve(payment.paymentIntentId);
      return { clientSecret: pi.client_secret };
    }
    return { clientSecret: payment.clientSecret };
  }

  /**
   * Confirm payment with payment method
   * This processes the payment and holds funds in escrow
   */
  async confirmPayment(
    paymentId: string,
    paymentMethodId: string,
    userId: string,
  ): Promise<Payment> {
    try {
      this.logger.log(`Confirming payment ${paymentId} with payment method ${paymentMethodId}`);

      // Get payment
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Verify user is the company who owns this payment
      if (payment.companyId !== userId) {
        throw new BadRequestException('Only the company can confirm this payment');
      }

      // Check payment status
      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException(`Payment is already ${payment.status}`);
      }

      // Get Stripe instance
      const stripe = this.stripeConnectService.getStripeInstance();

      // Update payment status to processing
      payment.status = PaymentStatus.PROCESSING;
      await this.paymentRepository.save(payment);

      try {
        // Retrieve PaymentIntent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentIntentId);

        this.logger.log(`PaymentIntent status: ${paymentIntent.status}`);

        // Attach payment method to PaymentIntent
        const updatedPaymentIntent = await stripe.paymentIntents.update(
          payment.paymentIntentId,
          {
            payment_method: paymentMethodId,
          },
        );

        // Confirm the PaymentIntent
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
          payment.paymentIntentId,
        );

        this.logger.log(`PaymentIntent confirmed: ${confirmedPaymentIntent.status}`);

        // Check if confirmation was successful
        if (confirmedPaymentIntent.status === 'requires_capture') {
          // Payment authorized, now capture it
          const capturedPaymentIntent = await stripe.paymentIntents.capture(
            payment.paymentIntentId,
          );

          this.logger.log(`PaymentIntent captured: ${capturedPaymentIntent.status}`);

          // Update payment status to held (funds in escrow)
          payment.status = PaymentStatus.HELD;
          payment.metadata = {
            ...payment.metadata,
            confirmedAt: new Date().toISOString(),
            paymentMethodId,
          };

          const updatedPayment = await this.paymentRepository.save(payment);

          this.logger.log(`Payment ${paymentId} confirmed and held in escrow`);

          // TODO: Emit WebSocket event to notify influencer
          // this.notificationsGateway.notifyPaymentReceived(payment.influencerId, payment);

          return updatedPayment;
        } else if (confirmedPaymentIntent.status === 'succeeded') {
          // Payment succeeded immediately (shouldn't happen with manual capture, but handle it)
          payment.status = PaymentStatus.HELD;
          payment.metadata = {
            ...payment.metadata,
            confirmedAt: new Date().toISOString(),
            paymentMethodId,
          };

          const updatedPayment = await this.paymentRepository.save(payment);

          this.logger.log(`Payment ${paymentId} succeeded immediately`);

          return updatedPayment;
        } else {
          // Payment failed or requires action
          throw new BadRequestException(
            `Payment confirmation failed: ${confirmedPaymentIntent.status}`,
          );
        }
      } catch (stripeError) {
        // Payment failed - update status
        payment.status = PaymentStatus.FAILED;
        payment.metadata = {
          ...payment.metadata,
          error: stripeError.message,
          failedAt: new Date().toISOString(),
        };
        await this.paymentRepository.save(payment);

        this.logger.error(`Payment ${paymentId} failed:`, stripeError);

        // Throw user-friendly error
        if (stripeError.type === 'StripeCardError') {
          throw new BadRequestException(
            stripeError.message || 'Your card was declined. Please try a different payment method.',
          );
        } else if (stripeError.code === 'insufficient_funds') {
          throw new BadRequestException('Insufficient funds. Please try a different payment method.');
        } else {
          throw new BadRequestException(
            'Payment processing failed. Please try again or use a different payment method.',
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to confirm payment ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Release payment after collaboration completion
   * This transfers funds from escrow to influencer's available balance
   */
  async releasePayment(
    collaborationId: string,
    userId: string,
  ): Promise<Payment> {
    try {
      this.logger.log(`Releasing payment for collaboration ${collaborationId}`);

      // Find payment by collaboration ID
      const payment = await this.paymentRepository.findOne({
        where: { collaborationId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found for this collaboration');
      }

      // Verify user is the company who owns this payment
      if (payment.companyId !== userId) {
        throw new BadRequestException('Only the company can release this payment');
      }

      // Check payment status
      if (payment.status !== PaymentStatus.HELD) {
        throw new BadRequestException(
          `Payment cannot be released. Current status: ${payment.status}`,
        );
      }

      // Update payment status to released
      payment.status = PaymentStatus.RELEASED;
      payment.releasedAt = new Date();
      payment.metadata = {
        ...payment.metadata,
        releasedBy: userId,
        releasedAt: new Date().toISOString(),
      };

      const updatedPayment = await this.paymentRepository.save(payment);

      this.logger.log(`Payment ${payment.id} released successfully`);

      // TODO: Update influencer's wallet balance
      // This will be implemented in Phase 3.2 (Wallet System)
      // await this.walletService.creditBalance(
      //   payment.influencerId,
      //   payment.amountBudget - payment.amountInfluencerFee,
      //   'payment_released',
      //   payment.id
      // );

      // TODO: Send notifications
      // await this.notificationsService.notifyPaymentReleased(payment);

      return updatedPayment;
    } catch (error) {
      this.logger.error(`Failed to release payment for collaboration ${collaborationId}:`, error);
      throw error;
    }
  }
}
