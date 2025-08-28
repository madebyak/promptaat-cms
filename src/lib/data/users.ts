import { User } from '@/types/user';

// Mock users data - replace with actual database calls
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    status: 'active',
    accountType: 'pro',
    lastLogin: '2024-01-15T10:30:00Z',
    lastActivity: '2024-01-15T11:45:00Z',
    createdAt: '2023-01-15',
    postCount: 25,
    company: 'Promptaat Inc.',
    professionalRole: 'Developer',
    usagePurpose: 'work',
    likedPrompts: 32,
    likedKits: 14,
    promptReviews: 17,
    kitReviews: 8,
    collections: 5,
    averageRating: 4.5,
    accountAge: '1 year, 6 days'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
    status: 'active',
    accountType: 'pro',
    lastLogin: '2024-01-14T15:45:00Z',
    lastActivity: '2024-01-15T09:20:00Z',
    createdAt: '2023-02-20',
    postCount: 18,
    company: 'Design Masters',
    professionalRole: 'Designer',
    usagePurpose: 'work',
    likedPrompts: 45,
    likedKits: 23,
    promptReviews: 22,
    kitReviews: 11,
    collections: 7,
    averageRating: 4.8,
    accountAge: '11 months, 1 day'
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'Author',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    status: 'active',
    accountType: 'pro',
    lastLogin: '2024-01-13T09:15:00Z',
    lastActivity: '2024-01-13T14:30:00Z',
    createdAt: '2023-03-10',
    postCount: 12,
    company: 'AI Innovations',
    professionalRole: 'Data Scientist',
    usagePurpose: 'work',
    likedPrompts: 28,
    likedKits: 12,
    promptReviews: 15,
    kitReviews: 7,
    collections: 4,
    averageRating: 4.2,
    accountAge: '10 months, 11 days'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'Author',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    status: 'active',
    accountType: 'free',
    lastLogin: '2024-01-12T14:20:00Z',
    lastActivity: '2024-01-13T08:15:00Z',
    createdAt: '2023-04-05',
    postCount: 8,
    company: 'Creative Writing Co.',
    professionalRole: 'Content Creator',
    usagePurpose: 'personal',
    likedPrompts: 36,
    likedKits: 19,
    promptReviews: 11,
    kitReviews: 5,
    collections: 6,
    averageRating: 4.6,
    accountAge: '9 months, 16 days'
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    status: 'blocked',
    accountType: 'free',
    lastLogin: '2023-12-20T11:30:00Z',
    lastActivity: '2023-12-20T11:45:00Z',
    createdAt: '2023-05-15',
    postCount: 3,
    company: 'Freelancer',
    professionalRole: 'Consultant',
    usagePurpose: 'work',
    likedPrompts: 7,
    likedKits: 2,
    promptReviews: 1,
    kitReviews: 0,
    collections: 1,
    averageRating: 3.5,
    accountAge: '8 months, 6 days'
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    role: 'Editor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    status: 'active',
    accountType: 'pro',
    lastLogin: '2024-01-11T16:10:00Z',
    lastActivity: '2024-01-12T10:05:00Z',
    createdAt: '2023-06-22',
    postCount: 15,
    company: 'Marketing Pros',
    professionalRole: 'Marketer',
    usagePurpose: 'work',
    likedPrompts: 52,
    likedKits: 27,
    promptReviews: 19,
    kitReviews: 12,
    collections: 9,
    averageRating: 4.7,
    accountAge: '6 months, 29 days'
  },
  {
    id: 7,
    name: 'Tom Rodriguez',
    email: 'tom.rodriguez@company.com',
    role: 'Author',
    status: 'active',
    accountType: 'free',
    lastLogin: '2024-01-10T08:45:00Z',
    lastActivity: '2024-01-10T16:30:00Z',
    createdAt: '2023-07-18',
    postCount: 6,
    company: 'University of AI',
    professionalRole: 'Student',
    usagePurpose: 'studies',
    likedPrompts: 41,
    likedKits: 15,
    promptReviews: 8,
    kitReviews: 3,
    collections: 4,
    averageRating: 4.1,
    accountAge: '5 months, 28 days'
  },
  {
    id: 8,
    name: 'Anna Miller',
    email: 'anna.miller@company.com',
    role: 'Viewer',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    status: 'active',
    accountType: 'free',
    lastLogin: '2024-01-09T13:25:00Z',
    lastActivity: '2024-01-09T15:40:00Z',
    createdAt: '2023-08-30',
    postCount: 0,
    company: 'Personal Use',
    professionalRole: 'Hobbyist',
    usagePurpose: 'personal',
    likedPrompts: 24,
    likedKits: 8,
    promptReviews: 5,
    kitReviews: 2,
    collections: 3,
    averageRating: 4.3,
    accountAge: '4 months, 21 days'
  }
];

// Database-ready functions
export async function getUsers(): Promise<User[]> {
  // TODO: Replace with actual database call
  // Example: return await db.users.findMany();
  return mockUsers;
}

export async function getUserById(id: number): Promise<User | null> {
  // TODO: Replace with actual database call
  // Example: return await db.users.findUnique({ where: { id } });
  return mockUsers.find(user => user.id === id) || null;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  // TODO: Replace with actual database call
  // Example: return await db.users.create({ data: user });
  const newUser = { 
    ...user, 
    id: Math.max(...mockUsers.map(u => u.id)) + 1,
    createdAt: new Date().toISOString().split('T')[0]
  };
  mockUsers.push(newUser);
  return newUser;
}

export async function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
  // TODO: Replace with actual database call
  // Example: return await db.users.update({ where: { id }, data: updates });
  const index = mockUsers.findIndex(user => user.id === id);
  if (index === -1) return null;
  
  mockUsers[index] = { ...mockUsers[index], ...updates };
  return mockUsers[index];
}

export async function deleteUser(id: number): Promise<boolean> {
  // TODO: Replace with actual database call
  // Example: await db.users.delete({ where: { id } }); return true;
  const index = mockUsers.findIndex(user => user.id === id);
  if (index === -1) return false;
  
  mockUsers.splice(index, 1);
  return true;
}