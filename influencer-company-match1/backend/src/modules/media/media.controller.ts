import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaFileType } from './entities/media-file.entity';

// File upload configuration
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  // Accept all common image formats
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
    'image/heic',
    'image/heif'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException(`Invalid file type: ${file.mimetype}. Allowed types: JPEG, JPG, PNG, WEBP, GIF, BMP, SVG, TIFF, ICO, HEIC, HEIF`), false);
  }
};

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: MediaFileType,
    @Body('altText') altText: string,
    @Request() req: any,
  ) {
    console.log('[MediaController] Upload request received:', {
      hasFile: !!file,
      fileType,
      altText,
      userId: req.user?.sub,
      headers: req.headers,
    });

    if (!file) {
      console.error('[MediaController] No file in request');
      throw new BadRequestException('No file uploaded');
    }

    console.log('[MediaController] File details:', {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      destination: file.destination,
      path: file.path,
    });

    try {
      const result = await this.mediaService.createMediaFile(
        req.user.sub,
        file,
        fileType,
        altText,
      );
      
      console.log('[MediaController] Upload successful:', {
        id: result.id,
        fileUrl: result.fileUrl,
      });

      return result;
    } catch (error) {
      console.error('[MediaController] Upload failed:', error);
      throw error;
    }
  }

  @Get('user/:userId')
  async getUserMedia(
    @Param('userId') userId: string,
    @Query('fileType') fileType?: MediaFileType,
  ) {
    return this.mediaService.getUserMedia(userId, fileType);
  }

  @Get(':id')
  async getMedia(@Param('id') id: string) {
    return this.mediaService.getMediaById(id);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string, @Request() req: any) {
    await this.mediaService.deleteMedia(id, req.user.sub);
    return { message: 'Media deleted successfully' };
  }
}
