import { Module } from "@nestjs/common";
import { BlogController } from "./controllers/blog.controller";
import { BlogService } from "./services/blog.service";
import { BlogPostRepository } from "./repositories/blog-post.repository";
import { FirebaseModule } from "@/firebase/firebase.module";

@Module({
    imports: [FirebaseModule],
    controllers: [BlogController],
    providers: [BlogService, BlogPostRepository],
    exports: [BlogService],
})

export class BlogModule {}