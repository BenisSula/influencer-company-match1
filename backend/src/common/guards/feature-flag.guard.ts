import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Feature Flag Guard
 * 
 * Protects endpoints based on feature flags from environment variables.
 * Returns 503 Service Unavailable when feature is disabled.
 */
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const feature = this.reflector.get<string>('feature', context.getHandler());
    
    if (!feature) {
      // No feature flag specified, allow access
      return true;
    }

    // Check environment variable
    const envKey = `FEATURE_${feature.toUpperCase()}`;
    const isEnabled = process.env[envKey] === 'true';
    
    if (!isEnabled) {
      throw new ServiceUnavailableException(
        `This feature is temporarily unavailable. Please check back later.`
      );
    }

    return true;
  }
}
