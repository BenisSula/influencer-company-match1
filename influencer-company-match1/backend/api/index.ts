import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppServerlessModule } from '../src/app-serverless.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

// Cache the server instance
let server: any;

async function bootstrap() {
  if (!server) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppServerlessModule, adapter, {
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
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};
