/**
 * FloatingProfileCard Component
 * 
 * Displays a floating profile card with animation.
 * Reuses existing Card and Avatar components for consistency.
 * Used in the animated dashboard mockup.
 * 
 * @example
 * <FloatingProfileCard
 *   name="Sarah M."
 *   role="Lifestyle Influencer"
 *   followers="250K followers"
 *   matchScore={93}
 *   position="left"
 * />
 */

import { Card, CardBody } from '../Card/Card';
import { Avatar } from '../Avatar/Avatar';
import './FloatingProfileCard.css';

interface FloatingProfileCardProps {
  name: string;
  role: string;
  followers: string;
  matchScore: number;
  avatarUrl?: string;
  position: 'left' | 'right';
  delay?: number;
}

export const FloatingProfileCard: React.FC<FloatingProfileCardProps> = ({
  name,
  role,
  followers,
  matchScore,
  avatarUrl,
  position,
  delay = 0
}) => {
  return (
    <Card 
      className={`floating-profile-card floating-${position}`}
      style={{ animationDelay: `${delay}s` }}
      shadow="xl"
      hover
    >
      <CardBody>
        <div className="floating-card-content">
          <Avatar
            src={avatarUrl}
            name={name}
            size="md"
            className="floating-avatar"
          />
          <div className="floating-info">
            <h4 className="floating-name">{name}</h4>
            <p className="floating-role">{role}</p>
            <p className="floating-followers">{followers}</p>
          </div>
          <div className="floating-score">
            <div className="score-value">{matchScore}%</div>
            <div className="score-label">Match</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
