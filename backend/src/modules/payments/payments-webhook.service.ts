import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Payout as PayoutEntity, PayoutStatus } from '../wallet/entities/payout.entity';
import { TransactionType } from '../wallet/entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class PaymentsWebhookService {
  private readonly logger = new Logger(PaymentsWebhookService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PayoutEntity)
    private readonly payoutRepository: Repository<PayoutEntity>,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly notificationsService: NotificationsService,
    @InjectQueue('payment-webhooks') private readonly webhookQueue: Queue,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-01-28.clover' },
    );
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
  }

  /**
   * Verify and process Stripe webhook
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid signature');
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    // Queue the event for async processing
    await this.webhookQueue.add('process-webhook', {
      eventId: event.id,
      eventType: event.type,
      data: event.data.object,
    });

    return { eventType: event.type };
  }

  /**
   * Process webhook events asynchronously
   */
  async processWebhookEvent(eventType: string, data: any) {
    try {
      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(data);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(data);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(data);
          break;

        case 'payout.paid':
          await this.handlePayoutPaid(data);
          break;

        case 'payout.failed':
          await this.handlePayoutFailed(data);
          break;

        default:
          this.logger.log(`Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);

    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status to HELD (escrow)
    if (payment.status !== PaymentStatus.HELD) {
      payment.status = PaymentStatus.HELD;
      payment.metadata = {
        ...payment.metadata,
        paymentIntentSucceeded: new Date().toISOString(),
        chargeId: paymentIntent.latest_charge,
      };

      await this.paymentRepository.save(payment);

      // Notify company
      await this.notificationsService.create({
        userId: payment.companyId,
        type: 'payment_held',
        title: 'Payment Held in Escrow',
        message: `Your payment of $${payment.amountBudget} has been successfully processed and is now held in escrow.`,
        data: { paymentId: payment.id },
      });

      // Notify influencer
      await this.notificationsService.create({
        userId: payment.influencerId,
        type: 'payment_held',
        title: 'Payment Secured',
        message: `A payment of $${payment.amountBudget - payment.amountInfluencerFee} is secured for your collaboration.`,
        data: { paymentId: payment.id },
      });
    }
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment intent failed: ${paymentIntent.id}`);

    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status to FAILED
    payment.status = PaymentStatus.FAILED;
    payment.metadata = {
      ...payment.metadata,
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      failedAt: new Date().toISOString(),
    };

    await this.paymentRepository.save(payment);

    // Notify company with retry option
    await this.notificationsService.create({
      userId: payment.companyId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Your payment of $${payment.amountBudget} failed. Please update your payment method and try again.`,
      data: {
        paymentId: payment.id,
        failureReason: paymentIntent.last_payment_error?.message,
        canRetry: true,
      },
    });
  }

  /**
   * Handle charge refund
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    this.logger.log(`Charge refunded: ${charge.id}`);

    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: charge.payment_intent as string },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for charge: ${charge.id}`);
      return;
    }

    // Update payment status to REFUNDED
    payment.status = PaymentStatus.REFUNDED;
    payment.metadata = {
      ...payment.metadata,
      refundedAt: new Date().toISOString(),
      refundAmount: charge.amount_refunded,
      refundReason: charge.refunds?.data[0]?.reason || 'requested_by_customer',
    };

    await this.paymentRepository.save(payment);

    // If payment was released, adjust wallet balance
    if (payment.releasedAt) {
      await this.walletService.debitBalance(
        payment.influencerId,
        payment.amountBudget - payment.amountInfluencerFee,
        TransactionType.PAYMENT_REFUNDED,
        payment.id,
      );
    }

    // Notify both parties
    await this.notificationsService.create({
      userId: payment.companyId,
      type: 'payment_refunded',
      title: 'Payment Refunded',
      message: `Your payment of $${payment.amountBudget} has been refunded.`,
      data: { paymentId: payment.id },
    });

    await this.notificationsService.create({
      userId: payment.influencerId,
      type: 'payment_refunded',
      title: 'Payment Refunded',
      message: `The payment for your collaboration has been refunded to the company.`,
      data: { paymentId: payment.id },
    });
  }

  /**
   * Handle successful payout
   */
  private async handlePayoutPaid(payout: Stripe.Payout) {
    this.logger.log(`Payout paid: ${payout.id}`);

    const payoutRecord = await this.payoutRepository.findOne({
      where: { stripePayoutId: payout.id },
    });

    if (!payoutRecord) {
      this.logger.warn(`Payout not found: ${payout.id}`);
      return;
    }

    // Update payout status to COMPLETED
    payoutRecord.status = PayoutStatus.COMPLETED;
    payoutRecord.completedAt = new Date();
    payoutRecord.metadata = {
      ...payoutRecord.metadata,
      arrivalDate: new Date(payout.arrival_date * 1000).toISOString(),
    };

    await this.payoutRepository.save(payoutRecord);

    // Get wallet to find user
    const wallet = await this.walletService.getWalletById(payoutRecord.walletId);

    // Notify user
    await this.notificationsService.create({
      userId: wallet.userId,
      type: 'payout_completed',
      title: 'Payout Completed',
      message: `Your payout of $${payoutRecord.amount} has been successfully transferred to your bank account.`,
      data: { payoutId: payoutRecord.id },
    });
  }

  /**
   * Handle failed payout
   */
  private async handlePayoutFailed(payout: Stripe.Payout) {
    this.logger.log(`Payout failed: ${payout.id}`);

    const payoutRecord = await this.payoutRepository.findOne({
      where: { stripePayoutId: payout.id },
    });

    if (!payoutRecord) {
      this.logger.warn(`Payout not found: ${payout.id}`);
      return;
    }

    // Update payout status to FAILED
    payoutRecord.status = PayoutStatus.FAILED;
    payoutRecord.failureReason = payout.failure_message || 'Payout failed';
    payoutRecord.metadata = {
      ...payoutRecord.metadata,
      failureCode: payout.failure_code,
      failedAt: new Date().toISOString(),
    };

    await this.payoutRepository.save(payoutRecord);

    // Return funds to wallet
    await this.walletService.creditBalance(
      payoutRecord.walletId,
      payoutRecord.amount,
      TransactionType.PAYOUT_FAILED_REFUND,
      payoutRecord.id,
    );

    // Get wallet to find user
    const wallet = await this.walletService.getWalletById(payoutRecord.walletId);

    // Notify user
    await this.notificationsService.create({
      userId: wallet.userId,
      type: 'payout_failed',
      title: 'Payout Failed',
      message: `Your payout of $${payoutRecord.amount} failed. The funds have been returned to your wallet. Please update your bank account details.`,
      data: {
        payoutId: payoutRecord.id,
        failureReason: payoutRecord.failureReason,
      },
    });
  }
}
