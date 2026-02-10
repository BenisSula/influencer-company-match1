import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateInfluencerProfileDto, MediaItemDto } from './update-influencer-profile.dto';

describe('UpdateInfluencerProfileDto', () => {
  describe('contentType validation', () => {
    it('should accept valid content types', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        contentType: ['video', 'image', 'blog'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject empty array', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        contentType: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('contentType');
      expect(errors[0].constraints?.arrayMinSize).toBeDefined();
    });

    it('should reject invalid content type', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        contentType: ['video', 'invalid-type'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('contentType');
    });

    it('should accept all valid content types', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        contentType: ['video', 'image', 'blog', 'podcast', 'story', 'reel', 'livestream'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('collaborationPreference validation', () => {
    it('should accept valid collaboration preferences', async () => {
      const validPreferences = ['one-time', 'long-term', 'flexible'];

      for (const preference of validPreferences) {
        const dto = plainToClass(UpdateInfluencerProfileDto, {
          collaborationPreference: preference,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject invalid collaboration preference', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        collaborationPreference: 'invalid-preference',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('collaborationPreference');
      expect(errors[0].constraints?.isIn).toBeDefined();
    });
  });

  describe('mediaGallery validation', () => {
    it('should accept valid media items', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        mediaGallery: [
          {
            id: '123',
            url: 'https://example.com/image.jpg',
            type: 'image',
            caption: 'Test caption',
            mimeType: 'image/jpeg',
            fileSize: 1024000,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject media item with invalid type', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        mediaGallery: [
          {
            id: '123',
            url: 'https://example.com/file.pdf',
            type: 'pdf',
            mimeType: 'application/pdf',
            fileSize: 1024000,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject media item with file size exceeding 10MB', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        mediaGallery: [
          {
            id: '123',
            url: 'https://example.com/large-video.mp4',
            type: 'video',
            mimeType: 'video/mp4',
            fileSize: 11000000, // 11MB
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject media item with invalid URL', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        mediaGallery: [
          {
            id: '123',
            url: 'not-a-valid-url',
            type: 'image',
            mimeType: 'image/jpeg',
            fileSize: 1024000,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject caption exceeding 200 characters', async () => {
      const longCaption = 'a'.repeat(201);
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        mediaGallery: [
          {
            id: '123',
            url: 'https://example.com/image.jpg',
            type: 'image',
            caption: longCaption,
            mimeType: 'image/jpeg',
            fileSize: 1024000,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('existing fields validation', () => {
    it('should accept valid audience size', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        audienceSize: 50000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject negative audience size', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        audienceSize: -1000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('audienceSize');
    });

    it('should accept valid engagement rate', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        engagementRate: 5.5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject engagement rate above 100', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        engagementRate: 150,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('engagementRate');
    });

    it('should accept valid portfolio URL', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        portfolioUrl: 'https://portfolio.example.com',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid portfolio URL', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        portfolioUrl: 'not-a-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('portfolioUrl');
    });
  });

  describe('optional fields', () => {
    it('should accept DTO with no fields', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept DTO with only new fields', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        contentType: ['video'],
        collaborationPreference: 'flexible',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept DTO with mixed old and new fields', async () => {
      const dto = plainToClass(UpdateInfluencerProfileDto, {
        niche: 'Technology',
        audienceSize: 100000,
        contentType: ['video', 'blog'],
        collaborationPreference: 'long-term',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

describe('MediaItemDto', () => {
  it('should accept valid image media item', async () => {
    const dto = plainToClass(MediaItemDto, {
      id: 'media-123',
      url: 'https://cdn.example.com/image.jpg',
      type: 'image',
      caption: 'My portfolio image',
      mimeType: 'image/jpeg',
      fileSize: 2048000,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept valid video media item', async () => {
    const dto = plainToClass(MediaItemDto, {
      id: 'media-456',
      url: 'https://cdn.example.com/video.mp4',
      type: 'video',
      mimeType: 'video/mp4',
      fileSize: 8000000,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject media item without required fields', async () => {
    const dto = plainToClass(MediaItemDto, {
      url: 'https://example.com/image.jpg',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
