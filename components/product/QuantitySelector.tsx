'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/lib/utils';

interface Props {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (quantity: number) => void;
  size?: 'sm' | 'md';
}

export default function QuantitySelector({
  quantity,
  min = 1,
  max,
  onChange,
  size = 'md',
}: Props) {
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const inputSize = size === 'sm' ? 'h-8 w-12' : 'h-10 w-14';

  const handleInput = (value: string) => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return;
    let next = Math.max(min, num);
    if (max != null && max > 0) next = Math.min(next, max);
    onChange(next);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className={cn(btnSize, 'flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
        aria-label="کاهش تعداد"
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={(e) => handleInput(e.target.value)}
        className={cn(inputSize, 'text-center text-sm font-bold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30')}
        aria-label="تعداد"
      />

      <button
        type="button"
        onClick={() => {
          const next = quantity + 1;
          if (max != null && max > 0 && next > max) return;
          onChange(next);
        }}
        disabled={max != null && max > 0 && quantity >= max}
        className={cn(btnSize, 'flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
        aria-label="افزایش تعداد"
      >
        <Plus className="w-4 h-4" />
      </button>

      {max != null && max > 0 && (
        <span className="text-xs text-gray-400 ms-2">
          حداکثر {toPersianDigits(max)}
        </span>
      )}
    </div>
  );
}
