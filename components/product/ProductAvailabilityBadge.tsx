import { cn } from '@/lib/utils';
import type { AvailabilityStatus } from '@/lib/types';

const STATUS_STYLES: Record<AvailabilityStatus, string> = {
  in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  out_of_stock: 'bg-red-50 text-red-700 border-red-200',
  restocking: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ProductAvailabilityBadge({
  status,
  label,
}: {
  status: AvailabilityStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border',
        STATUS_STYLES[status],
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'in_stock' && 'bg-emerald-500',
        status === 'out_of_stock' && 'bg-red-500',
        status === 'restocking' && 'bg-amber-500 animate-pulse',
      )} />
      {label}
    </span>
  );
}
