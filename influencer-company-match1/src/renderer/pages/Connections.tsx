import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Avatar } from '../components';
import { CollaborationFeedbackModal } from '../components/CollaborationFeedbackModal/CollaborationFeedbackModal';
import { PaymentSetupModal } from '../components/PaymentSetupModal/PaymentSetupModal';
import { ReviewForm } from '../components/ReviewForm/ReviewForm';
import { useCollaborationOutcomes } from '../hooks/useCollaborationOutcomes';
import { useAuth } from '../contexts/AuthContext';
import { matchingService } from '../services/matching.service';
import { reviewsService } from '../services/reviews.service';
import { useNavigate } from 'react-router-dom';
import './Connections.css';

export const Connections: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [paymentSetupData, setPaymentSetupData] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ profileId: string; connectionId: string; partnerName: string } | null>(null);
  const { recordOutcome, checkExistingOutcome } = useCollaborationOutcomes();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await matchingService.getMyConnections();
      setConnections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load connections:', error);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  // Separate collaboration requests from regular connections
  const collaborationRequests = connections.filter(c => 
    c.collaboration_status === 'requested' || c.collaborationStatus === 'requested'
  );
  
  const activeConnections = connections.filter(c => {
    const status = c.collaboration_status || c.collaborationStatus;
    // Include connections that are active OR have no collaboration status (regular connections)
    return status === 'active' || (!status && c.status === 'accepted');
  });

  const completedConnections = connections.filter(c => {
    const status = c.collaboration_status || c.collaborationStatus;
    return status === 'completed';
  });

  // Show notification toast
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleAcceptCollaboration = async (connectionId: string) => {
    try {
      setLoading(true);
      const result: any = await matchingService.acceptCollaborationRequest(connectionId);
      
      // Get partner info
      const partner = result.connection?.requester || result.connection?.recipient;
      const partnerName = partner?.name || 'your partner';
      
      // Handle payment error - show error and offer setup
      if (result.paymentError) {
        showToast('error', `Payment setup failed: ${result.paymentError}`);
        
        // Show payment setup modal to help user fix the issue
        setPaymentSetupData({
          collaborationId: connectionId,
          partnerName,
          userRole: user?.role === 'COMPANY' ? 'company' : 'influencer',
        });
        setShowPaymentSetup(true);
        return;
      }
      
      // Reload connections to show updated status
      await loadConnections();
      
      // Check if payment is required and redirect to checkout
      if (result.requiresPayment && result.paymentInfo) {
        showToast('success', 'Collaboration accepted! Redirecting to payment...');
        setTimeout(() => {
          navigate(`/payments/checkout/${result.paymentInfo.collaborationId}`);
        }, 1500);
        return;
      }
      
      // Success - no payment required
      showToast('success', `Collaboration accepted! You can now message ${partnerName}.`);
      
      // Navigate to messages if conversation was created
      if (result.conversationId) {
        setTimeout(() => {
          navigate(`/messages?conversation=${result.conversationId}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Failed to accept collaboration:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      showToast('error', `Failed to accept collaboration: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCollaboration = async (connectionId: string) => {
    if (!confirm('Are you sure you want to decline this collaboration request?')) {
      return;
    }

    try {
      setLoading(true);
      await matchingService.rejectCollaborationRequest(connectionId);
      
      // Reload connections to remove from pending
      await loadConnections();
      
      showToast('success', 'Collaboration request declined');
    } catch (error) {
      console.error('Failed to reject collaboration:', error);
      showToast('error', 'Failed to decline collaboration request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRateConnection = async (connection: any) => {
    // Check if already rated
    try {
      const existingOutcome = await checkExistingOutcome(connection.id);
      
      if (existingOutcome) {
        showToast('error', 'You have already rated this collaboration!');
        return;
      }
    } catch (error) {
      console.error('Error checking existing outcome:', error);
    }

    setSelectedConnection(connection);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      await recordOutcome(feedbackData);
      setFeedbackModalOpen(false);
      showToast('success', 'Thank you for your feedback! The AI will learn from this to improve future matches.');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showToast('error', 'Failed to submit feedback. Please try again.');
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleSendMessage = (connection: any) => {
    navigate(`/messages?conversation=${connection.conversationId}`);
  };

  const handleLeaveReview = (connection: any) => {
    const partner = connection.requester || connection.recipient || connection.partner;
    const partnerProfile = partner?.influencerProfile || partner?.companyProfile || partner?.profile || partner;
    
    setReviewTarget({
      profileId: partner?.id || partner?.userId,
      connectionId: connection.id,
      partnerName: partnerProfile?.name || partner?.name || 'Unknown User',
    });
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = async () => {
    setReviewModalOpen(false);
    setReviewTarget(null);
    showToast('success', 'Review submitted successfully! Thank you for your feedback.');
    await loadConnections();
  };

  if (loading) {
    return (
      <div className="connections-page">
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading connections...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="connections-page">
      <Card>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#050505', margin: 0 }}>
            My Connections
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#65676B', margin: '0.5rem 0 0' }}>
            {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
            {collaborationRequests.length > 0 && (
              <span style={{ color: '#F57C00', fontWeight: '600', marginLeft: '0.5rem' }}>
                • {collaborationRequests.length} pending {collaborationRequests.length === 1 ? 'request' : 'requests'}
              </span>
            )}
          </p>
        </CardHeader>
        <CardBody>
          {/* Collaboration Requests Section */}
          {collaborationRequests.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #F57C00'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🕐</span>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#050505',
                  margin: 0 
                }}>
                  Pending Collaboration Requests ({collaborationRequests.length})
                </h3>
              </div>

              <div className="collaboration-requests-list">
                {collaborationRequests.map((request) => {
                  const partner = request.requester || request.recipient;
                  // Handle both snake_case and camelCase
                  const data = request.collaboration_request_data || request.collaborationRequestData || {};
                  
                  return (
                    <div key={request.id} className="collaboration-request-detail-card">
                      <div className="collaboration-request-header">
                        <Avatar
                          src={partner?.avatarUrl}
                          name={partner?.name || 'Unknown'}
                          size="lg"
                        />
                        <div className="collaboration-request-header-info">
                          <h4>{partner?.name || 'Unknown User'}</h4>
                          <p>{partner?.niche || partner?.industry || 'No niche specified'}</p>
                        </div>
                      </div>

                      <div className="collaboration-request-details">
                        {data.collaborationType && (
                          <div className="collaboration-detail-item">
                            <span className="collaboration-detail-label">Type:</span>
                            <span className="collaboration-detail-value collaboration-type-badge">
                              {data.collaborationType.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}

                        {data.budgetMin && data.budgetMax && (
                          <div className="collaboration-detail-item">
                            <span className="collaboration-detail-label">Budget:</span>
                            <span className="collaboration-detail-value collaboration-budget-value">
                              ${data.budgetMin} - ${data.budgetMax}
                            </span>
                          </div>
                        )}

                        {data.timeline && (
                          <div className="collaboration-detail-item">
                            <span className="collaboration-detail-label">Timeline:</span>
                            <span className="collaboration-detail-value">{data.timeline}</span>
                          </div>
                        )}

                        {data.message && (
                          <div className="collaboration-message">
                            <span className="collaboration-detail-label">Message:</span>
                            <p className="collaboration-message-text">{data.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="collaboration-request-actions">
                        <Button
                          variant="primary"
                          onClick={() => handleAcceptCollaboration(request.id)}
                          disabled={loading}
                          style={{ flex: 1 }}
                        >
                          {loading ? 'Processing...' : '✓ Accept Collaboration'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleRejectCollaboration(request.id)}
                          disabled={loading}
                          style={{ flex: 1 }}
                        >
                          ✕ Decline
                        </Button>
                      </div>

                      <div className="collaboration-request-footer">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewProfile(partner.id)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSendMessage(request)}
                        >
                          Send Message
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRateConnection(request)}
                        >
                          ⭐ Rate Partner
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Connections Section */}
          {activeConnections.length === 0 && collaborationRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ fontSize: '1.125rem', color: '#65676B', marginBottom: '1rem' }}>
                No connections yet
              </p>
              <p style={{ fontSize: '0.9375rem', color: '#65676B', marginBottom: '1.5rem' }}>
                Start matching to build your network!
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/matches')}
              >
                Find Matches
              </Button>
            </div>
          ) : activeConnections.length > 0 ? (
            <>
              {collaborationRequests.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #2E7D32'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>✓</span>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: '#050505',
                    margin: 0 
                  }}>
                    My Connections ({activeConnections.length})
                  </h3>
                </div>
              )}
              
              <div className="collaboration-requests-list">
                {activeConnections.map((connection) => {
                  // Get partner info - could be requester or recipient depending on current user
                  const partner = connection.requester || connection.recipient || connection.partner;
                  const partnerProfile = partner?.influencerProfile || partner?.companyProfile || partner?.profile || partner;
                  // Handle both snake_case and camelCase
                  const data = connection.collaboration_request_data || connection.collaborationRequestData || {};
                  
                  return (
                    <div key={connection.id} className="collaboration-request-detail-card">
                      <div className="collaboration-request-header">
                        <Avatar
                          src={partnerProfile?.avatarUrl || partner?.avatarUrl}
                          name={partnerProfile?.name || partner?.name || 'Unknown'}
                          size="lg"
                        />
                        <div className="collaboration-request-header-info">
                          <h4>{partnerProfile?.name || partner?.name || 'Unknown User'}</h4>
                          <p>{partnerProfile?.niche || partnerProfile?.industry || partner?.niche || partner?.industry || 'No niche specified'}</p>
                        </div>
                      </div>

                      {/* Project Title */}
                      {data.projectTitle && (
                        <div className="collaboration-project-title">
                          <h5>📋 {data.projectTitle}</h5>
                        </div>
                      )}

                      <div className="collaboration-request-details">
                        {data.collaborationType && (
                          <div className="collaboration-detail-item">
                            <span className="collaboration-detail-label">Type:</span>
                            <span className="collaboration-detail-value collaboration-type-badge">
                              {data.collaborationType.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}

                        {data.budgetMin && data.budgetMax && (
                          <div className="collaboration-detail-item">
                            <span className="collaboration-detail-label">💰 Budget:</span>
                            <span className="collaboration-detail-value collaboration-budget-value">
                              ${data.budgetMin.toLocaleString()} - ${data.budgetMax.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {data.timeline && (
                          <div className="collaboration-detail-item">
                            <span className="collaboration-detail-label">⏰ Timeline:</span>
                            <span className="collaboration-detail-value">{data.timeline}</span>
                          </div>
                        )}

                        {/* Date Range */}
                        {(data.startDate || data.endDate) && (
                          <div className="collaboration-detail-item">
                            <span className="collaboration-detail-label">📅 Duration:</span>
                            <span className="collaboration-detail-value">
                              {data.startDate && new Date(data.startDate).toLocaleDateString()}
                              {data.startDate && data.endDate && ' - '}
                              {data.endDate && new Date(data.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Platforms */}
                        {data.platforms && data.platforms.length > 0 && (
                          <div className="collaboration-detail-item collaboration-detail-full-width">
                            <span className="collaboration-detail-label">📱 Platforms:</span>
                            <div className="collaboration-platforms-list">
                              {data.platforms.map((platform: string) => (
                                <span key={platform} className="platform-badge">{platform}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Deliverables */}
                        {data.deliverables && data.deliverables.length > 0 && (
                          <div className="collaboration-detail-item collaboration-detail-full-width">
                            <span className="collaboration-detail-label">📦 Deliverables:</span>
                            <ul className="collaboration-deliverables-list">
                              {data.deliverables.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Project Description */}
                      {data.projectDescription && (
                        <div className="collaboration-project-description">
                          <span className="collaboration-detail-label">📝 Project Description:</span>
                          <p className="collaboration-description-text">{data.projectDescription}</p>
                        </div>
                      )}

                      {/* Message */}
                      {data.message && (
                        <div className="collaboration-message">
                          <span className="collaboration-detail-label">💬 Message:</span>
                          <p className="collaboration-message-text">{data.message}</p>
                        </div>
                      )}

                      {/* Additional Notes */}
                      {data.additionalNotes && (
                        <div className="collaboration-additional-notes">
                          <span className="collaboration-detail-label">📌 Additional Notes:</span>
                          <p className="collaboration-notes-text">{data.additionalNotes}</p>
                        </div>
                      )}

                      <div className="collaboration-request-footer">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewProfile(partner?.id || partner?.userId)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSendMessage(connection)}
                        >
                          Send Message
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRateConnection(connection)}
                        >
                          ⭐ Rate Collaboration
                        </Button>
                      </div>

                      <div className="connection-date" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: '#65676B' }}>
                        Connected {new Date(connection.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          {/* Completed Collaborations Section */}
          {completedConnections.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #1976D2'
              }}>
                <span style={{ fontSize: '1.25rem' }}>✓</span>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#050505',
                  margin: 0 
                }}>
                  Completed Collaborations ({completedConnections.length})
                </h3>
              </div>
              
              <div className="collaboration-requests-list">
                {completedConnections.map((connection) => {
                  const partner = connection.requester || connection.recipient || connection.partner;
                  const partnerProfile = partner?.influencerProfile || partner?.companyProfile || partner?.profile || partner;
                  const data = connection.collaboration_request_data || connection.collaborationRequestData || {};
                  
                  return (
                    <div key={connection.id} className="collaboration-request-detail-card">
                      <div className="collaboration-request-header">
                        <Avatar
                          src={partnerProfile?.avatarUrl || partner?.avatarUrl}
                          name={partnerProfile?.name || partner?.name || 'Unknown'}
                          size="lg"
                        />
                        <div className="collaboration-request-header-info">
                          <h4>{partnerProfile?.name || partner?.name || 'Unknown User'}</h4>
                          <p>{partnerProfile?.niche || partnerProfile?.industry || partner?.niche || partner?.industry || 'No niche specified'}</p>
                          <span style={{ 
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            background: '#E3F2FD',
                            color: '#1976D2',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            ✓ Completed
                          </span>
                        </div>
                      </div>

                      {data.projectTitle && (
                        <div className="collaboration-project-title">
                          <h5>📋 {data.projectTitle}</h5>
                        </div>
                      )}

                      <div className="collaboration-request-footer">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewProfile(partner?.id || partner?.userId)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleLeaveReview(connection)}
                        >
                          ⭐ Leave Review
                        </Button>
                      </div>

                      <div className="connection-date" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: '#65676B' }}>
                        Completed {new Date(connection.updatedAt || connection.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {feedbackModalOpen && selectedConnection && (
        <CollaborationFeedbackModal
          connectionId={selectedConnection.id}
          partnerName={selectedConnection.partner?.name || 'Unknown'}
          onClose={() => setFeedbackModalOpen(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {reviewModalOpen && reviewTarget && (
        <ReviewForm
          profileId={reviewTarget.profileId}
          connectionId={reviewTarget.connectionId}
          onSuccess={handleReviewSuccess}
          onCancel={() => {
            setReviewModalOpen(false);
            setReviewTarget(null);
          }}
        />
      )}

      <PaymentSetupModal
        isOpen={showPaymentSetup}
        collaborationId={paymentSetupData?.collaborationId || ''}
        partnerName={paymentSetupData?.partnerName}
        userRole={paymentSetupData?.userRole || 'influencer'}
        onClose={() => {
          setShowPaymentSetup(false);
          loadConnections();
        }}
      />

      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};
