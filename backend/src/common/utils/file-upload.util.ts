import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

/**
 * Allowed MIME types for media uploads
 * Validates: Requirements 1.1.7
 */
export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
];

export const ALLOWED_MEDIA_MIMES = [
  ...ALLOWED_IMAGE_MIMES,
  ...ALLOWED_VIDEO_MIMES,
];

/**
 * Maximum file size: 10MB
 * Validates: Requirements 1.1.8
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * File filter for multer to validate file types
 */
export const mediaFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!ALLOWED_MEDIA_MIMES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_MEDIA_MIMES.join(', ')}`,
      ),
      false,
    );
  }
  callback(null, true);
};

/**
 * Validate file size
 * Validates: Requirements 1.1.8
 */
export const validateFileSize = (file: Express.Multer.File): void => {
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }
};

/**
 * Get media type from MIME type
 */
export const getMediaType = (mimeType: string): 'image' | 'video' => {
  if (ALLOWED_IMAGE_MIMES.includes(mimeType)) {
    return 'image';
  }
  if (ALLOWED_VIDEO_MIMES.includes(mimeType)) {
    return 'video';
  }
  throw new BadRequestException('Invalid media type');
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = extname(originalName);
  return `${timestamp}-${randomString}${ext}`;
};
