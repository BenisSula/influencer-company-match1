import { Controller, Get, Post, Body, Param, UseGuards, Request, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('onboarding-status')
  async getOnboardingStatus(@Request() req) {
    return this.paymentsService.getOnboardingStatus(req.user.userId);
  }

  @Post('create-account-link')
  async createAccountLink(@Request() req, @Body() body: { refreshUrl: string; returnUrl: string }) {
    return this.paymentsService.createAccountLink(
      req.user.userId,
      body.refreshUrl,
      body.returnUrl,
    );
  }

  @Get(':id')
  async getPayment(@Param('id') id: string, @Request() req) {
    return this.paymentsService.getPaymentById(id, req.user.userId);
  }

  @Get('collaboration/:collaborationId')
  async getPaymentByCollaboration(@Param('collaborationId') collaborationId: string, @Request() req) {
    return this.paymentsService.getPaymentByCollaborationId(collaborationId, req.user.userId);
  }

  /**
   * Get client secret for payment intent
   * Used by frontend to initialize Stripe payment form
   */
  @Get('collaboration/:collaborationId/client-secret')
  async getClientSecret(@Param('collaborationId') collaborationId: string, @Request() req) {
    const payment = await this.paymentsService.getPaymentByCollaborationId(collaborationId, req.user.userId);
    
    if (!payment) {
      throw new NotFoundException('Payment not found for this collaboration');
    }
    
    if (!payment.clientSecret) {
      throw new BadRequestException('Payment intent not created yet. Please try again later.');
    }
    
    return {
      clientSecret: payment.clientSecret,
      paymentId: payment.id,
      collaborationId: payment.collaborationId,
      amount: payment.amountTotal,
      status: payment.status,
    };
  }

  /**
   * Get client secret by payment ID
   * Alternative endpoint for retrieving client secret
   */
  @Get(':id/client-secret')
  async getClientSecretById(@Param('id') id: string, @Request() req) {
    return this.paymentsService.getClientSecret(id, req.user.userId);
  }

  @Get()
  async getUserPayments(@Request() req) {
    return this.paymentsService.getUserPayments(req.user.userId);
  }

  @Post(':id/confirm')
  async confirmPayment(
    @Param('id') id: string,
    @Body() confirmPaymentDto: ConfirmPaymentDto,
    @Request() req,
  ) {
    return this.paymentsService.confirmPayment(
      id,
      confirmPaymentDto.paymentMethodId,
      req.user.userId,
    );
  }

  @Post('collaboration/:collaborationId/release')
  async releasePayment(
    @Param('collaborationId') collaborationId: string,
    @Request() req,
  ) {
    return this.paymentsService.releasePayment(collaborationId, req.user.userId);
  }

  /**
   * Company onboarding - creates Stripe customer
   */
  @Post('onboarding/company')
  async createCompanyOnboarding(@Request() req) {
    return this.paymentsService.createCompanyOnboardingLink(req.user.userId);
  }

  /**
   * Influencer onboarding - creates Stripe Connect account
   */
  @Post('onboarding/influencer')
  async createInfluencerOnboarding(@Request() req) {
    return this.paymentsService.createInfluencerOnboardingLink(req.user.userId);
  }
}
