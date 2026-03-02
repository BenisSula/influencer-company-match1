import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { InvoiceController } from './invoice.controller';
import { PaymentsService } from './payments.service';
import { PaymentsWebhookService } from './payments-webhook.service';
import { PaymentsWebhookProcessor } from './payments-webhook.processor';
import { InvoiceService } from './invoice.service';
import { PaymentsGateway } from './payments.gateway';
import { StripeConnectService } from './services/stripe-connect.service';
import { Payment } from './entities/payment.entity';
import { Payout } from './entities/payout.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Invoice } from './entities/invoice.entity';
import { User } from '../auth/entities/user.entity';
import { Payout as WalletPayout } from '../wallet/entities/payout.entity';
import { WalletModule } from '../wallet/wallet.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, Payout, PaymentMethod, Invoice, User, WalletPayout]),
    BullModule.registerQueue({
      name: 'payment-webhooks',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => WalletModule),
    NotificationsModule,
  ],
  controllers: [PaymentsController, PaymentsWebhookController, InvoiceController],
  providers: [
    PaymentsService,
    PaymentsWebhookService,
    PaymentsWebhookProcessor,
    InvoiceService,
    PaymentsGateway,
    StripeConnectService,
  ],
  exports: [PaymentsService, InvoiceService, PaymentsGateway, StripeConnectService],
})
export class PaymentsModule {}
