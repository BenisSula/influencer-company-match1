import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

// Create Express app
const expressApp = express();

// Cache the NestJS app instance
let cachedApp: any = null;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['error', 'warn', 'log'],
    }
  );

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL,
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  await app.init();

  cachedApp = expressApp;
  return expressApp;
}

// Export the serverless function handler
export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};
