import { Controller, Post, Headers, Body, RawBodyRequest, Req, Logger } from '@nestjs/common';
import { PaymentsWebhookService } from './payments-webhook.service';
import Stripe from 'stripe';

@Controller('payments/webhook')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(
    private readonly webhookService: PaymentsWebhookService,
  ) {}

  /**
   * Public webhook endpoint for Stripe events
   * No authentication required - verified by Stripe signature
   */
  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    this.logger.log('Received Stripe webhook');

    if (!signature) {
      this.logger.error('Missing stripe-signature header');
      throw new Error('Missing stripe-signature header');
    }

    try {
      // Process the webhook event
      const result = await this.webhookService.handleWebhook(
        request.rawBody,
        signature,
      );

      this.logger.log(`Webhook processed successfully: ${result.eventType}`);
      return { received: true, eventType: result.eventType };
    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      throw error;
    }
  }
}
