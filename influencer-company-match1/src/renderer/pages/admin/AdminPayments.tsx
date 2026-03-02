import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, TrendingUp, Download, Eye, RefreshCw } from 'lucide-react';
import adminAnalyticsService from '../../services/admin-analytics.service';
import { ConfirmationModal } from '../../components/ConfirmationModal/ConfirmationModal';
import { useToast } from '../../hooks/useToast';
import './AdminPayments.css';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingPayments: number;
}

interface Transaction {
  id: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  amount: number;
  status: string;
  type: string;
}

export const AdminPayments: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadPaymentStats();
    loadTransactions();
  }, []);

  const loadPaymentStats = async () => {
    try {
      setLoading(true);
      const revenueData = await adminAnalyticsService.getRevenueStats();
      
      setStats({
        totalRevenue: parseFloat(revenueData.totalRevenue || '0'),
        monthlyRevenue: parseFloat(revenueData.mrr || '0'),
        activeSubscriptions: revenueData.activeSubscriptions || 0,
        pendingPayments: 0, // TODO: Add pending payments count to backend
      });
    } catch (error) {
      console.error('Failed to load payment stats:', error);
      showToast('Failed to load payment stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      // Mock data for now - replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          createdAt: new Date().toISOString(),
          user: { fullName: 'John Doe', email: 'john@example.com' },
          amount: 99.99,
          status: 'COMPLETED',
          type: 'SUBSCRIPTION',
        },
        {
          id: '2',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          user: { fullName: 'Jane Smith', email: 'jane@example.com' },
          amount: 49.99,
          status: 'COMPLETED',
          type: 'ONE_TIME',
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleExportReport = async () => {
    try {
      showToast('Generating report...', 'info');
      // Mock export - replace with actual API call
      const csvContent = 'Date,User,Amount,Status,Type\n' +
        transactions.map(tx => 
          `${new Date(tx.createdAt).toLocaleDateString()},${tx.user.fullName},$${tx.amount},${tx.status},${tx.type}`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Report exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export report', 'error');
    }
  };

  const handleRefund = async () => {
    if (!selectedTransaction) return;
    
    try {
      showToast('Processing refund...', 'info');
      // Mock refund - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Refund processed successfully', 'success');
      setShowRefundModal(false);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error('Refund failed:', error);
      showToast('Failed to process refund', 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner"></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="admin-payments">
      <header className="admin-page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1><CreditCard size={28} /> Payment Management</h1>
        </div>
        <div className="header-actions">
          <button className="admin-btn admin-btn-secondary" onClick={handleExportReport}>
            <Download size={20} /> Export Report
          </button>
        </div>
      </header>

      <div className="admin-payments-content">
        <div className="payment-stats-grid">
          <div className="payment-stat-card">
            <div className="stat-icon stat-icon-primary">
              <DollarSign size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">${stats?.totalRevenue.toLocaleString()}</h3>
              <p className="stat-label">Total Revenue</p>
            </div>
          </div>

          <div className="payment-stat-card">
            <div className="stat-icon stat-icon-success">
              <TrendingUp size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">${stats?.monthlyRevenue.toLocaleString()}</h3>
              <p className="stat-label">Monthly Revenue</p>
            </div>
          </div>

          <div className="payment-stat-card">
            <div className="stat-icon stat-icon-info">
              <CreditCard size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats?.activeSubscriptions}</h3>
              <p className="stat-label">Active Subscriptions</p>
            </div>
          </div>

          <div className="payment-stat-card">
            <div className="stat-icon stat-icon-warning">
              <CreditCard size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats?.pendingPayments}</h3>
              <p className="stat-label">Pending Payments</p>
            </div>
          </div>
        </div>

        <div className="recent-transactions">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="admin-btn admin-btn-outline admin-btn-small" onClick={loadTransactions}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
          
          {loadingTransactions ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={48} />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="user-cell">
                          <span className="user-name">{tx.user.fullName}</span>
                          <span className="user-email">{tx.user.email}</span>
                        </div>
                      </td>
                      <td className="amount-cell">${tx.amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${tx.status.toLowerCase()}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>{tx.type}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="admin-btn admin-btn-info admin-btn-small" 
                            title="View Details"
                          >
                            <Eye size={16} /> View
                          </button>
                          {tx.status === 'COMPLETED' && (
                            <button 
                              className="admin-btn admin-btn-danger admin-btn-small" 
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setShowRefundModal(true);
                              }}
                              title="Refund Transaction"
                            >
                              <RefreshCw size={16} /> Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleRefund}
        title="Confirm Refund"
        message={`Are you sure you want to refund $${selectedTransaction?.amount.toFixed(2)} to ${selectedTransaction?.user.fullName}? This action cannot be undone.`}
        confirmText="Refund"
        confirmVariant="danger"
      />
    </div>
  );
};

export default AdminPayments;
