import React from 'react';
import { Card, CardBody } from '../';
import { Skeleton } from '../Skeleton/Skeleton';
import './MatchCard.css';

export const MatchCardSkeleton: React.FC = () => {
  return (
    <Card className="match-card">
      <CardBody>
        <div className="match-card-header">
          <Skeleton width={56} height={56} circle />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height={20} style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="40%" height={16} />
          </div>
          <Skeleton width={70} height={60} />
        </div>

        <div className="match-stats">
          <Skeleton width="30%" height={16} />
          <Skeleton width="35%" height={16} />
          <Skeleton width="25%" height={16} />
        </div>

        <div className="match-platforms">
          <Skeleton width={80} height={24} />
          <Skeleton width={90} height={24} />
          <Skeleton width={70} height={24} />
        </div>

        <Skeleton width="100%" height={40} style={{ marginBottom: '1rem' }} />

        <div className="match-actions">
          <Skeleton width={100} height={32} />
          <Skeleton width={120} height={32} />
        </div>
      </CardBody>
    </Card>
  );
};
