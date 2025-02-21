export interface BlogContent {
    type: string;
    text?: string;
    level?: number;
    language?: string;
    content?: string;
  }
  
  export interface BlogAuthor {
    name: string;
    image: string;
    bio: string;
  }
  
  export interface Blog {
    id: number;
    title: string;
    subtitle?: string;
    date: Date;
    author: BlogAuthor;
    readTime: string;
    topics: string[];
    content: BlogContent[];
    createdAt: Date;
    updatedAt: Date;
  }