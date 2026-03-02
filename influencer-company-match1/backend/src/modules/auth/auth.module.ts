import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { InfluencerProfile } from './entities/influencer-profile.entity';
import { CompanyProfile } from './entities/company-profile.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MessagingModule } from '../messaging/messaging.module';
import { PaymentsModule } from '../payments/payments.module';
import { LandingModule } from '../landing/landing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, InfluencerProfile, CompanyProfile]),
    forwardRef(() => MessagingModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => LandingModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
