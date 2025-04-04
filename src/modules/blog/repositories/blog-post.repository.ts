import { Injectable } from '@nestjs/common';
import { FirebaseService } from '@/firebase/firebase.service';
import {    
  convertFirestoreToBlogPost 
} from '../dto/create-blog.dto';
import { v4 as uuidv4 } from 'uuid';
import {UpdateBlogDto } from '../dto/update-blog.dto';
import {CreateBlogDto} from "../dto/create-blog.dto"
import { BlogPost } from '@/types';

@Injectable()
export class BlogPostRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getBlogPostsCollection();
  }

  async findAll(): Promise<BlogPost[]> {
    const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
    
    return snapshot.docs.map(doc => 
      convertFirestoreToBlogPost(doc.id, doc.data())
    );
  }

  async findOne(id: string): Promise<BlogPost | null> {
    const doc = await this.collection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return convertFirestoreToBlogPost(doc.id, doc.data()!);
  }

  async create(createBlogPostDto: CreateBlogDto): Promise<BlogPost> {
    const id = uuidv4();
    const now = new Date();
    
    const blogPostData = {
      ...createBlogPostDto,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      date: now.toISOString()
    };
    
    await this.collection.doc(id).set(blogPostData);
    
    return blogPostData as BlogPost;
  }

  async update(id: string, updateBlogPostDto: UpdateBlogDto): Promise<BlogPost | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    const updateData = {
      ...updateBlogPostDto,
      updatedAt: new Date()
    };
    
    await docRef.update(updateData);
    
    // we get the updated doc
    const updatedDoc = await docRef.get();
    return convertFirestoreToBlogPost(updatedDoc.id, updatedDoc.data()!);
  }

  async delete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  async findByTopic(topic: string): Promise<BlogPost[]> {
    const snapshot = await this.collection
      .where('topics', 'array-contains', topic)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      convertFirestoreToBlogPost(doc.id, doc.data())
    );
  }

  async findLatest(limit: number = 5): Promise<BlogPost[]> {
    const snapshot = await this.collection
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => 
      convertFirestoreToBlogPost(doc.id, doc.data())
    );
  }
}
