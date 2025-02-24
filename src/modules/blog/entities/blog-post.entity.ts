import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subtitle: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column('jsonb')
  author: {
    name: string;
    image: string;
    bio: string;
  };

  @Column({ type: 'varchar', length: 70 })
  readTime: string;

  @Column('text', { array: true })
  topics: string[];

  @Column('jsonb')
  content: Array<{
    type: string;
    text?: string;
    level?: number;
    language?: string;
    content?: string;
  }>;

  @CreateDateColumn({type: 'timestamp'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamp'})
  updatedAt: Date;
}
