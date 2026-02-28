import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceService } from './invoice.service';
import { InvoiceStatus } from './entities/invoice.entity';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * Get company invoices
   */
  @Get('company')
  async getCompanyInvoices(
    @Request() req,
    @Query('status') status?: InvoiceStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
    };

    return this.invoiceService.getCompanyInvoices(req.user.id, filters);
  }

  /**
   * Get influencer earnings
   */
  @Get('earnings')
  async getInfluencerEarnings(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
    };

    return this.invoiceService.getInfluencerEarnings(req.user.id, filters);
  }

  /**
   * Get invoice by ID
   */
  @Get(':id')
  async getInvoice(@Param('id') id: string) {
    return this.invoiceService.getInvoiceById(id);
  }

  /**
   * Get invoice PDF data
   */
  @Get(':id/pdf-data')
  async getInvoicePdfData(@Param('id') id: string) {
    return this.invoiceService.getInvoicePdfData(id);
  }

  /**
   * Create invoice from payment
   */
  @Post('payment/:paymentId')
  async createInvoiceFromPayment(@Param('paymentId') paymentId: string) {
    return this.invoiceService.createInvoiceFromPayment(paymentId);
  }
}
