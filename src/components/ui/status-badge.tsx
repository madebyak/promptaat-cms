import { PostStatus } from '@/types/post';

interface StatusBadgeProps {
  status: PostStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Published: 'bg-green-100 text-green-800',
    Draft: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}