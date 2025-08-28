export interface Post {
  id: number;
  title: string;
  author: string;
  date: string;
  status: 'Published' | 'Draft';
}

export type PostStatus = Post['status'];