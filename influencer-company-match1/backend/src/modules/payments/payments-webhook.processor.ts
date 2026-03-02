import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentsWebhookService } from './payments-webhook.service';

@Processor('payment-webhooks')
export class PaymentsWebhookProcessor {
  private readonly logger = new Logger(PaymentsWebhookProcessor.name);

  constructor(
    private readonly webhookService: PaymentsWebhookService,
  ) {}

  @Process('process-webhook')
  async handleWebhookEvent(job: Job) {
    const { eventId, eventType, data } = job.data;

    this.logger.log(`Processing webhook event ${eventId}: ${eventType}`);

    try {
      await this.webhookService.processWebhookEvent(eventType, data);
      this.logger.log(`Successfully processed webhook event ${eventId}`);
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${eventId}:`, error);
      throw error; // Bull will retry
    }
  }
}
