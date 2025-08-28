export type AdminRole = 'super_admin' | 'content_admin' | 'moderator';

export interface Admin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  created_by?: string; // Reference to admin who created this account
  created_by_name?: string; // For display purposes - computed from created_by lookup
  last_login?: string;
  created_at: string;
  updated_at: string;
}
