import React from 'react';
import { ApplicationStatus } from '../../types/campaign.types';
import {
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiArrowCircleLeft,
} from 'react-icons/hi';
import './ApplicationStatusBadge.css';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  [ApplicationStatus.PENDING]: {
    label: 'Pending Review',
    shortLabel: 'Pending',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: <HiClock />,
  },
  [ApplicationStatus.ACCEPTED]: {
    label: 'Accepted',
    shortLabel: 'Accepted',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: <HiCheckCircle />,
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    shortLabel: 'Rejected',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: <HiXCircle />,
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Withdrawn',
    shortLabel: 'Withdrawn',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: <HiArrowCircleLeft />,
  },
};

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  showLabel = true,
  size = 'md',
}) => {
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <span
      className={`application-status-badge status-${status.toLowerCase()} size-${size}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
      }}
    >
      <span className="status-icon">{config.icon}</span>
      {showLabel && <span className="status-label">{config.shortLabel}</span>}
    </span>
  );
};

