/**
 * Profile ID Helper Utilities
 * 
 * Clarifies the distinction between:
 * - userId: ID in the users table (primary identifier for users)
 * - profileId: ID in influencer_profiles or company_profiles table
 * 
 * Best Practice: Always use userId for user-facing operations
 */

export class ProfileIdHelper {
  /**
   * Validates if an ID is a valid UUID format
   */
  static isValidUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Extracts userId from a profile object
   * Handles both direct userId and nested profile structures
   */
  static extractUserId(profile: any): string | null {
    if (!profile) return null;
    
    // Direct userId field
    if (profile.userId) return profile.userId;
    
    // ID field (assuming it's userId for user-facing operations)
    if (profile.id) return profile.id;
    
    // Nested user object
    if (profile.user?.id) return profile.user.id;
    
    return null;
  }

  /**
   * Extracts profileId from a profile object
   */
  static extractProfileId(profile: any): string | null {
    if (!profile) return null;
    
    // Explicit profileId field
    if (profile.profileId) return profile.profileId;
    
    // ID field in profile context
    if (profile.id && profile.userId) {
      // If both exist, id is likely the profileId
      return profile.id;
    }
    
    return null;
  }

  /**
   * Creates a standardized profile response
   * Always includes both userId and profileId for clarity
   */
  static standardizeProfileResponse(profile: any, userId: string, profileId: string): any {
    return {
      ...profile,
      id: userId, // Primary ID for user-facing operations
      userId, // Explicit userId
      profileId, // Explicit profileId for internal operations
    };
  }

  /**
   * Logs ID usage for debugging
   */
  static logIdUsage(context: string, userId?: string, profileId?: string): void {
    console.log(`[ProfileIdHelper] ${context}:`, {
      userId: userId || 'not provided',
      profileId: profileId || 'not provided',
    });
  }
}
