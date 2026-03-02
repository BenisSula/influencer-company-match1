import { apiClient } from './api-client';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  paymentId: string;
  companyId: string;
  influencerId: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  amount: number;
  platformFee: number;
  influencerAmount: number;
  currency: string;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  description?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  billingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  pdfUrl?: string;
  company?: any;
  influencer?: any;
  payment?: any;
}

export interface EarningsSummary {
  totalEarnings: number;
  totalPlatformFees: number;
  totalGross: number;
  count: number;
}

export interface EarningsResponse {
  invoices: Invoice[];
  summary: EarningsSummary;
}

class InvoiceService {
  /**
   * Get company invoices
   */
  async getCompanyInvoices(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Invoice[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get(`/invoices/company?${params.toString()}`);
    return response.data;
  }

  /**
   * Get influencer earnings
   */
  async getInfluencerEarnings(filters?: {
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<EarningsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get(`/invoices/earnings?${params.toString()}`);
    return response.data;
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice> {
    const response = await apiClient.get(`/invoices/${invoiceId}`);
    return response.data;
  }

  /**
   * Get invoice PDF data
   */
  async getInvoicePdfData(invoiceId: string): Promise<any> {
    const response = await apiClient.get(`/invoices/${invoiceId}/pdf-data`);
    return response.data;
  }

  /**
   * Create invoice from payment
   */
  async createInvoiceFromPayment(paymentId: string): Promise<Invoice> {
    const response = await apiClient.post(`/invoices/payment/${paymentId}`);
    return response.data;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors = {
      draft: '#6c757d',
      issued: '#0d6efd',
      paid: '#198754',
      cancelled: '#dc3545',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    const labels = {
      draft: 'Draft',
      issued: 'Issued',
      paid: 'Paid',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  }
}

export default new InvoiceService();
