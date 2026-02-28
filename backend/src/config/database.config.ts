import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Support both individual DB variables and DATABASE_URL
const getDatabaseUrl = (): string | undefined => {
  // If DATABASE_URL is set, use it directly
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return undefined;
};

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
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  // Connection retry options
  extra: {
    connectionLimit: 5,
  },
  // Retry connection on startup
  retryAttempts: 3,
  retryDelay: 3000,
};
