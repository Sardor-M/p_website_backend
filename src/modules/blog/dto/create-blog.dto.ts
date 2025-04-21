import { AuthorData, BlogPost, DataStructure } from '@/types';
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

  @IsOptional()
  @IsString()
  readTime?: string;

  @IsOptional()
  @IsString()
  introduction?: string;

  @IsOptional()
  @IsArray()
  dataStructures?: DataStructure[];

  @IsNotEmpty()
  @IsObject()
  metadata: AuthorData;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

// helper method to convert Firestore data to a BlogPost object
export const convertFirestoreToBlogPost = (
  id: string,
  data: FirebaseFirestore.DocumentData,
): BlogPost => {
  const formatDate = (dateField: any) => {
    if (!dateField) return '';
    return dateField.toDate
      ? dateField.toDate().toISOString()
      : new Date(dateField).toISOString();
  };

  const metadata: AuthorData = {
    author: {
      name: data.metadata.author.name || data.author.name,
      bio: data.metadata.author.bio || data.author.bio,
    },
    topics: data.metadata.topics || data.topics,
  };

  return {
    id,
    title: data.title || '',
    subtitle: data.subtitle || '',
    date: formatDate(data.date),
    readTime: data.readTime || '10 min read',
    introduction: data.introduction || '',
    dataStructures: data.dataStructures || [],
    metadata: metadata,
    createdAt: formatDate(data.createdAt),
    updatedAt: formatDate(data.updatedAt),
  };
};
