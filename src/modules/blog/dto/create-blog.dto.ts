import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

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
        image: string;
        bio: string
    }

    @IsNotEmpty()
    @IsString()
    readTime: string;

    @IsArray()
    @IsString({each: true})
    topics: string[];
    
    @IsArray()
    content: Array<{
        type: string;
        text?: string;
        level?: number;
        language?: string;
        content?: string;
    }>
}