import { SetMetadata } from '@nestjs/common';

/**
 * Feature Decorator
 * 
 * Marks a controller or route as requiring a specific feature flag.
 * 
 * @example
 * @Feature('campaigns')
 * @Controller('campaigns')
 * export class CampaignsController {}
 */
export const Feature = (feature: string) => SetMetadata('feature', feature);
