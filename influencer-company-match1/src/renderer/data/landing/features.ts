/**
 * Landing Page Features Data
 * Centralized feature content for interactive demos
 */

import { Bot, MessageCircle, BarChart3, Target, Shield } from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  screenshot: string;
  video?: string;
  benefits: string[];
  stats?: {
    label: string;
    value: string;
  }[];
}

export interface FeatureCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  features: Feature[];
}

export const featureCategories: FeatureCategory[] = [
  {
    id: 'matching',
    label: 'AI Matching',
    icon: Bot,
    color: '#E1306C',
    features: [
      {
        id: 'ai-scoring',
        title: 'AI-Powered Match Scoring',
        description: 'Our advanced algorithm analyzes 8+ factors to predict collaboration success with 93% accuracy.',
        screenshot: '/screenshots/ai-matching.png',
        video: '/videos/ai-matching-demo.mp4',
        benefits: [
          'Niche alignment analysis',
          'Audience demographic matching',
          'Engagement rate compatibility',
          'Brand value alignment',
          'Content style matching'
        ],
        stats: [
          { label: 'Accuracy', value: '93%' },
          { label: 'Factors Analyzed', value: '8+' },
          { label: 'Avg Match Time', value: '<1s' }
        ]
      },
      {
        id: 'smart-recommendations',
        title: 'Smart Recommendations',
        description: 'Get personalized match suggestions based on your profile, preferences, and past collaborations.',
        screenshot: '/screenshots/recommendations.png',
        benefits: [
          'Machine learning powered',
          'Learns from your preferences',
          'Real-time updates',
          'Ranked by compatibility'
        ],
        stats: [
          { label: 'Avg Matches/Day', value: '15+' },
          { label: 'Success Rate', value: '87%' }
        ]
      }
    ]
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    color: '#5B51D8',
    features: [
      {
        id: 'real-time-messaging',
        title: 'Real-Time Messaging',
        description: 'Connect instantly with potential partners through our built-in messaging system.',
        screenshot: '/screenshots/messaging.png',
        video: '/videos/messaging-demo.mp4',
        benefits: [
          'Instant notifications',
          'File sharing support',
          'Message templates',
          'Read receipts',
          'Typing indicators'
        ],
        stats: [
          { label: 'Avg Response Time', value: '< 2h' },
          { label: 'Messages/Day', value: '50K+' }
        ]
      },
      {
        id: 'collaboration-requests',
        title: 'Collaboration Requests',
        description: 'Send and manage collaboration proposals with detailed terms and deliverables.',
        screenshot: '/screenshots/collaboration.png',
        benefits: [
          'Structured proposals',
          'Terms negotiation',
          'Status tracking',
          'Automated reminders'
        ],
        stats: [
          { label: 'Acceptance Rate', value: '68%' },
          { label: 'Avg Negotiation', value: '2.3 days' }
        ]
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    color: '#FD8D32',
    features: [
      {
        id: 'performance-dashboard',
        title: 'Performance Dashboard',
        description: 'Track your collaboration performance with comprehensive analytics and insights.',
        screenshot: '/screenshots/analytics.png',
        video: '/videos/analytics-demo.mp4',
        benefits: [
          'Real-time metrics',
          'ROI tracking',
          'Engagement analysis',
          'Growth trends',
          'Exportable reports'
        ],
        stats: [
          { label: 'Metrics Tracked', value: '25+' },
          { label: 'Update Frequency', value: 'Real-time' }
        ]
      },
      {
        id: 'match-history',
        title: 'Match History & Insights',
        description: 'Review past matches and learn from successful collaborations.',
        screenshot: '/screenshots/match-history.png',
        benefits: [
          'Historical data',
          'Success patterns',
          'Improvement suggestions',
          'Comparison tools'
        ],
        stats: [
          { label: 'Data Retention', value: 'Unlimited' },
          { label: 'Insights Generated', value: '100+' }
        ]
      }
    ]
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Target,
    color: '#00D95F',
    features: [
      {
        id: 'campaign-management',
        title: 'Campaign Management',
        description: 'Create, manage, and track influencer campaigns from start to finish.',
        screenshot: '/screenshots/campaigns.png',
        video: '/videos/campaigns-demo.mp4',
        benefits: [
          'Campaign builder',
          'Applicant management',
          'Milestone tracking',
          'Budget management',
          'Performance monitoring'
        ],
        stats: [
          { label: 'Active Campaigns', value: '5K+' },
          { label: 'Avg Campaign ROI', value: '340%' }
        ]
      },
      {
        id: 'influencer-discovery',
        title: 'Influencer Discovery',
        description: 'Find and vet influencers that match your campaign requirements.',
        screenshot: '/screenshots/discovery.png',
        benefits: [
          'Advanced filters',
          'Audience insights',
          'Authenticity scores',
          'Bulk outreach'
        ],
        stats: [
          { label: 'Influencers', value: '10K+' },
          { label: 'Filter Options', value: '20+' }
        ]
      }
    ]
  },
  {
    id: 'trust',
    label: 'Trust & Safety',
    icon: Shield,
    color: '#0095F6',
    features: [
      {
        id: 'verified-profiles',
        title: 'Verified Profiles',
        description: 'All users go through our verification process to ensure authenticity.',
        screenshot: '/screenshots/verification.png',
        benefits: [
          'Identity verification',
          'Social media authentication',
          'Business validation',
          'Fraud prevention',
          'Trust badges'
        ],
        stats: [
          { label: 'Verified Users', value: '98%' },
          { label: 'Fraud Rate', value: '< 0.1%' }
        ]
      },
      {
        id: 'secure-payments',
        title: 'Secure Payments',
        description: 'Protected payment processing with escrow services for peace of mind.',
        screenshot: '/screenshots/payments.png',
        benefits: [
          'Escrow protection',
          'Multiple payment methods',
          'Automated invoicing',
          'Dispute resolution'
        ],
        stats: [
          { label: 'Transactions', value: '$5M+' },
          { label: 'Dispute Rate', value: '< 2%' }
        ]
      }
    ]
  }
];

// Feature comparison data
export interface ComparisonFeature {
  feature: string;
  icmatch: boolean | string;
  competitor1: boolean | string;
  competitor2: boolean | string;
  competitor3: boolean | string;
}

export const featureComparison: ComparisonFeature[] = [
  {
    feature: 'AI-Powered Matching',
    icmatch: '93% accuracy',
    competitor1: 'Basic',
    competitor2: false,
    competitor3: 'Basic'
  },
  {
    feature: 'Real-Time Messaging',
    icmatch: true,
    competitor1: true,
    competitor2: false,
    competitor3: true
  },
  {
    feature: 'Analytics Dashboard',
    icmatch: 'Advanced',
    competitor1: 'Basic',
    competitor2: 'Basic',
    competitor3: false
  },
  {
    feature: 'Campaign Management',
    icmatch: true,
    competitor1: true,
    competitor2: false,
    competitor3: true
  },
  {
    feature: 'Verified Profiles',
    icmatch: '98% verified',
    competitor1: 'Manual',
    competitor2: false,
    competitor3: 'Manual'
  },
  {
    feature: 'ROI Tracking',
    icmatch: true,
    competitor1: false,
    competitor2: false,
    competitor3: 'Basic'
  },
  {
    feature: 'Escrow Payments',
    icmatch: true,
    competitor1: false,
    competitor2: false,
    competitor3: false
  },
  {
    feature: 'Mobile App',
    icmatch: 'iOS & Android',
    competitor1: 'iOS only',
    competitor2: false,
    competitor3: 'Coming soon'
  },
  {
    feature: 'API Access',
    icmatch: true,
    competitor1: 'Enterprise only',
    competitor2: false,
    competitor3: 'Enterprise only'
  },
  {
    feature: 'White Label',
    icmatch: 'Enterprise',
    competitor1: false,
    competitor2: false,
    competitor3: 'Enterprise'
  }
];

export const competitorNames = {
  icmatch: 'ICMatch',
  competitor1: 'Platform A',
  competitor2: 'Platform B',
  competitor3: 'Platform C'
};
