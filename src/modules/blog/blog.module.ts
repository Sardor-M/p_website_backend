import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogPost } from "./entities/blog-post.entity";
import { BlogController } from "./controllers/blog.controller";
import { BlogService } from "./services/blog.service";

@Module({
    imports: [TypeOrmModule.forFeature([BlogPost])],
    controllers: [BlogController],
    providers: [BlogService],
    exports: [BlogService],
})

export class BlogModule {}