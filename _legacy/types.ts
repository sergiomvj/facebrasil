
export interface Author {
  name: string;
  avatar: string;
}

export interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: Author;
  readTime: string;
  image: string;
  featured?: boolean;
}

export interface Edition {
  id: string;
  title: string;
  number: string;
  image: string;
}
