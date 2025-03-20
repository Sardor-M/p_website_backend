import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogPostRepository } from '../repositories/blog-post.repository';
import { 
} from '../dto/create-blog.dto';
import { CreateBlogDto } from '../dto/create-blog.dto';
import {Upda}

@Injectable()
export class BlogService {
  constructor(private readonly blogPostRepository: BlogPostRepository) {}

  async findAll(): Promise<BlogPost[]> {
    return this.blogPostRepository.findAll();
  }

  async findOne(id: string): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.findOne(id);
    
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }
    
    return blogPost;
  }

  async create(createBlogPostDto: CreateBlogDto): Promise<BlogPost> {
    return this.blogPostRepository.create(createBlogPostDto);
  }

  async update(id: string, updateBlogPostDto: UpdateBlogDto): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.update(id, updateBlogPostDto);
    
    if (!blogPost) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }
    
    return blogPost;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.blogPostRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }
  }

  async findByTopic(topic: string): Promise<BlogPost[]> {
    return this.blogPostRepository.findByTopic(topic);
  }

  async findLatest(limit: number): Promise<BlogPost[]>{
    return this.blogPostRepository.findLatest(limit);
  }
}