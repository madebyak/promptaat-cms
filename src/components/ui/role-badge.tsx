import { UserRole } from '@/types/user';

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = {
    Admin: 'bg-red-100 text-red-800',
    Editor: 'bg-blue-100 text-blue-800',
    Author: 'bg-green-100 text-green-800',
    Viewer: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[role]}`}>
      {role}
    </span>
  );
}