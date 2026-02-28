import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaFile, MediaFileType } from './entities/media-file.entity';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaFile)
    private mediaRepository: Repository<MediaFile>,
  ) {}

  async createMediaFile(
    userId: string,
    file: Express.Multer.File,
    fileType: MediaFileType,
    altText?: string,
  ): Promise<MediaFile> {
    console.log('[MediaService] Creating media file record:', {
      userId,
      filename: file.filename,
      fileType,
      fileSize: file.size,
    });

    try {
      const mediaFile = this.mediaRepository.create({
        userId,
        fileType,
        fileUrl: `/uploads/${file.filename}`,
        thumbnailUrl: file.filename.includes('thumb_') ? `/uploads/${file.filename}` : undefined,
        fileSize: file.size,
        mimeType: file.mimetype,
        altText,
      });

      const saved = await this.mediaRepository.save(mediaFile);
      console.log('[MediaService] Media file saved:', {
        id: saved.id,
        fileUrl: saved.fileUrl,
      });

      return saved;
    } catch (error) {
      console.error('[MediaService] Failed to save media file:', error);
      throw error;
    }
  }

  async getUserMedia(userId: string, fileType?: MediaFileType): Promise<MediaFile[]> {
    const query = this.mediaRepository.createQueryBuilder('media')
      .where('media.userId = :userId', { userId });

    if (fileType) {
      query.andWhere('media.fileType = :fileType', { fileType });
    }

    const results = await query.orderBy('media.createdAt', 'DESC').getMany();
    return results;
  }

  async getMediaById(id: string): Promise<MediaFile> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    
    if (!media) {
      throw new NotFoundException('Media file not found');
    }

    return media;
  }

  async deleteMedia(id: string, userId: string): Promise<void> {
    const media = await this.getMediaById(id);

    if (media.userId !== userId) {
      throw new BadRequestException('Not authorized to delete this media');
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(media.fileUrl));
      await fs.unlink(filePath);

      if (media.thumbnailUrl) {
        const thumbPath = path.join(process.cwd(), 'uploads', path.basename(media.thumbnailUrl));
        await fs.unlink(thumbPath).catch(() => {});
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await this.mediaRepository.remove(media);
  }

  async updateAltText(id: string, userId: string, altText: string): Promise<MediaFile> {
    const media = await this.getMediaById(id);

    if (media.userId !== userId) {
      throw new BadRequestException('Not authorized to update this media');
    }

    media.altText = altText;
    return this.mediaRepository.save(media);
  }
}
