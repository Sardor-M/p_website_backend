import {
  Body,
  Controller,
  HttpCode,
  Post,
  HttpStatus,
  Get,
  Query,
  ParseIntPipe,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { BlogService } from '@/modules/blog/services/blog.service';

import { CreateBlogDto } from '../dto/create-blog.dto'
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { QueryBlogDto } from '../dto/query-blog.dto';

// import { BlogService } from '../services/blog.service';
// import { CreateBlogDto } from '../dto/create-blog.dto';
// import { UpdateBlogDto } from '../dto/update-blog.dto';
// import { QueryBlogDto } from '../dto/query-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() creatBlogDto: CreateBlogDto) {
    return this.blogService.create(creatBlogDto);
  }

  @Get()
  findAll(@Query() query: QueryBlogDto) {
    return this.blogService.findAll(query);
  }

  @Get('latest')
  getLatest(@Query('limit', ParseIntPipe) limit: number = 5) {
    return this.blogService.findLatest(limit);
  }

  @Get('topic/:topic')
  findByTopic(@Param('topic') topic: string) {
    return this.blogService.findByTopic(topic);
  }

  @Put(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updaBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updaBlogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}
