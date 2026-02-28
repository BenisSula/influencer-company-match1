import { registerAs } from '@nestjs/config';

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  connectClientId: string;
  platformFeePercent: number;
  currency: string;
}

export default registerAs('stripe', (): StripeConfig => {
  const config: StripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID || '',
    platformFeePercent: parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT || '10', 10),
    currency: process.env.STRIPE_CURRENCY || 'usd',
  };

  // Validate required fields in production
  if (process.env.NODE_ENV === 'production') {
    const requiredFields: (keyof StripeConfig)[] = [
      'secretKey',
      'publishableKey',
      'webhookSecret',
      'connectClientId',
    ];

    const missingFields = requiredFields.filter((field) => !config[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required Stripe configuration: ${missingFields.join(', ')}. ` +
        `Please set the following environment variables: ${missingFields.map(f => `STRIPE_${f.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join(', ')}`
      );
    }
  }

  // Validate platform fee percent
  if (config.platformFeePercent < 0 || config.platformFeePercent > 100) {
    throw new Error('STRIPE_PLATFORM_FEE_PERCENT must be between 0 and 100');
  }

  return config;
});
