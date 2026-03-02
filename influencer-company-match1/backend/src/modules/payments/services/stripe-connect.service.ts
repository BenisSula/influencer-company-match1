import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User, UserRole } from '../../auth/entities/user.entity';
import { StripeConfig } from '../../../config/stripe.config';

@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);
  private stripe: Stripe;
  private stripeConfig: StripeConfig;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.stripeConfig = this.configService.get<StripeConfig>('stripe');
    
    // Only initialize Stripe if config is available
    if (this.stripeConfig?.secretKey) {
      this.stripe = new Stripe(this.stripeConfig.secretKey, {
        apiVersion: '2026-01-28.clover',
      });
    } else {
      this.logger.warn('Stripe not configured - payment features disabled');
    }
  }

  /**
   * Create Stripe Connect account for influencer
   * @param userId User ID
   * @param email User email
   * @returns Stripe account ID
   */
  async createConnectAccount(userId: string, email: string): Promise<string> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured - cannot create Connect account');
      return null;
    }
    
    try {
      this.logger.log(`Creating Stripe Connect account for user ${userId}`);

      const account = await this.stripe.accounts.create({
        type: 'express', // Express account for faster onboarding
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          userId,
          platform: 'influencer-match',
        },
      });

      // Update user with Stripe account ID
      await this.userRepository.update(userId, {
        stripeAccountId: account.id,
      });

      this.logger.log(`Created Stripe Connect account ${account.id} for user ${userId}`);
      return account.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe Connect account for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create Stripe Customer for company
   * @param userId User ID
   * @param email User email
   * @param name Company name
   * @returns Stripe customer ID
   */
  async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured - cannot create Customer');
      return null;
    }
    
    try {
      this.logger.log(`Creating Stripe Customer for user ${userId}`);

      const customer = await this.stripe.customers.create({
        email,
        name: name || email,
        metadata: {
          userId,
          platform: 'influencer-match',
        },
      });

      // Update user with Stripe customer ID
      await this.userRepository.update(userId, {
        stripeCustomerId: customer.id,
      });

      this.logger.log(`Created Stripe Customer ${customer.id} for user ${userId}`);
      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe Customer for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create Stripe account based on user role
   * @param user User entity
   */
  async createStripeAccountForUser(user: User): Promise<void> {
    try {
      // Skip if already has Stripe account
      if (user.stripeAccountId || user.stripeCustomerId) {
        this.logger.log(`User ${user.id} already has Stripe account, skipping creation`);
        return;
      }

      if (user.role === UserRole.INFLUENCER) {
        // Create Connect account for influencers
        await this.createConnectAccount(user.id, user.email);
      } else if (user.role === UserRole.COMPANY) {
        // Create Customer for companies
        await this.createCustomer(user.id, user.email);
      }
    } catch (error) {
      // Log error but don't block registration
      this.logger.error(`Failed to create Stripe account for user ${user.id}:`, error);
    }
  }

  /**
   * Generate account link for Connect onboarding
   * @param accountId Stripe account ID
   * @param refreshUrl URL to redirect if link expires
   * @param returnUrl URL to redirect after onboarding
   * @returns Account link URL
   */
  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }
    
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      this.logger.error(`Failed to create account link for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Check if Connect account onboarding is complete
   * @param accountId Stripe account ID
   * @returns True if onboarding complete
   */
  async isOnboardingComplete(accountId: string): Promise<boolean> {
    if (!this.stripe) {
      return false;
    }
    
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return account.charges_enabled && account.payouts_enabled;
    } catch (error) {
      this.logger.error(`Failed to check onboarding status for ${accountId}:`, error);
      return false;
    }
  }

  /**
   * Update user's onboarding status
   * @param userId User ID
   */
  async updateOnboardingStatus(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.stripeAccountId) {
        return;
      }

      const isComplete = await this.isOnboardingComplete(user.stripeAccountId);
      
      if (isComplete && !user.stripeOnboardingComplete) {
        await this.userRepository.update(userId, {
          stripeOnboardingComplete: true,
        });
        this.logger.log(`Updated onboarding status for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update onboarding status for user ${userId}:`, error);
    }
  }

  /**
   * Get Stripe instance (for advanced operations)
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
