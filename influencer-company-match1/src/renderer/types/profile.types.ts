/**
 * Unified Profile Types
 * Single source of truth for profile data structure
 * Eliminates need for fallback logic throughout the app
 */

export interface UnifiedProfile {
  // Common fields (both roles)
  name: string;
  bio: string;
  location: string;
  platforms: string[];
  avatarUrl: string;
  
  // Influencer-specific fields
  niche?: string;
  audienceSize?: number;
  engagementRate?: number;
  portfolioUrl?: string;
  minBudget?: number;
  maxBudget?: number;
  collaborationPreference?: string;
  
  // Company-specific fields
  industry?: string;
  budget?: number;
  companySize?: string;
  website?: string;
  campaignType?: string[];
  preferredInfluencerNiches?: string;
  collaborationDuration?: string;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  
  // Meta fields
  profileCompletionPercentage: number;
  profileCompleted: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'INFLUENCER' | 'COMPANY' | 'ADMIN';
  isActive: boolean;
  
  // Profile data (unified structure from backend)
  name: string;
  bio: string;
  location: string;
  platforms: string[];
  avatarUrl: string;
  
  // Role-specific fields
  niche?: string;
  audienceSize?: number;
  engagementRate?: number;
  portfolioUrl?: string;
  minBudget?: number;
  maxBudget?: number;
  collaborationPreference?: string;
  
  industry?: string;
  budget?: number;
  companySize?: string;
  website?: string;
  campaignType?: string[];
  preferredInfluencerNiches?: string;
  collaborationDuration?: string;
  minAudienceSize?: number;
  maxAudienceSize?: number;
  
  // Meta
  profileCompletionPercentage: number;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Nested profile object (for backward compatibility)
  profile?: {
    name: string;
    type: 'influencer' | 'company';
    bio: string;
    avatarUrl: string;
    [key: string]: any;
  };
}

/**
 * Helper function to get profile data consistently
 * Use this instead of complex fallback logic
 */
export function getProfileField<T>(user: User | null | undefined, field: keyof UnifiedProfile, defaultValue: T): T {
  if (!user) return defaultValue;
  
  // Try direct field first
  const directValue = user[field as keyof User];
  if (directValue !== undefined && directValue !== null) {
    return directValue as T;
  }
  
  // Try nested profile object
  if (user.profile && user.profile[field as string] !== undefined) {
    return user.profile[field as string] as T;
  }
  
  return defaultValue;
}

/**
 * Helper to check if profile is complete
 */
export function isProfileComplete(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.profileCompleted || user.profileCompletionPercentage === 100;
}

/**
 * Helper to get missing profile fields
 */
export function getMissingFields(user: User | null | undefined): string[] {
  if (!user) return [];
  
  const requiredFields = user.role === 'INFLUENCER'
    ? ['name', 'niche', 'bio', 'audienceSize', 'platforms', 'location']
    : ['name', 'industry', 'bio', 'budget', 'location'];
  
  return requiredFields.filter(field => {
    const value = user[field as keyof User];
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'string') return value.trim().length === 0;
    if (typeof value === 'number') return value === 0;
    return false;
  });
}
