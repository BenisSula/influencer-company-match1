import React, { useState, useEffect } from 'react';
import { FiDownload, FiSearch, FiFilter, FiFileText } from 'react-icons/fi';
import invoiceService, { Invoice } from '../services/invoice.service';
import { InvoicePDFDownload } from '../components/InvoicePDF/InvoicePDF';
import './Invoices.css';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, startDate, endDate]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getCompanyInvoices({
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchQuery || undefined,
      });
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadInvoices();
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      const data = await invoiceService.getInvoicePdfData(invoice.id);
      setPdfData(data);
      setSelectedInvoice(invoice);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Failed to load PDF data:', error);
    }
  };

  const calculateTotals = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const fees = invoices.reduce((sum, inv) => sum + inv.platformFee, 0);
    return { total, fees };
  };

  const { total, fees } = calculateTotals();

  return (
    <div className="invoices-page">
      <div className="invoices-header">
        <div className="header-content">
          <h1>
            <FiFileText /> Invoices
          </h1>
          <p>View and download all your payment invoices</p>
        </div>

        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-label">Total Paid</div>
            <div className="stat-value">
              {invoiceService.formatCurrency(total)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Platform Fees</div>
            <div className="stat-value">
              {invoiceService.formatCurrency(fees)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{invoices.length}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="invoices-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-input"
          placeholder="Start Date"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-input"
          placeholder="End Date"
        />

        <button onClick={handleSearch} className="btn btn-primary">
          <FiFilter /> Apply Filters
        </button>
      </div>

      {/* Invoices List */}
      <div className="invoices-list">
        {loading ? (
          <div className="loading-state">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={48} />
            <h3>No invoices found</h3>
            <p>Your invoices will appear here once payments are made</p>
          </div>
        ) : (
          <div className="invoices-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Influencer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="invoice-number">{invoice.invoiceNumber}</td>
                    <td>{invoiceService.formatDate(invoice.issueDate)}</td>
                    <td>
                      {invoice.influencer?.fullName || 'Unknown Influencer'}
                    </td>
                    <td className="amount">
                      {invoiceService.formatCurrency(invoice.amount)}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: invoiceService.getStatusColor(
                            invoice.status,
                          ),
                        }}
                      >
                        {invoiceService.getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownloadPdf(invoice)}
                        className="btn btn-sm btn-outline"
                      >
                        <FiDownload /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {showPdfModal && pdfData && (
        <div className="modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Download Invoice</h2>
              <button
                onClick={() => setShowPdfModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-preview">
                <h3>Invoice #{pdfData.invoiceNumber}</h3>
                <p>
                  Issue Date: {invoiceService.formatDate(pdfData.issueDate)}
                </p>
                <p>
                  Amount: {invoiceService.formatCurrency(pdfData.amount)}
                </p>
              </div>
              <div className="modal-actions">
                <InvoicePDFDownload data={pdfData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
