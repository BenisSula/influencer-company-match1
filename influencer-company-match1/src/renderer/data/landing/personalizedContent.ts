/**
 * Personalized Content Data
 * Role-specific content for landing page personalization
 * Phase 3.2: Personalization
 */

export interface PersonalizedContent {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaSecondary: string;
  features: string[];
  benefits: string[];
}

export const personalizedContent = {
  INFLUENCER: {
    heroTitle: 'Find Your Perfect Brand Partnerships',
    heroSubtitle: 'Connect with brands that match your niche, values, and audience. Get paid for authentic collaborations.',
    ctaText: 'Start Matching with Brands',
    ctaSecondary: 'See How It Works',
    features: [
      'AI-powered brand matching',
      'Automated collaboration management',
      'Real-time earnings tracking',
      'Portfolio showcase',
      'Secure payment processing'
    ],
    benefits: [
      'Find brands that align with your values',
      'Negotiate fair compensation',
      'Track all collaborations in one place',
      'Get paid on time, every time',
      'Grow your influence with data insights'
    ]
  },
  COMPANY: {
    heroTitle: 'Discover Authentic Influencers',
    heroSubtitle: 'Find influencers who truly align with your brand values and reach your target audience effectively.',
    ctaText: 'Find Your Influencers',
    ctaSecondary: 'View Success Stories',
    features: [
      'AI-powered influencer discovery',
      'Campaign management tools',
      'Performance analytics',
      'ROI tracking',
      'Secure collaboration platform'
    ],
    benefits: [
      'Find authentic voices for your brand',
      'Launch campaigns in minutes',
      'Track performance in real-time',
      'Maximize your marketing ROI',
      'Build long-term partnerships'
    ]
  },
  DEFAULT: {
    heroTitle: 'Where Influencers Meet Brands',
    heroSubtitle: 'AI-powered matching platform connecting influencers with brands for authentic collaborations.',
    ctaText: 'Get Started Free',
    ctaSecondary: 'Learn More',
    features: [
      'AI-powered matching',
      'Collaboration management',
      'Performance analytics',
      'Secure payments',
      'Real-time messaging'
    ],
    benefits: [
      'Find perfect matches instantly',
      'Manage all collaborations in one place',
      'Track performance with detailed analytics',
      'Get paid securely and on time',
      'Connect with the right partners'
    ]
  }
};

// Role-specific testimonials
export const personalizedTestimonials = {
  INFLUENCER: [
    {
      name: 'Sarah Martinez',
      role: 'Fashion Influencer',
      followers: '250K',
      avatar: 'SM',
      quote: 'ICMatch helped me find brands that truly align with my style. I\'ve doubled my collaboration income in 3 months!',
      rating: 5
    },
    {
      name: 'Alex Chen',
      role: 'Tech Reviewer',
      followers: '180K',
      avatar: 'AC',
      quote: 'The AI matching is incredible. Every brand I connect with is a perfect fit for my audience.',
      rating: 5
    }
  ],
  COMPANY: [
    {
      name: 'James Wilson',
      role: 'Marketing Director',
      company: 'TechCorp',
      avatar: 'JW',
      quote: 'We found 5 perfect influencers in our first week. The ROI has been outstanding.',
      rating: 5
    },
    {
      name: 'Lisa Thompson',
      role: 'Brand Manager',
      company: 'BeautyBrand',
      avatar: 'LT',
      quote: 'ICMatch saves us countless hours. The platform makes influencer marketing so much easier.',
      rating: 5
    }
  ]
};

// Role-specific stats
export const personalizedStats = {
  INFLUENCER: [
    { label: 'Active Brands', value: 2500, suffix: '+' },
    { label: 'Avg. Earnings', value: 3200, prefix: '$', suffix: '/mo' },
    { label: 'Success Rate', value: 94, suffix: '%' },
    { label: 'Avg. Response Time', value: 2, suffix: 'hrs' }
  ],
  COMPANY: [
    { label: 'Active Influencers', value: 15000, suffix: '+' },
    { label: 'Avg. ROI', value: 450, suffix: '%' },
    { label: 'Campaign Success', value: 92, suffix: '%' },
    { label: 'Time Saved', value: 15, suffix: 'hrs/week' }
  ]
};
