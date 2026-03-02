import { Injectable } from '@nestjs/common';

interface LockoutRecord {
  attempts: number;
  lockedUntil?: number;
  lastAttempt: number;
}

@Injectable()
export class AccountLockoutService {
  private lockouts: Map<string, LockoutRecord> = new Map();
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 30 * 60 * 1000; // 30 minutes
  private readonly attemptWindow = 15 * 60 * 1000; // 15 minutes

  constructor() {
    // Clean up old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  isLocked(email: string): boolean {
    const record = this.lockouts.get(email.toLowerCase());
    if (!record) return false;

    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      return true;
    }

    // Lockout expired, reset
    if (record.lockedUntil && Date.now() >= record.lockedUntil) {
      this.lockouts.delete(email.toLowerCase());
      return false;
    }

    return false;
  }

  getLockedUntil(email: string): number | null {
    const record = this.lockouts.get(email.toLowerCase());
    return record?.lockedUntil || null;
  }

  recordFailedAttempt(email: string): void {
    const key = email.toLowerCase();
    const now = Date.now();
    const record = this.lockouts.get(key);

    if (!record) {
      this.lockouts.set(key, {
        attempts: 1,
        lastAttempt: now,
      });
      return;
    }

    // Reset if outside attempt window
    if (now - record.lastAttempt > this.attemptWindow) {
      this.lockouts.set(key, {
        attempts: 1,
        lastAttempt: now,
      });
      return;
    }

    // Increment attempts
    record.attempts++;
    record.lastAttempt = now;

    // Lock account if max attempts reached
    if (record.attempts >= this.maxAttempts) {
      record.lockedUntil = now + this.lockoutDuration;
      console.log(`🔒 Account locked: ${email} until ${new Date(record.lockedUntil).toISOString()}`);
    }

    this.lockouts.set(key, record);
  }

  recordSuccessfulLogin(email: string): void {
    // Clear lockout on successful login
    this.lockouts.delete(email.toLowerCase());
  }

  getRemainingAttempts(email: string): number {
    const record = this.lockouts.get(email.toLowerCase());
    if (!record) return this.maxAttempts;
    
    const now = Date.now();
    if (now - record.lastAttempt > this.attemptWindow) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.attempts);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.lockouts.forEach((record, key) => {
      // Remove if lockout expired and no recent attempts
      if (record.lockedUntil && now > record.lockedUntil + this.attemptWindow) {
        expiredKeys.push(key);
      }
      // Remove if no recent attempts and not locked
      else if (!record.lockedUntil && now - record.lastAttempt > this.attemptWindow * 2) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.lockouts.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired lockout records`);
    }
  }
}
