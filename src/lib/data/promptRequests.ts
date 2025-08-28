import { PromptRequest } from '@/types/promptRequest';

// Mock prompt requests data - replace with actual database calls
export const mockPromptRequests: PromptRequest[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Smith',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    title: 'SEO Title Optimization Prompt',
    description: 'I need a prompt that can help optimize article titles for SEO while keeping them engaging and click-worthy. Should analyze keyword density and suggest improvements.',
    status: 'in_review',
    createdAt: '2024-01-05T09:45:12Z',
    updatedAt: '2024-01-05T09:45:12Z'
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    title: 'Legal Document Summarizer',
    description: 'Looking for a prompt that can take legal documents (contracts, terms of service, etc.) and create simple summaries highlighting the most important points for non-lawyers.',
    status: 'in_review',
    createdAt: '2023-12-18T14:30:22Z',
    updatedAt: '2024-01-15T09:30:15Z'
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Michael Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    title: 'Product Review Template Generator',
    description: 'Need a prompt that creates structured product review templates based on product category. Should include sections for pros/cons, technical specs, comparisons to alternatives, etc.',
    status: 'completed',
    createdAt: '2023-12-10T08:22:45Z',
    updatedAt: '2024-01-10T15:40:18Z'
  },
  {
    id: '4',
    userId: 'user-4',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    title: 'Scientific Research Paper Assistant',
    description: 'I would like a prompt that helps researchers structure their papers according to standard academic formats, with guidance for each section (abstract, methodology, results, discussion).',
    status: 'in_review',
    createdAt: '2024-01-08T16:35:10Z',
    updatedAt: '2024-01-08T16:35:10Z'
  },
  {
    id: '5',
    userId: 'user-5',
    userName: 'David Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    title: 'Meeting Notes Formatter',
    description: 'Need a prompt that takes raw meeting notes and transforms them into organized, actionable summaries with clear next steps, responsibilities, and deadlines.',
    status: 'rejected',
    createdAt: '2023-11-30T10:15:30Z',
    updatedAt: '2023-12-05T14:22:15Z'
  },
  {
    id: '6',
    userId: 'user-6',
    userName: 'Lisa Thompson',
    userAvatar: 'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=100&h=100&fit=crop&crop=face',
    title: 'Code Documentation Generator',
    description: 'Request for a prompt that can analyze code snippets and generate comprehensive documentation with examples. Should support multiple programming languages.',
    status: 'in_review',
    createdAt: '2024-01-12T11:20:40Z',
    updatedAt: '2024-01-12T11:20:40Z'
  },
  {
    id: '7',
    userId: 'user-7',
    userName: 'James Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    title: 'Social Media Content Calendar Creator',
    description: 'Looking for a prompt that generates a monthly content calendar for social media with theme ideas, hashtag suggestions, and content types based on industry and audience demographics.',
    status: 'approved',
    createdAt: '2023-12-28T09:05:15Z',
    updatedAt: '2024-01-03T16:30:22Z'
  },
  {
    id: '8',
    userId: 'user-8',
    userName: 'Sophia Martinez',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    title: 'Recipe Converter',
    description: 'Need a prompt that can convert recipes between different measurement systems (imperial/metric), adjust serving sizes, and suggest ingredient substitutions for dietary restrictions.',
    status: 'completed',
    createdAt: '2023-11-15T13:45:30Z',
    updatedAt: '2023-12-20T10:10:45Z'
  },
  {
    id: '9',
    userId: 'user-9',
    userName: 'Robert Kim',
    userAvatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=face',
    title: 'UX Research Interview Script Generator',
    description: 'Request for a prompt that creates customized UX research interview scripts based on research goals, product type, and target user demographics.',
    status: 'in_review',
    createdAt: '2024-01-15T15:10:20Z',
    updatedAt: '2024-01-15T15:10:20Z'
  },
  {
    id: '10',
    userId: 'user-10',
    userName: 'Olivia Garcia',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    title: 'Educational Lesson Plan Creator',
    description: 'Looking for a prompt that generates comprehensive lesson plans for teachers based on subject, grade level, learning objectives, and available resources.',
    status: 'approved',
    createdAt: '2023-12-05T08:30:15Z',
    updatedAt: '2024-01-08T11:45:30Z'
  }
];

// Database-ready functions
export async function getPromptRequests(): Promise<PromptRequest[]> {
  // TODO: Replace with actual database call
  return mockPromptRequests;
}

export async function getPromptRequestById(id: string): Promise<PromptRequest | null> {
  // TODO: Replace with actual database call
  return mockPromptRequests.find(request => request.id === id) || null;
}

export async function createPromptRequest(request: Omit<PromptRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromptRequest> {
  // TODO: Replace with actual database call
  const newRequest = {
    ...request,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockPromptRequests.push(newRequest);
  return newRequest;
}

export async function updatePromptRequest(id: string, updates: Partial<Omit<PromptRequest, 'id' | 'createdAt'>>): Promise<PromptRequest | null> {
  // TODO: Replace with actual database call
  const index = mockPromptRequests.findIndex(request => request.id === id);
  if (index === -1) return null;
  
  mockPromptRequests[index] = { 
    ...mockPromptRequests[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return mockPromptRequests[index];
}

export async function deletePromptRequest(id: string): Promise<boolean> {
  // TODO: Replace with actual database call
  const index = mockPromptRequests.findIndex(request => request.id === id);
  if (index === -1) return false;
  
  mockPromptRequests.splice(index, 1);
  return true;
}
