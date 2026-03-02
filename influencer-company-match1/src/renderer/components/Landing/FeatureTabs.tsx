/**
 * FeatureTabs Component
 * Interactive tabbed interface for showcasing platform features
 * with auto-rotation and smooth transitions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { FeatureCategory } from '../../data/landing/features';
import { AnimatedStatCounter } from './AnimatedStatCounter';
import './FeatureTabs.css';

interface FeatureTabsProps {
  categories: FeatureCategory[];
  defaultTab?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
  onTabChange?: (tabId: string) => void;
  onDemoClick?: (featureId: string) => void;
  realMetrics?: {
    aiMatching?: any;
    communication?: any;
    analytics?: any;
    campaigns?: any;
    trustSafety?: any;
  };
}

export const FeatureTabs: React.FC<FeatureTabsProps> = ({
  categories,
  defaultTab,
  autoRotate = true,
  rotateInterval = 5000,
  onTabChange,
  onDemoClick,
  realMetrics
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || categories[0]?.id);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeCategory = categories.find(cat => cat.id === activeTab);

  // Helper function to get real stat value or fallback to hardcoded
  const getStatValue = (categoryId: string, featureId: string, statLabel: string, fallbackValue: string): string => {
    if (!realMetrics) return fallbackValue;

    // AI Matching Category
    if (categoryId === 'matching' && realMetrics.aiMatching) {
      const mapping: Record<string, string> = {
        'Accuracy': realMetrics.aiMatching.matchAccuracy,
        'Factors Analyzed': realMetrics.aiMatching.factorsAnalyzed,
        'Avg Match Time': realMetrics.aiMatching.avgMatchTime,
        'Avg Matches/Day': realMetrics.aiMatching.totalMatches,
        'Success Rate': realMetrics.aiMatching.successRate,
        'User Satisfaction': realMetrics.aiMatching.userSatisfaction,
        'Match to Message': realMetrics.aiMatching.matchToMessageRate
      };
      return mapping[statLabel] || fallbackValue;
    }

    // Communication Category
    if (categoryId === 'communication' && realMetrics.communication) {
      const mapping: Record<string, string> = {
        'Avg Response Time': realMetrics.communication.avgResponseTime,
        'Messages/Day': realMetrics.communication.messagesPerDay,
        'Acceptance Rate': realMetrics.aiMatching?.successRate || fallbackValue,
        'Avg Negotiation': '2.3 days', // Could calculate from message timestamps
        'Total Messages': realMetrics.communication.totalMessages,
        'Active Conversations': realMetrics.communication.activeConversations,
        'Delivery Rate': realMetrics.communication.messageDeliveryRate
      };
      return mapping[statLabel] || fallbackValue;
    }

    // Analytics Category
    if (categoryId === 'analytics' && realMetrics.analytics) {
      const mapping: Record<string, string> = {
        'Metrics Tracked': realMetrics.analytics.metricsTracked,
        'Active Campaigns': realMetrics.analytics.activeCampaigns,
        'Update Frequency': realMetrics.analytics.dataRefreshRate,
        'Data Retention': 'Unlimited',
        'Insights Generated': '100+',
        'Total Users': realMetrics.analytics.totalUsers,
        'Total Posts': realMetrics.analytics.totalPosts,
        'Report Generation': realMetrics.analytics.reportGeneration
      };
      return mapping[statLabel] || fallbackValue;
    }

    // Campaigns Category - NOW FULLY MAPPED
    if (categoryId === 'campaigns' && realMetrics.campaigns) {
      const mapping: Record<string, string> = {
        'Active Campaigns': realMetrics.campaigns.activeCampaigns,
        'Avg Campaign ROI': realMetrics.campaigns.avgCampaignROI,
        'Influencers': realMetrics.campaigns.totalInfluencers,
        'Filter Options': '20+', // Static marketing content
        'Success Rate': realMetrics.campaigns.successRate,
        'Total Campaigns': realMetrics.campaigns.totalCampaigns,
        'Completed Campaigns': realMetrics.campaigns.completedCampaigns,
        'Application Rate': realMetrics.campaigns.applicationRate
      };
      return mapping[statLabel] || fallbackValue;
    }

    // Trust & Safety Category - NOW FULLY MAPPED
    if (categoryId === 'trust' && realMetrics.trustSafety) {
      const mapping: Record<string, string> = {
        'Verified Users': realMetrics.trustSafety.verifiedUsers,
        'Fraud Rate': realMetrics.trustSafety.fraudRate,
        'Transactions': realMetrics.trustSafety.transactionVolume,
        'Dispute Rate': realMetrics.trustSafety.disputeRate,
        'Security Score': realMetrics.trustSafety.securityScore,
        'Total Verified': realMetrics.trustSafety.totalVerified,
        'Total Transactions': realMetrics.trustSafety.totalTransactions
      };
      return mapping[statLabel] || fallbackValue;
    }

    return fallbackValue;
  };

  // Auto-rotation logic
  useEffect(() => {
    if (!autoRotate || isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next tab
          const currentIndex = categories.findIndex(cat => cat.id === activeTab);
          const nextIndex = (currentIndex + 1) % categories.length;
          setActiveTab(categories[nextIndex].id);
          return 0;
        }
        return prev + (100 / (rotateInterval / 100));
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [autoRotate, isPaused, activeTab, categories, rotateInterval]);

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setProgress(0);
    setIsPaused(true);
    onTabChange?.(tabId);
    
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  }, [onTabChange]);

  const handleDemoClick = useCallback((featureId: string) => {
    onDemoClick?.(featureId);
  }, [onDemoClick]);

  if (!activeCategory) return null;

  return (
    <div className="feature-tabs">
      {/* Tab Navigation */}
      <div className="feature-tabs__nav">
        <div className="feature-tabs__nav-inner">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = category.id === activeTab;
            
            return (
              <button
                key={category.id}
                className={`feature-tabs__tab ${isActive ? 'feature-tabs__tab--active' : ''}`}
                onClick={() => handleTabClick(category.id)}
                style={{
                  '--tab-color': category.color
                } as React.CSSProperties}
                aria-selected={isActive}
                role="tab"
              >
                <div className="feature-tabs__tab-icon">
                  <Icon size={20} />
                </div>
                <span className="feature-tabs__tab-label">{category.label}</span>
                
                {/* Progress indicator for active tab */}
                {isActive && autoRotate && !isPaused && (
                  <div 
                    className="feature-tabs__tab-progress"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="feature-tabs__content" role="tabpanel">
        <div className="feature-tabs__features">
          {activeCategory.features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="feature-demo-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Screenshot/Visual */}
              <div className="feature-demo-card__visual">
                <div 
                  className="feature-demo-card__screenshot"
                  style={{ backgroundImage: `url(${feature.screenshot})` }}
                >
                  {feature.video && (
                    <button 
                      className="feature-demo-card__play-btn"
                      onClick={() => handleDemoClick(feature.id)}
                      aria-label={`Watch ${feature.title} demo`}
                    >
                      <Play size={24} />
                      <span>Watch Demo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="feature-demo-card__content">
                <h3 className="feature-demo-card__title">{feature.title}</h3>
                <p className="feature-demo-card__description">{feature.description}</p>

                {/* Benefits List */}
                <ul className="feature-demo-card__benefits">
                  {feature.benefits.slice(0, 4).map((benefit, idx) => (
                    <li key={idx} className="feature-demo-card__benefit">
                      <CheckCircle size={16} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Stats */}
                {feature.stats && feature.stats.length > 0 && (
                  <div className="feature-demo-card__stats">
                    {feature.stats.map((stat, idx) => {
                      const statValue = getStatValue(activeCategory.id, feature.id, stat.label, stat.value);
                      
                      // Check if value can be animated (simple number with % or +)
                      const numMatch = statValue.match(/^(\d+)([%+]?)$/);
                      const canAnimate = numMatch !== null;
                      
                      return (
                        <div key={idx} className="feature-demo-card__stat">
                          <div className="feature-demo-card__stat-value">
                            {canAnimate ? (
                              <AnimatedStatCounter 
                                end={parseInt(numMatch[1])} 
                                suffix={numMatch[2]}
                              />
                            ) : (
                              statValue
                            )}
                          </div>
                          <div className="feature-demo-card__stat-label">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pause/Resume Control */}
      {autoRotate && (
        <button
          className="feature-tabs__control"
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
        >
          {isPaused ? 'Resume' : 'Pause'} Auto-Rotation
        </button>
      )}
    </div>
  );
};
