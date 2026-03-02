import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Headers, RawBodyRequest, Query } from '@nestjs/common';
import { StripeService } from '../services/stripe.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminRole } from '../entities/admin-user.entity';

@Controller('admin/payments')
@UseGuards(AdminAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  async getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stripeService.getAllPayments({
      page: Number(page),
      limit: Number(limit),
      tenantId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Post('subscriptions')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.stripeService.createSubscription(
      createSubscriptionDto.tenantId,
      createSubscriptionDto.priceId,
      createSubscriptionDto.paymentMethodId,
    );
  }

  @Delete('subscriptions/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  cancelSubscription(
    @Param('id') id: string,
    @Body('immediate') immediate: boolean = false,
  ) {
    return this.stripeService.cancelSubscription(id, immediate);
  }

  @Get('subscriptions/tenant/:tenantId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  getSubscriptions(@Param('tenantId') tenantId: string) {
    return this.stripeService.getSubscriptionsByTenant(tenantId);
  }

  @Get('payments/tenant/:tenantId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  getPayments(@Param('tenantId') tenantId: string) {
    return this.stripeService.getPaymentsByTenant(tenantId);
  }

  @Get('invoices/tenant/:tenantId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  getInvoices(@Param('tenantId') tenantId: string) {
    return this.stripeService.getInvoicesByTenant(tenantId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    await this.stripeService.handleWebhook(signature, req.rawBody as Buffer);
    return { received: true };
  }
}
