import { matchingService } from './matching.service';

export interface SuggestedMatch {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'influencer' | 'company';
  niche?: string;
  industry?: string;
  location?: string;
  score: number;
  tier: string;
  // Influencer-specific
  audienceSize?: number;
  engagementRate?: number;
  platforms?: string[];
  // Company-specific
  budget?: number;
  companySize?: string;
}

export class SuggestionsService {
  private cache: SuggestedMatch[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getSuggestedMatches(limit: number = 8): Promise<SuggestedMatch[]> {
    // Check cache
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      console.log('[SuggestionsService] Returning cached suggestions:', this.cache.length);
      return this.cache.slice(0, limit);
    }

    try {
      console.log('[SuggestionsService] Fetching suggested matches with limit:', limit);
      
      // Get top matches sorted by score
      const response = await matchingService.getMatches({
        sortBy: 'score',
        sortOrder: 'desc',
        minScore: 50, // Lowered from 60 to show more matches
        limit: limit * 2, // Get more to filter
      });

      console.log('[SuggestionsService] Raw response:', response);
      console.log('[SuggestionsService] Response data length:', response.data?.length);

      if (!response.data || response.data.length === 0) {
        console.warn('[SuggestionsService] No matches returned from backend');
        return [];
      }

      const suggestions: SuggestedMatch[] = response.data.map(match => {
        const suggestion = {
          id: match.profile.id,
          name: match.profile.name,
          avatarUrl: match.profile.avatarUrl,
          role: match.profile.type,
          niche: match.profile.niche,
          industry: match.profile.industry,
          location: match.profile.location,
          score: match.score,
          tier: match.tier,
          audienceSize: match.profile.audienceSize,
          engagementRate: match.profile.engagementRate,
          platforms: match.profile.platforms,
          budget: match.profile.budget,
          companySize: match.profile.companySize,
        };
        return suggestion;
      });

      console.log('[SuggestionsService] Transformed suggestions:', suggestions.length, suggestions);

      // Update cache
      this.cache = suggestions;
      this.cacheTimestamp = Date.now();

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('[SuggestionsService] Failed to fetch suggested matches:', error);
      return [];
    }
  }

  clearCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const suggestionsService = new SuggestionsService();
