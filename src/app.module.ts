import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database/database.config';
import { DatabaseModule } from './config/database/database.module';
import { BlogService } from './modules/blog/services/blog.service';
import { BlogController } from './modules/blog/controllers/blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './modules/blog/entities/blog-post.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { XssProtectionMiddleware } from './common/middleware/xss-protection.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { APP_GUARD } from '@nestjs/core';
import { CsrfController } from './modules/blog/controllers/csrf.controller';
import { CsrfMiddleware } from './common/middleware/csrf.middlware';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    DatabaseModule,
    TypeOrmModule.forFeature([BlogPost])
  ],
  controllers: [BlogController, CsrfController],
  providers: [
    BlogService,
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
      .forRoutes('*')
      .apply(RateLimitMiddleware)
      .forRoutes({
        path: '/blog/*blogPath',
        method: RequestMethod.ALL
      });
  }
}
