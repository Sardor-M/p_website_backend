import { BlogPost } from "@/entities/blog-post.entity";
import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'shaxsiy_blog_db',
    entities: [BlogPost],
    migrations: ['src/migrations/*.ts'],
});