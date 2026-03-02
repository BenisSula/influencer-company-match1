import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBriefcase, HiClock, HiCheckCircle } from 'react-icons/hi';
import { DashboardWidget } from '../DashboardWidget/DashboardWidget';
import { Avatar } from '../Avatar/Avatar';
import './CollaborationRequestsWidget.css';

interface CollaborationRequest {
  id: string;
  requester?: {
    id: string;
    name: string;
    avatarUrl?: string;
    niche?: string;
    industry?: string;
  };
  recipient?: {
    id: string;
    name: string;
    avatarUrl?: string;
    niche?: string;
    industry?: string;
  };
  status: string;
  collaborationStatus?: string;
  collaboration_status?: string; // Snake case from database
  collaboration_request_data?: {
    message?: string;
    timeline?: string;
    budgetMin?: number;
    budgetMax?: number;
    collaborationType?: string;
    projectTitle?: string;
    projectDescription?: string;
    startDate?: string;
    endDate?: string;
    deliverables?: string[];
    platforms?: string[];
    additionalNotes?: string;
  };
  createdAt: string;
}

interface CollaborationRequestsWidgetProps {
  requests: CollaborationRequest[];
  loading?: boolean;
  error?: string;
}

export const CollaborationRequestsWidget: React.FC<CollaborationRequestsWidgetProps> = ({
  requests,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  // Filter requests by collaboration status (not connection status)
  const pendingRequests = requests.filter(r => 
    r.collaboration_status === 'requested' || 
    r.collaborationStatus === 'requested'
  );
  const activeCollaborations = requests.filter(r => 
    r.collaboration_status === 'active' || 
    r.collaborationStatus === 'active'
  );

  const getStatusIcon = (status: string) => {
    if (status === 'pending' || status === 'requested') return <HiClock size={16} style={{ color: '#F57C00' }} />;
    if (status === 'active') return <HiCheckCircle size={16} style={{ color: '#2E7D32' }} />;
    return null;
  };

  return (
    <DashboardWidget
      title="Collaboration Requests"
      icon={<HiBriefcase size={20} />}
      action={{
        label: 'View All',
        onClick: () => navigate('/connections'),
      }}
      loading={loading}
      error={error}
    >
      {requests.length === 0 ? (
        <div className="collaboration-requests-empty">
          <HiBriefcase size={48} style={{ color: '#BDC1C6', marginBottom: '1rem' }} />
          <p>No collaboration requests yet</p>
        </div>
      ) : (
        <div className="collaboration-requests-content">
          {pendingRequests.length > 0 && (
            <div className="collaboration-requests-section">
              <div className="collaboration-requests-section-title">
                <HiClock size={16} style={{ color: '#F57C00' }} />
                Pending ({pendingRequests.length})
              </div>
              <div className="collaboration-requests-list">
                {pendingRequests.slice(0, 3).map((request) => {
                  const profile = request.requester || request.recipient;
                  return (
                    <div
                      key={request.id}
                      className="collaboration-request-item"
                      onClick={() => navigate('/connections')}
                    >
                      <Avatar
                        src={profile?.avatarUrl}
                        name={profile?.name || 'Unknown'}
                        size="sm"
                      />
                      <div className="collaboration-request-info">
                        <div className="collaboration-request-name">{profile?.name}</div>
                        
                        {/* Show collaboration type if available */}
                        {request.collaboration_request_data?.collaborationType && (
                          <div className="collaboration-type">
                            {request.collaboration_request_data.collaborationType.replace(/_/g, ' ')}
                          </div>
                        )}
                        
                        {/* Show budget range if available */}
                        {request.collaboration_request_data?.budgetMin && (
                          <div className="collaboration-budget">
                            ${request.collaboration_request_data.budgetMin} - ${request.collaboration_request_data.budgetMax}
                          </div>
                        )}
                        
                        <div className="collaboration-request-date">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getStatusIcon(request.collaboration_status || request.collaborationStatus || request.status)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeCollaborations.length > 0 && (
            <div className="collaboration-requests-section">
              <div className="collaboration-requests-section-title">
                <HiCheckCircle size={16} style={{ color: '#2E7D32' }} />
                Active ({activeCollaborations.length})
              </div>
              <div className="collaboration-requests-list">
                {activeCollaborations.slice(0, 3).map((request) => {
                  const profile = request.requester || request.recipient;
                  const data = request.collaboration_request_data || {};
                  
                  return (
                    <div
                      key={request.id}
                      className="collaboration-request-item"
                      onClick={() => navigate('/connections')}
                    >
                      <Avatar
                        src={profile?.avatarUrl}
                        name={profile?.name || 'Unknown'}
                        size="sm"
                      />
                      <div className="collaboration-request-info">
                        <div className="collaboration-request-name">{profile?.name}</div>
                        
                        {/* Show project title if available */}
                        {data.projectTitle && (
                          <div className="collaboration-project-title-widget">
                            📋 {data.projectTitle}
                          </div>
                        )}
                        
                        {/* Show collaboration type if available */}
                        {data.collaborationType && (
                          <div className="collaboration-type">
                            {data.collaborationType.replace(/_/g, ' ')}
                          </div>
                        )}
                        
                        {/* Show budget range if available */}
                        {data.budgetMin && data.budgetMax && (
                          <div className="collaboration-budget">
                            ${data.budgetMin} - ${data.budgetMax}
                          </div>
                        )}
                        
                        {/* Show platforms count if available */}
                        {data.platforms && data.platforms.length > 0 && (
                          <div className="collaboration-platforms-count">
                            📱 {data.platforms.length} platform{data.platforms.length > 1 ? 's' : ''}
                          </div>
                        )}
                        
                        {/* Show deliverables count if available */}
                        {data.deliverables && data.deliverables.length > 0 && (
                          <div className="collaboration-deliverables-count">
                            📦 {data.deliverables.length} deliverable{data.deliverables.length > 1 ? 's' : ''}
                          </div>
                        )}
                        
                        <div className="collaboration-request-date">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getStatusIcon('active')}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
};
