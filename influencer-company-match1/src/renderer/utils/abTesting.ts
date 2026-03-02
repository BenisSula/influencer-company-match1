/**
 * A/B Testing Framework
 * Enables testing different variations of landing page elements
 */

export interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  active: boolean;
  trafficAllocation: number; // Percentage of users to include
}

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // Percentage allocation
  config: Record<string, any>;
}

export interface ABTestAssignment {
  testId: string;
  variantId: string;
  timestamp: number;
}

/**
 * A/B Testing Service
 */
class ABTestingService {
  private assignments: Map<string, ABTestAssignment> = new Map();
  private storageKey = 'ab_test_assignments';
  
  constructor() {
    this.loadAssignments();
  }
  
  /**
   * Load assignments from localStorage
   */
  private loadAssignments(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const assignments = JSON.parse(stored);
        this.assignments = new Map(Object.entries(assignments));
      }
    } catch (error) {
      console.error('Failed to load A/B test assignments:', error);
    }
  }
  
  /**
   * Save assignments to localStorage
   */
  private saveAssignments(): void {
    try {
      const assignments = Object.fromEntries(this.assignments);
      localStorage.setItem(this.storageKey, JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save A/B test assignments:', error);
    }
  }
  
  /**
   * Get variant for a test
   */
  getVariant(test: ABTest): ABVariant {
    // Check if user already has an assignment
    const existing = this.assignments.get(test.id);
    if (existing) {
      const variant = test.variants.find(v => v.id === existing.variantId);
      if (variant) {
        return variant;
      }
    }
    
    // Check if user should be included in test
    if (!this.shouldIncludeUser(test.trafficAllocation)) {
      // Return control variant (first variant)
      return test.variants[0];
    }
    
    // Assign new variant based on weights
    const variant = this.assignVariant(test);
    
    // Save assignment
    this.assignments.set(test.id, {
      testId: test.id,
      variantId: variant.id,
      timestamp: Date.now()
    });
    this.saveAssignments();
    
    return variant;
  }
  
  /**
   * Check if user should be included in test
   */
  private shouldIncludeUser(trafficAllocation: number): boolean {
    return Math.random() * 100 < trafficAllocation;
  }
  
  /**
   * Assign variant based on weights
   */
  private assignVariant(test: ABTest): ABVariant {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random < cumulative) {
        return variant;
      }
    }
    
    // Fallback to first variant
    return test.variants[0];
  }
  
  /**
   * Get all assignments
   */
  getAssignments(): Map<string, ABTestAssignment> {
    return this.assignments;
  }
  
  /**
   * Clear all assignments (for testing)
   */
  clearAssignments(): void {
    this.assignments.clear();
    localStorage.removeItem(this.storageKey);
  }
  
  /**
   * Track conversion for variant
   */
  trackConversion(testId: string, conversionType: string): void {
    const assignment = this.assignments.get(testId);
    if (!assignment) return;
    
    // Send to analytics
    console.log('A/B Test Conversion:', {
      testId,
      variantId: assignment.variantId,
      conversionType,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const abTesting = new ABTestingService();

/**
 * Predefined A/B Tests
 */
export const landingPageTests: Record<string, ABTest> = {
  heroCTA: {
    id: 'hero_cta_test',
    name: 'Hero CTA Button Text',
    active: true,
    trafficAllocation: 100,
    variants: [
      {
        id: 'control',
        name: 'Control - Get Started',
        weight: 50,
        config: {
          primaryText: 'Get Started Free',
          secondaryText: 'View Demo'
        }
      },
      {
        id: 'variant_a',
        name: 'Variant A - Join Now',
        weight: 50,
        config: {
          primaryText: 'Join Now - It\'s Free',
          secondaryText: 'See How It Works'
        }
      }
    ]
  },
  
  heroHeadline: {
    id: 'hero_headline_test',
    name: 'Hero Headline',
    active: false,
    trafficAllocation: 50,
    variants: [
      {
        id: 'control',
        name: 'Control - AI-Powered',
        weight: 50,
        config: {
          headline: 'Connect Influencers with Brands Through AI-Powered Matching'
        }
      },
      {
        id: 'variant_a',
        name: 'Variant A - Smart Matching',
        weight: 50,
        config: {
          headline: 'Smart Matching for Influencers and Brands'
        }
      }
    ]
  },
  
  statsDisplay: {
    id: 'stats_display_test',
    name: 'Stats Section Display',
    active: false,
    trafficAllocation: 50,
    variants: [
      {
        id: 'control',
        name: 'Control - Grid',
        weight: 50,
        config: {
          layout: 'grid',
          showCharts: false
        }
      },
      {
        id: 'variant_a',
        name: 'Variant A - Grid with Charts',
        weight: 50,
        config: {
          layout: 'grid',
          showCharts: true
        }
      }
    ]
  },
  
  ctaColor: {
    id: 'cta_color_test',
    name: 'CTA Button Color',
    active: false,
    trafficAllocation: 50,
    variants: [
      {
        id: 'control',
        name: 'Control - Instagram Pink',
        weight: 50,
        config: {
          primaryColor: '#E1306C',
          hoverColor: '#C13584'
        }
      },
      {
        id: 'variant_a',
        name: 'Variant A - Purple',
        weight: 50,
        config: {
          primaryColor: '#5B51D8',
          hoverColor: '#4A42B8'
        }
      }
    ]
  },
  
  testimonialCount: {
    id: 'testimonial_count_test',
    name: 'Number of Testimonials',
    active: false,
    trafficAllocation: 50,
    variants: [
      {
        id: 'control',
        name: 'Control - 3 Testimonials',
        weight: 50,
        config: {
          count: 3
        }
      },
      {
        id: 'variant_a',
        name: 'Variant A - 6 Testimonials',
        weight: 50,
        config: {
          count: 6
        }
      }
    ]
  }
};

/**
 * Hook for using A/B tests in components
 */
export const useABTest = (testId: string): ABVariant | null => {
  const test = landingPageTests[testId];
  if (!test || !test.active) return null;
  
  return abTesting.getVariant(test);
};
