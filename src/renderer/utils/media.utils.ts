/**
 * Utility functions for handling media URLs
 */

import { mediaService } from '../services/media.service';

/**
 * Converts a relative media URL to an absolute URL
 * @param relativeUrl - The relative URL (e.g., "/uploads/image.jpg")
 * @returns The absolute URL (e.g., "http://localhost:3000/uploads/image.jpg")
 */
export function getMediaUrl(relativeUrl: string | null | undefined): string {
  return mediaService.getMediaUrl(relativeUrl);
}

/**
 * Converts an array of relative media URLs to absolute URLs
 * @param relativeUrls - Array of relative URLs
 * @returns Array of absolute URLs
 */
export function getMediaUrls(relativeUrls: (string | null | undefined)[]): string[] {
  return relativeUrls.filter(Boolean).map(url => getMediaUrl(url));
}
