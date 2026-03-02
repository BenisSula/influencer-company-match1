/**
 * Platform Ratings Data
 * G2, Capterra, Trustpilot ratings
 */

export interface PlatformRating {
  platform: 'g2' | 'capterra' | 'trustpilot';
  rating: number;
  reviewCount: number;
  logo: string;
  url: string;
  badge?: string;
}

export const platformRatings: PlatformRating[] = [
  {
    platform: 'g2',
    rating: 4.8,
    reviewCount: 342,
    logo: '/logos/g2.svg',
    url: 'https://www.g2.com/products/icmatch',
    badge: 'High Performer'
  },
  {
    platform: 'capterra',
    rating: 4.7,
    reviewCount: 289,
    logo: '/logos/capterra.svg',
    url: 'https://www.capterra.com/p/icmatch',
    badge: 'Best Value'
  },
  {
    platform: 'trustpilot',
    rating: 4.9,
    reviewCount: 456,
    logo: '/logos/trustpilot.svg',
    url: 'https://www.trustpilot.com/review/icmatch.com',
    badge: 'Excellent'
  }
];
