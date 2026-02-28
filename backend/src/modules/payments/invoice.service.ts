import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices this month
    const startOfMonth = new Date(year, new Date().getMonth(), 1);
    const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);
    
    const count = await this.invoiceRepository.count({
      where: {
        issueDate: Between(startOfMonth, endOfMonth),
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  /**
   * Create invoice from payment
   */
  async createInvoiceFromPayment(paymentId: string): Promise<Invoice> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
        relations: ['company', 'influencer'],
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Check if invoice already exists
      const existingInvoice = await this.invoiceRepository.findOne({
        where: { paymentId },
      });

      if (existingInvoice) {
        return existingInvoice;
      }

      const invoiceNumber = await this.generateInvoiceNumber();

      const invoice = this.invoiceRepository.create({
        invoiceNumber,
        paymentId: payment.id,
        companyId: payment.companyId,
        influencerId: payment.influencerId,
        tenantId: null, // Payment entity doesn't have tenantId
        status: InvoiceStatus.ISSUED,
        amount: payment.amountBudget,
        platformFee: payment.amountPlatformRevenue,
        influencerAmount: payment.amountInfluencerFee,
        currency: 'usd',
        issueDate: new Date(),
        paidDate: payment.releasedAt || null,
        description: `Payment for collaboration`,
        lineItems: [
          {
            description: 'Collaboration Services',
            quantity: 1,
            unitPrice: payment.amountBudget,
            total: payment.amountBudget,
          },
          {
            description: 'Platform Fee',
            quantity: 1,
            unitPrice: -payment.amountPlatformRevenue,
            total: -payment.amountPlatformRevenue,
          },
        ],
        metadata: {
          paymentIntentId: payment.stripePaymentIntentId,
          collaborationId: payment.collaborationId,
        },
      });

      const savedInvoice = await this.invoiceRepository.save(invoice);
      this.logger.log(`Invoice created: ${invoiceNumber}`);

      return savedInvoice;
    } catch (error) {
      this.logger.error('Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Get company invoices
   */
  async getCompanyInvoices(
    companyId: string,
    filters?: {
      status?: InvoiceStatus;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
  ) {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.payment', 'payment')
      .leftJoinAndSelect('invoice.influencer', 'influencer')
      .where('invoice.company_id = :companyId', { companyId });

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('invoice.issue_date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('invoice.issue_date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(invoice.invoice_number ILIKE :search OR invoice.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query.orderBy('invoice.issue_date', 'DESC');

    return query.getMany();
  }

  /**
   * Get influencer earnings
   */
  async getInfluencerEarnings(
    influencerId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
  ) {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.payment', 'payment')
      .leftJoinAndSelect('invoice.company', 'company')
      .where('invoice.influencer_id = :influencerId', { influencerId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID });

    if (filters?.startDate) {
      query.andWhere('invoice.paid_date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('invoice.paid_date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(invoice.invoice_number ILIKE :search OR invoice.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query.orderBy('invoice.paid_date', 'DESC');

    const invoices = await query.getMany();

    // Calculate totals
    const totalEarnings = invoices.reduce(
      (sum, inv) => sum + Number(inv.influencerAmount),
      0,
    );
    const totalPlatformFees = invoices.reduce(
      (sum, inv) => sum + Number(inv.platformFee),
      0,
    );

    return {
      invoices,
      summary: {
        totalEarnings,
        totalPlatformFees,
        totalGross: totalEarnings + totalPlatformFees,
        count: invoices.length,
      },
    };
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['payment', 'company', 'influencer'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Get invoice by number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceNumber },
      relations: ['payment', 'company', 'influencer'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);

    invoice.status = status;

    if (status === InvoiceStatus.PAID && !invoice.paidDate) {
      invoice.paidDate = new Date();
    }

    return this.invoiceRepository.save(invoice);
  }

  /**
   * Generate invoice PDF data
   */
  async getInvoicePdfData(invoiceId: string) {
    const invoice = await this.getInvoiceById(invoiceId);

    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      status: invoice.status,
      company: {
        name: invoice.company?.name || invoice.company?.profile?.fullName || 'Company',
        email: invoice.company?.email || '',
      },
      influencer: {
        name: invoice.influencer?.name || invoice.influencer?.profile?.fullName || 'Influencer',
        email: invoice.influencer?.email || '',
      },
      lineItems: invoice.lineItems || [],
      amount: Number(invoice.amount),
      platformFee: Number(invoice.platformFee),
      influencerAmount: Number(invoice.influencerAmount),
      currency: invoice.currency,
      description: invoice.description,
      billingAddress: invoice.billingAddress,
    };
  }
}
