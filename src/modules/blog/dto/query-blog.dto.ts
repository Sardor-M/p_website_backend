import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryBlogDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
