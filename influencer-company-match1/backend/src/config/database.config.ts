import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseConfig');

// Support both individual DB variables and DATABASE_URL
const getDatabaseUrl = (): string | undefined => {
  // If DATABASE_URL is set, use it directly
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return undefined;
};

const synchronizeEnabled = process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV === 'development';

// Log configuration for debugging
logger.log(`Database synchronize enabled: ${synchronizeEnabled}`);
logger.log(`Database URL: ${getDatabaseUrl() ? 'set' : 'not set'}`);
logger.log(`DB_SYNCHRONIZE env: ${process.env.DB_SYNCHRONIZE}`);
logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  // Use DATABASE_URL if available (Render provides this)
  url: getDatabaseUrl(),
  // Fallback to individual connection parameters
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'influencer_matching',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // Enable synchronize for initial setup (disable after tables are created for security)
  // Note: DB_SYNCHRONIZE takes precedence over NODE_ENV
  synchronize: synchronizeEnabled,
  logging: process.env.NODE_ENV === 'development',
  // Connection retry options
  extra: {
    connectionLimit: 5,
  },
  // Retry connection on startup - increased for production
  retryAttempts: 5,
  retryDelay: 5000,
};
