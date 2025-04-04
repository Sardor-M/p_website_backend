export type BlogPost = {
  id?: string; 
  title?: string;
  subtitle?: string;
  date?: string;
  readTime?: string;
  introduction?: string;
  dataStructures?: DataStructure[];
  metadata:  AuthorData,
  createdAt?: string;
  updatedAt?: string;
};

export type AuthorData = {
  author: {
    name: string;
    bio?: string;
  };
  topics: string[];
};

export type DataStructure = {
  name: string;
  description: string;
  notes?: string;
  realWorldApplications?: string[];
  useCases?: string[];
  examples?: Array<{
    command: string;
    description: string;
    language?: string;
    type?: string;
    returns?: string | string[];
  }>;
  advantages?: string[];
  features?: string[];
  traditionalApproach?: string[];
};