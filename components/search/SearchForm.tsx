'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface Props {
  variant?: 'header' | 'mobile';
  onSubmit?: () => void;
}

export default function SearchForm({ variant = 'header', onSubmit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    onSubmit?.();
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  if (variant === 'mobile') {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 w-4 h-4 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جستجو..."
          className="w-full border border-gray-200 rounded-xl pe-10 ps-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 w-4 h-4 pointer-events-none" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="جستجو در ابزار، برند و دسته‌بندی..."
        className="
          w-full bg-white/10 border border-white/20 rounded-xl
          pe-10 ps-4 py-2.5 text-sm text-white placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand/70 focus:bg-white/15
          transition-all duration-200
        "
      />
    </form>
  );
}
