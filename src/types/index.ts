export type BlogPost = {
  id: string;
  title: string;
  subtitle?: string;
  date: Date | string;
  author: {
    name: string;
    avatar?: string;
  };
  readTime: string;
  topics: string[];
  content: {
    html: string;
    blocks?: any[];
    entityMap?: Record<string, any>;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
};
