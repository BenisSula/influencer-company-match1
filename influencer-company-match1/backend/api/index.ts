import { config } from 'dotenv';

// Load environment variables FIRST before any other imports
config();

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppServerlessModule } from '../src/app-serverless.module';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import * as express from 'express';

// Cache the server instance
let server: express.Express;

async function bootstrap(): Promise<express.Express> {
  if (!server) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app: INestApplication = await NestFactory.create(AppServerlessModule, adapter, {
      logger: ['error', 'warn'],
      abortOnError: false,
    });

    // Enable CORS
    app.enableCors({
      origin: true, // Allow all origins for now
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      })
    );

    // Set global prefix
    app.setGlobalPrefix('api');

    await app.init();
    server = expressApp;
  }
  
  return server;
}

// Vercel serverless function handler
module.exports = async (req: any, res: any) => {
  try {
    console.log('[Serverless] Starting bootstrap...');
    console.log('[Serverless] Environment:', process.env.NODE_ENV);
    console.log('[Serverless] DATABASE_URL set:', !!process.env.DATABASE_URL);
    console.log('[Serverless] DB_HOST:', process.env.DB_HOST);
    
    const app = await bootstrap();
    console.log('[Serverless] Bootstrap complete, handling request...');
    
    return app(req, res);
  } catch (error: any) {
    console.error('[Serverless] FATAL ERROR:', error);
    console.error('[Serverless] Error stack:', error.stack);
    console.error('[Serverless] Error name:', error.name);
    
    // Try to send a response with more details
    try {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    } catch (sendError) {
      // If we can't send JSON, just return basic error
      console.error('[Serverless] Could not send error response:', sendError);
      return res.status(500).send('Internal Server Error');
    }
  }
};
