export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Author' | 'Viewer';
  avatar?: string;
  status: UserStatus;
  accountType?: 'free' | 'pro';
  lastLogin?: string;
  lastActivity?: string;
  createdAt: string;
  company?: string;
  professionalRole?: string; // Designer, Developer, Marketer, etc.
  usagePurpose?: 'personal' | 'studies' | 'work';
  likedPrompts?: number;
  likedKits?: number;
  promptReviews?: number;
  kitReviews?: number;
  collections?: number;
  averageRating?: number;
  accountAge?: string;
  postCount?: number;
}

export type UserRole = User['role'];