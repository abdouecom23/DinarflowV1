import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './src/server/app.module';
import { AllExceptionsFilter } from './src/server/common/all-exceptions.filter';
import { StructuredLogger } from './src/server/common/structured-logger';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from "vite";

// Map platform SQL_ variables to DB_ variables if present (overriding container defaults)
if (process.env.SQL_HOST) process.env.DB_HOST = process.env.SQL_HOST;
if (process.env.SQL_USER) process.env.DB_USER = process.env.SQL_USER;
if (process.env.SQL_PASSWORD) process.env.DB_PASS = process.env.SQL_PASSWORD;
if (process.env.SQL_DB_NAME) process.env.DB_NAME = process.env.SQL_DB_NAME;
if (!process.env.DB_PORT) process.env.DB_PORT = '5432';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'dev_secret_key_low_entropy';

const required = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

async function bootstrap() {
  const structuredLogger = new StructuredLogger();
  const app = await NestFactory.create(AppModule, {
    logger: structuredLogger,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new AllExceptionsFilter());
  
  const expressApp = app.getHttpAdapter().getInstance();
  
  // Helper to check if a request path belongs to a NestJS backend route
  const isBackendRoute = (url: string) => {
    return url.startsWith('/api/v1') || url.startsWith('/health') || url.startsWith('/metrics');
  };

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middleware for anything that isn't a NestJS route
    expressApp.use((req, res, next) => {
      if (isBackendRoute(req.url)) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res, next) => {
      if (isBackendRoute(req.url)) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await app.listen(3000, '0.0.0.0');
}
bootstrap();

