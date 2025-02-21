import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogPost } from '../entities/blog-post.entity';
import { ILike, Repository } from 'typeorm';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { QueryBlogDto } from '../dto/query-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepository: Repository<BlogPost>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<BlogPost> {
    const newBlog = this.blogRepository.create({
      ...createBlogDto,
      topics: createBlogDto.topics || [],
    } as BlogPost);
    
    return await this.blogRepository.save(newBlog);
  }

  async findAll(query: QueryBlogDto) {
    const { search, topic, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.blogRepository.createQueryBuilder('blog');

    if (search) {
      queryBuilder.where(
        'blog.title ILIKE : search OR blog.title ILIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    if (topic) {
      queryBuilder.andWhere(':topic = ANY(blog.topics', { topic });
    }

    queryBuilder.orderBy('blog.date', 'DESC').skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<BlogPost> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Blog post with ID ${id} is not found`);
    }
    return blog;
  }

  async update(id: number, UpdateBlogDto: UpdateBlogDto): Promise<BlogPost> {
    const blog = await this.findOne(id);
    Object.assign(blog, UpdateBlogDto);
    return await this.blogRepository.save(blog);
  }

  async remove(id: number): Promise<void> {
    const result = await this.blogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Blog post with ID ${id} is not found`);
    }
  }

  async findByTopic(topic: string) {
    return await this.blogRepository.find({
      where: {
        topics: ILike(`%${topic}%`),
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async findLatest(limit: number = 5) {
    return await this.blogRepository.find({
      order: {
        date: 'DESC',
      },
      take: limit,
    });
  }
}
