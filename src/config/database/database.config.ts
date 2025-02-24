import { BlogPost } from '@/modules/blog/entities/blog-post.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  if (process.env.DATABASE_URL) {
    // production db configs setup
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, 
      },
      entities: [BlogPost],
      synchronize: false,
      logging: false,
      migrations: ['dist/migrations/*.js'],
      migrationsRun: true,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'shaxsiy_blog_db',
    entities: [BlogPost],
    synchronize: process.env.NODE_ENV !== 'production', // productionda careful bolish kerak
    logging: process.env.NODE_ENV === 'development',
    migrations: ['dist/migrations/*.js'],
    migrationsRun: process.env.NODE_ENV === 'production',
  };
});
