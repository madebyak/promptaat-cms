export interface PromptRequest {
  id: string;
  userId: string;
  userName: string; // Added for display purposes
  userAvatar?: string; // Added for display purposes
  title: string;
  description: string;
  status: 'in_review' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export type PromptRequestStatus = PromptRequest['status'];
