import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogController } from './modules/blog/controllers/blog.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { XssProtectionMiddleware } from './common/middleware/xss-protection.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { APP_GUARD } from '@nestjs/core';
import { CsrfController } from './modules/blog/controllers/csrf.controller';
import { CsrfMiddleware } from './common/middleware/csrf.middlware';
import { FirebaseModule } from './firebase/firebase.module';
import { BlogModule } from './modules/blog/blog.module';
import { HealthController } from './modules/blog/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    FirebaseModule,
    BlogModule
  ],
  controllers: [BlogController, CsrfController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(XssProtectionMiddleware)
      .forRoutes('*')
      .apply(CsrfMiddleware)
      .exclude(
        { path: '/blog', method: RequestMethod.GET },
        { path: '/blog/*', method: RequestMethod.GET },
      )
      .forRoutes(
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.PATCH },
        { path: '*', method: RequestMethod.DELETE },
      )
      .apply(RateLimitMiddleware)
      .forRoutes({
        path: '/blog/*blogPath',
        method: RequestMethod.ALL,
      });
  }
}
