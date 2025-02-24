import { BlogPost } from '../modules/blog/entities/blog-post.entity';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'shaxsiy_blog_db',
  // entities: [BlogPost],
  // migrations: ['src/migrations/*.ts'],


  entities: [
    BlogPost,
    join(__dirname, '..', 'modules', '**', 'entities', '**', '*.{ts,js}')
  ],  
  migrations: [join(__dirname, '..', 'migrations', '**', '*.{ts,js}')],
  logging: true,
  synchronize: false,
};

export const dataSource = new DataSource(dataSourceOptions);
