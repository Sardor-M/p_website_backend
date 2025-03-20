import { BlogPost } from '@/types';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  @IsObject()
  author: {
    name: string;
    avatar?: string;
  };

  @IsNotEmpty()
  @IsString()
  readTime: string;

  @IsNotEmpty()
  @IsArray()
  topics: string[];

  @IsNotEmpty()
  @IsObject()
  content: {
    html: string;
    blocks?: any[];
    entityMap?: Record<string, any>;
  };
}

// helper method to convert Firestore data to a BlogPost object
export const convertFirestoreToBlogPost = (
    id: string,
    data: FirebaseFirestore.DocumentData
  ): BlogPost => {
    return {
      id,
      title: data.title,
      subtitle: data.subtitle,
      date: data.date ? data.date.toDate ? data.date.toDate() : new Date(data.date) : null,
      author: data.author,
      readTime: data.readTime,
      topics: data.topics,
      content: data.content,
      createdAt: data.createdAt ? data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt) : null,
      updatedAt: data.updatedAt ? data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt) : null,
    };
  };