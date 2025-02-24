import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlogTable1740373711722 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create table
        await queryRunner.query(`
            CREATE TABLE "blog_posts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "subtitle" character varying(255),
                "date" TIMESTAMP NOT NULL,
                "author" jsonb NOT NULL,
                "readTime" character varying(70) NOT NULL,
                "topics" text[] NOT NULL,
                "content" jsonb NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_dd2add25eac93daefc93da9d387" PRIMARY KEY ("id")
            )
        `);

        // Insert sample data
        await queryRunner.query(`
            INSERT INTO blog_posts (title, subtitle, date, author, "readTime", topics, content)
            VALUES 
                (
                    'Getting Started with React Hooks',
                    'A comprehensive guide to React''s most powerful feature',
                    '2025-01-01 00:00:00',
                    '{"name": "John Doe", "image": "/api/placeholder/48/48", "bio": "Senior Frontend Developer"}'::jsonb,
                    '4 min read',
                    ARRAY['React', 'Frontend', 'Web Development'],
                    '[
                        {"type": "heading", "level": 2, "text": "Understanding React Hooks"},
                        {"type": "paragraph", "text": "Hooks are a powerful feature introduced in React 16.8 that allow you to use state and other React features in functional components."},
                        {"type": "heading", "level": 3, "text": "Why Hooks?"},
                        {"type": "paragraph", "text": "Hooks solve many problems that developers faced with class components and lifecycle methods."}
                    ]'::jsonb
                ),
                (
                    'Node.js Best Practices for 2025',
                    'Optimize your Node.js applications for production',
                    '2025-02-01 00:00:00',
                    '{"name": "Jane Smith", "image": "/api/placeholder/48/48", "bio": "Backend Architecture Specialist"}'::jsonb,
                    '2 min read',
                    ARRAY['Node.js', 'Backend', 'Performance'],
                    '[
                        {"type": "heading", "level": 2, "text": "Building Scalable Node.js Applications"},
                        {"type": "paragraph", "text": "Learn the essential practices for creating production-ready Node.js applications that can handle high traffic and complex operations."},
                        {"type": "heading", "level": 3, "text": "Performance Optimization"},
                        {"type": "paragraph", "text": "Discover key strategies for optimizing your Node.js application''s performance."}
                    ]'::jsonb
                )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "blog_posts"`);
    }
}