import 'reflect-metadata';
import './crypto-patch';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { FirebaseService } from './firebase/firebase.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // app.enableCors({
  //   origin: ['http://localhost:5173'],
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   credentials: true,
  //   allowedHeaders: [
  //     'Origin', 
  //     'X-Requested-With', 
  //     'Content-Type', 
  //     'Accept', 
  //     'Authorization', 
  //     'X-CSRF-TOKEN', 
  //     'CSRF-Token'
  //   ],
  // });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          // connectSrc: ["'self'", 'https://portfolio-e80b2.web.app', 'http://localhost:5173'],
          connectSrc: ["'self'", 'https://portfolio-e80b2.web.app'],
          fontSrc: ["'self'", 'https:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: { policy: 'require-corp' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hsts: { maxAge: 15552000, includeSubDomains: true },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'no-referrer' },
      xssFilter: true,
    }),
  );

  app.use(compression());

  app.use(cookieParser());

  // csrf protection enabled
  app.use(csurf({ cookie: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);

  try {
    const firebaseService = app.get(FirebaseService);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const firestore = firebaseService.getFirestore();
    if (firestore) {
      console.log('Firebase Firestore connected successfully');
    }
  } catch (error) {
    console.error('Firebase connection failed:', error);
  }
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
