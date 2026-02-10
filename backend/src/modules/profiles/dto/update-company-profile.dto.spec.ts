import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateCompanyProfileDto } from './update-company-profile.dto';

describe('UpdateCompanyProfileDto', () => {
  describe('companySize validation', () => {
    it('should accept valid company sizes', async () => {
      const validSizes = ['startup', 'small', 'medium', 'large', 'enterprise'];

      for (const size of validSizes) {
        const dto = plainToClass(UpdateCompanyProfileDto, {
          companySize: size,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject invalid company size', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        companySize: 'mega-corporation',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('companySize');
      expect(errors[0].constraints?.isIn).toBeDefined();
    });
  });

  describe('campaignType validation', () => {
    it('should accept valid campaign types', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        campaignType: ['product-launch', 'brand-awareness', 'event'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject empty array', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        campaignType: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('campaignType');
      expect(errors[0].constraints?.arrayMinSize).toBeDefined();
    });

    it('should reject invalid campaign type', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        campaignType: ['product-launch', 'invalid-type'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('campaignType');
    });

    it('should accept all valid campaign types', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        campaignType: [
          'product-launch',
          'brand-awareness',
          'event',
          'sponsored-content',
          'affiliate',
          'ambassador',
          'ugc',
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('preferredInfluencerNiches validation', () => {
    it('should accept valid niches array', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        preferredInfluencerNiches: ['Technology', 'Gaming', 'Lifestyle'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject empty array', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        preferredInfluencerNiches: [],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('preferredInfluencerNiches');
      expect(errors[0].constraints?.arrayMinSize).toBeDefined();
    });

    it('should accept single niche', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        preferredInfluencerNiches: ['Fashion'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('collaborationDuration validation', () => {
    it('should accept valid collaboration durations', async () => {
      const validDurations = ['short-term', 'medium-term', 'long-term'];

      for (const duration of validDurations) {
        const dto = plainToClass(UpdateCompanyProfileDto, {
          collaborationDuration: duration,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject invalid collaboration duration', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        collaborationDuration: 'permanent',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('collaborationDuration');
      expect(errors[0].constraints?.isIn).toBeDefined();
    });
  });

  describe('existing fields validation', () => {
    it('should accept valid budget', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        budget: 50000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject negative budget', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        budget: -5000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('budget');
    });

    it('should accept valid audience size range', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        minAudienceSize: 10000,
        maxAudienceSize: 100000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject negative audience sizes', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        minAudienceSize: -1000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('minAudienceSize');
    });

    it('should accept valid website URL', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        website: 'https://company.example.com',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid website URL', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        website: 'not-a-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('website');
    });

    it('should accept description up to 2000 characters', async () => {
      const description = 'a'.repeat(2000);
      const dto = plainToClass(UpdateCompanyProfileDto, {
        description,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject description exceeding 2000 characters', async () => {
      const description = 'a'.repeat(2001);
      const dto = plainToClass(UpdateCompanyProfileDto, {
        description,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('description');
    });
  });

  describe('optional fields', () => {
    it('should accept DTO with no fields', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept DTO with only new fields', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        companySize: 'medium',
        campaignType: ['brand-awareness'],
        preferredInfluencerNiches: ['Technology'],
        collaborationDuration: 'long-term',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept DTO with mixed old and new fields', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        companyName: 'Tech Corp',
        budget: 100000,
        companySize: 'large',
        campaignType: ['product-launch', 'sponsored-content'],
        preferredInfluencerNiches: ['Technology', 'Gaming'],
        collaborationDuration: 'medium-term',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('combined validation scenarios', () => {
    it('should validate all new fields together', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        companySize: 'startup',
        campaignType: ['product-launch', 'brand-awareness'],
        preferredInfluencerNiches: ['Technology', 'Business'],
        collaborationDuration: 'short-term',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should catch multiple validation errors', async () => {
      const dto = plainToClass(UpdateCompanyProfileDto, {
        companySize: 'invalid-size',
        campaignType: [],
        preferredInfluencerNiches: [],
        collaborationDuration: 'invalid-duration',
        budget: -1000,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      // Should have errors for multiple fields
      const errorProperties = errors.map((e) => e.property);
      expect(errorProperties).toContain('companySize');
      expect(errorProperties).toContain('campaignType');
      expect(errorProperties).toContain('preferredInfluencerNiches');
      expect(errorProperties).toContain('collaborationDuration');
      expect(errorProperties).toContain('budget');
    });
  });
});
