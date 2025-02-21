import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from '@/config/database/database.config'
import { BlogPost } from '@/modules/blog/entities/blog-post.entity';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities:[BlogPost], // buyerda explicitly specify qilamiz
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}