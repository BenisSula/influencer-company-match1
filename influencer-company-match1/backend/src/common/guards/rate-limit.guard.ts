import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();
      const ip = this.getClientIp(request);
      const endpoint = request.route?.path || request.url || 'unknown';
      const key = `${ip}:${endpoint}`;

      const now = Date.now();
      const record = this.store[key];

      if (!record || now > record.resetTime) {
        // New window
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        return true;
      }

      if (record.count >= this.maxAttempts) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      record.count++;
      return true;
    } catch (error) {
      // If there's any error in rate limiting, allow the request through
      return true;
    }
  }

  private getClientIp(request: any): string {
    try {
      return (
        request.headers['x-forwarded-for']?.split(',')[0] ||
        request.headers['x-real-ip'] ||
        request.ip ||
        '127.0.0.1'
      );
    } catch (error) {
      return '127.0.0.1';
    }
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}

// Factory functions for different rate limits
export const LoginRateLimitGuard = () => new RateLimitGuard(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const RegisterRateLimitGuard = () => new RateLimitGuard(3, 60 * 60 * 1000); // 3 attempts per hour
