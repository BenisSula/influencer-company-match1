import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle, XCircle, Trash2, Ban, Search } from 'lucide-react';
import AdminPageHeader from '../../components/AdminPageHeader';
import { useToast } from '../../hooks/useToast';
import adminModerationService, {
  ContentFlag,
  UserBan,
} from '../../services/admin-moderation.service';
import './AdminModeration.css';

const AdminModeration: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'flagged' | 'reported' | 'banned' | 'stats'>('flagged');
  
  const [flaggedContent, setFlaggedContent] = useState<ContentFlag[]>([]);
  const [reportedUsers, setReportedUsers] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<UserBan[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<ContentFlag | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'TEMPORARY' | 'PERMANENT'>('TEMPORARY');
  const [banExpiry, setBanExpiry] = useState('');
  const [banNotes, setBanNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, contentTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'flagged') {
        const response = await adminModerationService.getFlaggedContent({
          status: statusFilter || undefined,
          contentType: contentTypeFilter || undefined,
        }) as { data: ContentFlag[] };
        setFlaggedContent(response.data);
      } else if (activeTab === 'reported') {
        const response = await adminModerationService.getReportedUsers() as { data: any[] };
        setReportedUsers(response.data);
      } else if (activeTab === 'banned') {
        const response = await adminModerationService.getBannedUsers() as { data: UserBan[] };
        setBannedUsers(response.data);
      } else if (activeTab === 'stats') {
        const response = await adminModerationService.getModerationStats();
        setStats(response);
      }
    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (flagId: string, decision: 'APPROVED' | 'REJECTED' | 'REMOVED') => {
    try {
      setIsProcessing(true);
      await adminModerationService.reviewFlag(flagId, decision, reviewNotes);
      setSelectedFlag(null);
      setReviewNotes('');
      showToast(`Content ${decision.toLowerCase()} successfully`, 'success');
      loadData();
    } catch (error) {
      console.error('Failed to review flag:', error);
      showToast('Failed to review content', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedFlags.length === 0) {
      showToast('Please select flags to approve', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      await Promise.all(
        selectedFlags.map(flagId => 
          adminModerationService.reviewFlag(flagId, 'APPROVED', 'Bulk approved')
        )
      );
      setSelectedFlags([]);
      showToast(`${selectedFlags.length} flags approved`, 'success');
      loadData();
    } catch (error) {
      console.error('Failed to bulk approve:', error);
      showToast('Failed to bulk approve flags', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedFlags.length === 0) {
      showToast('Please select flags to reject', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      await Promise.all(
        selectedFlags.map(flagId => 
          adminModerationService.reviewFlag(flagId, 'REJECTED', 'Bulk rejected')
        )
      );
      setSelectedFlags([]);
      showToast(`${selectedFlags.length} flags rejected`, 'success');
      loadData();
    } catch (error) {
      console.error('Failed to bulk reject:', error);
      showToast('Failed to bulk reject flags', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlagSelection = (flagId: string) => {
    setSelectedFlags(prev => 
      prev.includes(flagId) 
        ? prev.filter(id => id !== flagId)
        : [...prev, flagId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFlags.length === flaggedContent.length) {
      setSelectedFlags([]);
    } else {
      setSelectedFlags(flaggedContent.map(flag => flag.id));
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) {
      showToast('Please provide a reason for the ban', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      await adminModerationService.banUser(
        selectedUser.user.id,
        banReason,
        banType,
        banExpiry || undefined,
        banNotes || undefined,
      );
      setBanModalOpen(false);
      setSelectedUser(null);
      setBanReason('');
      setBanType('TEMPORARY');
      setBanExpiry('');
      setBanNotes('');
      showToast('User banned successfully', 'success');
      loadData();
    } catch (error: any) {
      console.error('Failed to ban user:', error);
      showToast(error.response?.data?.message || 'Failed to ban user', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      setIsProcessing(true);
      await adminModerationService.unbanUser(userId);
      showToast('User unbanned successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Failed to unban user:', error);
      showToast('Failed to unban user', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      case 'REMOVED':
        return 'status-removed';
      default:
        return '';
    }
  };

  const headerActions = (
    <>
      {activeTab === 'flagged' && selectedFlags.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedFlags.length} selected</span>
          <button 
            className="admin-btn admin-btn-success admin-btn-small"
            onClick={handleBulkApprove}
            disabled={isProcessing}
          >
            <CheckCircle size={16} />
            Approve All
          </button>
          <button 
            className="admin-btn admin-btn-danger admin-btn-small"
            onClick={handleBulkReject}
            disabled={isProcessing}
          >
            <XCircle size={16} />
            Reject All
          </button>
        </div>
      )}
      <button 
        className="admin-btn admin-btn-secondary" 
        onClick={loadData}
        disabled={loading || isProcessing}
      >
        <RefreshCw size={20} className={loading ? 'spinning' : ''} />
        Refresh
      </button>
    </>
  );

  if (loading && !stats) {
    return (
      <div className="admin-moderation">
        <AdminPageHeader
          title="Content Moderation"
          subtitle="Review flagged content and manage user reports"
          actions={headerActions}
          loading={true}
        />
        <div className="moderation-loading">Loading moderation data...</div>
      </div>
    );
  }

  return (
    <div className="admin-moderation">
      <AdminPageHeader
        title="Content Moderation"
        subtitle="Review flagged content and manage user reports"
        actions={headerActions}
        loading={loading}
      />

      <div className="moderation-tabs">
        <button
          className={activeTab === 'flagged' ? 'active' : ''}
          onClick={() => setActiveTab('flagged')}
        >
          Flagged Content
        </button>
        <button
          className={activeTab === 'reported' ? 'active' : ''}
          onClick={() => setActiveTab('reported')}
        >
          Reported Users
        </button>
        <button
          className={activeTab === 'banned' ? 'active' : ''}
          onClick={() => setActiveTab('banned')}
        >
          Banned Users
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      <div className="moderation-content">
        {activeTab === 'flagged' && (
          <div className="flagged-content-tab">
            <div className="filters">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search flagged content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="REMOVED">Removed</option>
              </select>

              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="POST">Posts</option>
                <option value="COMMENT">Comments</option>
                <option value="MESSAGE">Messages</option>
                <option value="PROFILE">Profiles</option>
              </select>

              {statusFilter === 'PENDING' && flaggedContent.length > 0 && (
                <button
                  className="admin-btn admin-btn-outline admin-btn-small"
                  onClick={toggleSelectAll}
                >
                  {selectedFlags.length === flaggedContent.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            <div className="flagged-list">
              {flaggedContent.length === 0 ? (
                <div className="empty-state">No flagged content found</div>
              ) : (
                flaggedContent.map((flag) => (
                  <div key={flag.id} className="flag-card">
                    {flag.status === 'PENDING' && (
                      <div className="flag-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFlags.includes(flag.id)}
                          onChange={() => toggleFlagSelection(flag.id)}
                        />
                      </div>
                    )}
                    <div className="flag-header">
                      <div className="flag-type">{flag.contentType}</div>
                      <div className={`flag-status ${getStatusBadgeClass(flag.status)}`}>
                        {flag.status}
                      </div>
                    </div>

                    <div className="flag-body">
                      <div className="flag-info">
                        <strong>Reason:</strong> {flag.reason}
                      </div>
                      {flag.description && (
                        <div className="flag-info">
                          <strong>Description:</strong> {flag.description}
                        </div>
                      )}
                      <div className="flag-info">
                        <strong>Reported by:</strong> {flag.reporter.fullName} ({flag.reporter.email})
                      </div>
                      <div className="flag-info">
                        <strong>Reported at:</strong> {new Date(flag.createdAt).toLocaleString()}
                      </div>

                      {flag.content && (
                        <div className="flag-content-preview">
                          <strong>Content Preview:</strong>
                          <div className="content-text">
                            {flag.content.content || flag.content.text || 'No preview available'}
                          </div>
                        </div>
                      )}

                      {flag.reviewedBy && (
                        <div className="flag-review-info">
                          <strong>Reviewed by:</strong> {flag.reviewedBy.fullName}
                          <br />
                          <strong>Reviewed at:</strong> {new Date(flag.reviewedAt!).toLocaleString()}
                          {flag.reviewNotes && (
                            <>
                              <br />
                              <strong>Notes:</strong> {flag.reviewNotes}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {flag.status === 'PENDING' && (
                      <div className="flag-actions">
                        <button
                          className="admin-btn admin-btn-primary admin-btn-small"
                          onClick={() => setSelectedFlag(flag)}
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reported' && (
          <div className="reported-users-tab">
            <div className="reported-list">
              {reportedUsers.length === 0 ? (
                <div className="empty-state">No reported users found</div>
              ) : (
                reportedUsers.map((item) => (
                  <div key={item.user.id} className="reported-card">
                    <div className="reported-header">
                      <div className="user-info">
                        <strong>{item.user.fullName}</strong>
                        <span className="user-email">{item.user.email}</span>
                      </div>
                      <div className="report-count">{item.reportCount} reports</div>
                    </div>
                    <div className="reported-actions">
                      <button
                        className="admin-btn admin-btn-danger admin-btn-small"
                        onClick={() => {
                          setSelectedUser(item);
                          setBanModalOpen(true);
                        }}
                      >
                        <Ban size={16} />
                        Ban User
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-small"
                        onClick={() => navigate(`/profile/${item.user.id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'banned' && (
          <div className="banned-users-tab">
            <div className="banned-list">
              {bannedUsers.length === 0 ? (
                <div className="empty-state">No banned users found</div>
              ) : (
                bannedUsers.map((ban) => (
                  <div key={ban.id} className="banned-card">
                    <div className="banned-header">
                      <div className="user-info">
                        <strong>{ban.user.fullName}</strong>
                        <span className="user-email">{ban.user.email}</span>
                      </div>
                      <div className={`ban-type ${ban.type.toLowerCase()}`}>
                        {ban.type}
                      </div>
                    </div>

                    <div className="banned-body">
                      <div className="ban-info">
                        <strong>Reason:</strong> {ban.reason}
                      </div>
                      {ban.notes && (
                        <div className="ban-info">
                          <strong>Notes:</strong> {ban.notes}
                        </div>
                      )}
                      <div className="ban-info">
                        <strong>Banned by:</strong> {ban.bannedBy.fullName}
                      </div>
                      <div className="ban-info">
                        <strong>Banned at:</strong> {new Date(ban.createdAt).toLocaleString()}
                      </div>
                      {ban.expiresAt && (
                        <div className="ban-info">
                          <strong>Expires at:</strong> {new Date(ban.expiresAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {ban.isActive && (
                      <div className="banned-actions">
                        <button
                          className="admin-btn admin-btn-success admin-btn-small"
                          onClick={() => handleUnbanUser(ban.user.id)}
                          disabled={isProcessing}
                        >
                          <CheckCircle size={16} />
                          Unban User
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="stats-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🚩</div>
                <div className="stat-info">
                  <div className="stat-label">Pending Flags</div>
                  <div className="stat-value">{stats.pendingFlags}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-label">Total Flags</div>
                  <div className="stat-value">{stats.totalFlags}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🚫</div>
                <div className="stat-info">
                  <div className="stat-label">Active Bans</div>
                  <div className="stat-value">{stats.activeBans}</div>
                </div>
              </div>
            </div>

            <div className="stats-charts">
              <div className="chart-card">
                <h3>Flags by Content Type</h3>
                <div className="chart-list">
                  {stats.flagsByType.map((item: any) => (
                    <div key={item.type} className="chart-item">
                      <span className="chart-label">{item.type}</span>
                      <span className="chart-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Flags by Reason</h3>
                <div className="chart-list">
                  {stats.flagsByReason.map((item: any) => (
                    <div key={item.reason} className="chart-item">
                      <span className="chart-label">{item.reason}</span>
                      <span className="chart-value">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedFlag && (
        <div className="modal-overlay" onClick={() => setSelectedFlag(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Flagged Content</h2>
              <button className="modal-close" onClick={() => setSelectedFlag(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="review-info">
                <strong>Content Type:</strong> {selectedFlag.contentType}
                <br />
                <strong>Reason:</strong> {selectedFlag.reason}
                <br />
                <strong>Description:</strong> {selectedFlag.description || 'N/A'}
              </div>

              <div className="form-group">
                <label>Review Notes:</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="admin-btn admin-btn-success"
                onClick={() => handleReview(selectedFlag.id, 'APPROVED')}
                disabled={isProcessing}
              >
                <CheckCircle size={20} />
                Approve (Keep Content)
              </button>
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => handleReview(selectedFlag.id, 'REJECTED')}
                disabled={isProcessing}
              >
                <XCircle size={20} />
                Reject (False Report)
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={() => handleReview(selectedFlag.id, 'REMOVED')}
                disabled={isProcessing}
              >
                <Trash2 size={20} />
                Remove Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {banModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setBanModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ban User</h2>
              <button className="modal-close" onClick={() => setBanModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="user-info-modal">
                <strong>User:</strong> {selectedUser.user.fullName} ({selectedUser.user.email})
                <br />
                <strong>Reports:</strong> {selectedUser.reportCount}
              </div>

              <div className="form-group">
                <label>Ban Type:</label>
                <select value={banType} onChange={(e) => setBanType(e.target.value as any)}>
                  <option value="TEMPORARY">Temporary</option>
                  <option value="PERMANENT">Permanent</option>
                </select>
              </div>

              {banType === 'TEMPORARY' && (
                <div className="form-group">
                  <label>Expires At:</label>
                  <input
                    type="datetime-local"
                    value={banExpiry}
                    onChange={(e) => setBanExpiry(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Reason: *</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter ban reason..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Notes:</label>
                <textarea
                  value={banNotes}
                  onChange={(e) => setBanNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="admin-btn admin-btn-secondary" 
                onClick={() => setBanModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="admin-btn admin-btn-danger" 
                onClick={handleBanUser}
                disabled={isProcessing}
              >
                <Ban size={20} />
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
