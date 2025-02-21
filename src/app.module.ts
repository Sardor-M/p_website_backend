import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database/database.config';
import { DatabaseModule } from './config/database/database.module';
import { BlogService } from './modules/blog/services/blog.service';
import { BlogController } from './modules/blog/controllers/blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './modules/blog/entities/blog-post.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([BlogPost])
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class AppModule {}
