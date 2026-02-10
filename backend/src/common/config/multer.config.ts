import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { generateUniqueFilename, mediaFileFilter } from '../utils/file-upload.util';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads', 'media');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer configuration for media uploads
 */
export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      cb(null, uniqueFilename);
    },
  }),
  fileFilter: mediaFileFilter,
};
