'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Clock,
  X,
  Trash2,
  Folder,
  Tag,
  Loader2,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import type { SearchSuggestionsData, SearchHistoryItem } from '@/lib/types';
import {
  getSearchSuggestions,
  getSearchHistory,
  recordSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem,
} from '@/lib/api';
import { toPersianDigits } from '@/lib/utils';
import { useAuth } from '@/lib/stores/auth-context';

interface Props {
  className?: string;
  placeholder?: string;
  onSearchSubmitted?: () => void;
}

const LOCAL_STORAGE_KEY = 'arad_search_history_v1';

export default function SearchForm({
  className = '',
  placeholder = 'جستجو در نام محصول، برند (لیهو، بوش...)، مدل یا کد کالا...',
  onSearchSubmitted,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionsData | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with URL query parameter
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  // Load search history from local storage and backend API
  useEffect(() => {
    const loadHistory = async () => {
      let localItems: SearchHistoryItem[] = [];
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          localItems = JSON.parse(stored) as SearchHistoryItem[];
        }
      } catch {
        // Ignore localStorage error
      }

      setHistory(localItems);

      try {
        const apiHistory = await getSearchHistory(token ?? undefined);
        if (apiHistory && apiHistory.length > 0) {
          setHistory(apiHistory);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiHistory));
          } catch {
            // Ignore
          }
        }
      } catch {
        // Fallback to local items
      }
    };

    void loadHistory();
  }, [token]);

  // Outside click listener to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!trimmed) {
      setSuggestions(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await getSearchSuggestions(trimmed, 6);
        setSuggestions(data);
      } catch {
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const saveToHistory = (searchTerm: string) => {
    const clean = searchTerm.trim();
    if (!clean) return;

    const updated = [
      { id: Date.now(), query: clean, created_at: new Date().toISOString() },
      ...history.filter((h) => h.query.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 10);

    setHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    void recordSearchHistory(clean, token ?? undefined);
  };

  const handleClearHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
    await clearSearchHistory(token ?? undefined);
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: number, term: string) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id && h.query !== term);
    setHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    await deleteSearchHistoryItem(id, token ?? undefined);
  };

  const executeSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    saveToHistory(trimmed);
    setIsOpen(false);
    onSearchSubmitted?.();
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    // Check if an exact match exists for direct navigation
    if (suggestions?.exact_match) {
      saveToHistory(trimmed);
      setIsOpen(false);
      onSearchSubmitted?.();
      router.push(`/product/${encodeURIComponent(suggestions.exact_match.slug)}`);
      return;
    }

    executeSearch(trimmed);
  };

  const hasSuggestions = Boolean(
    suggestions &&
      (suggestions.products.length > 0 ||
        suggestions.categories.length > 0 ||
        suggestions.brands.length > 0 ||
        suggestions.exact_match)
  );

  const showHistory = isOpen && !query.trim() && history.length > 0;
  const showResults = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {loading ? (
          <Loader2 className="absolute top-1/2 -translate-y-1/2 end-3.5 text-brand w-4 h-4 animate-spin pointer-events-none" />
        ) : (
          <Search className="absolute top-1/2 -translate-y-1/2 end-3.5 w-4 h-4 pointer-events-none text-gray-300 transition-colors" />
        )}

        <input
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white/10 border border-white/20 rounded-xl pe-10 ps-4 py-2.5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/70 focus:bg-white/15 transition-all duration-200"
          autoComplete="off"
          spellCheck="false"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions(null);
            }}
            className="absolute top-1/2 -translate-y-1/2 start-3 p-0.5 text-gray-400 hover:text-gray-200 rounded-full transition-colors cursor-pointer"
            title="پاک کردن متن"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Floating Dropdown */}
      {(showHistory || showResults) && (
        <div
          className="
            absolute top-full start-0 end-0 mt-2 z-50
            bg-white rounded-2xl shadow-2xl border border-gray-100
            overflow-hidden text-gray-800 divide-y divide-gray-100
            animate-in fade-in slide-in-from-top-2 duration-150
            max-h-[520px] overflow-y-auto
          "
        >
          {/* History */}
          {showHistory && (
            <div className="p-3">
              <div className="flex items-center justify-between pb-2 mb-1 px-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  جستجوهای اخیر
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  پاک‌کردن همه
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setQuery(item.query);
                      executeSearch(item.query);
                    }}
                    className="
                      group flex items-center gap-1.5 bg-gray-50 hover:bg-brand/10
                      border border-gray-200/80 hover:border-brand/30
                      rounded-lg px-2.5 py-1 text-xs text-gray-700 hover:text-brand-700
                      cursor-pointer transition-all
                    "
                  >
                    <span>{item.query}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(e, item.id, item.query)}
                      className="p-0.5 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                      title="حذف این مورد"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <>
              {/* Exact Match */}
              {suggestions?.exact_match && (
                <div className="bg-amber-50/80 p-3 border-b border-amber-200/60">
                  <Link
                    href={`/product/${suggestions.exact_match.slug}`}
                    onClick={() => {
                      saveToHistory(query);
                      setIsOpen(false);
                      onSearchSubmitted?.();
                    }}
                    className="flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                        <PackageCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.2 rounded">
                            تطابق دقیق کد کالا (SKU)
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-800">
                            {suggestions.exact_match.sku}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-amber-800 transition-colors">
                          {suggestions.exact_match.title}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-700 shrink-0 flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                      مشاهده مستقیم محصول
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              )}

              {/* Brands */}
              {suggestions && suggestions.brands.length > 0 && (
                <div className="p-3 bg-gray-50/50">
                  <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1 px-1">
                    <Tag className="w-3 h-3" />
                    برندهای مرتبط
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.brands.map((b) => (
                      <Link
                        key={b.id}
                        href={`/brand/${b.slug}`}
                        onClick={() => {
                          saveToHistory(query);
                          setIsOpen(false);
                          onSearchSubmitted?.();
                        }}
                        className="
                          inline-flex items-center gap-1.5 bg-white border border-gray-200
                          hover:border-brand hover:text-brand px-2.5 py-1.2 rounded-lg text-xs
                          font-medium shadow-2xs transition-colors
                        "
                      >
                        <span>{b.name}</span>
                        {b.count > 0 && (
                          <span className="text-[10px] text-gray-400">
                            ({toPersianDigits(b.count)})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {suggestions && suggestions.categories.length > 0 && (
                <div className="p-3 bg-gray-50/50">
                  <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1 px-1">
                    <Folder className="w-3 h-3" />
                    دسته‌بندی‌های پیشنهادی
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/products?category=${c.slug}`}
                        onClick={() => {
                          saveToHistory(query);
                          setIsOpen(false);
                          onSearchSubmitted?.();
                        }}
                        className="
                          inline-flex items-center gap-1.5 bg-white border border-gray-200
                          hover:border-navy-500 hover:text-navy-800 px-2.5 py-1.2 rounded-lg text-xs
                          font-medium shadow-2xs transition-colors
                        "
                      >
                        <span>{c.name}</span>
                        {c.count > 0 && (
                          <span className="text-[10px] text-gray-400">
                            ({toPersianDigits(c.count)})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {suggestions && suggestions.products.length > 0 && (
                <div className="p-2">
                  <p className="text-[11px] font-bold text-gray-400 mb-1.5 px-2 pt-1">
                    محصولات پیشنهادی
                  </p>
                  <div className="divide-y divide-gray-100">
                    {suggestions.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => {
                          saveToHistory(query);
                          setIsOpen(false);
                          onSearchSubmitted?.();
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 group transition-colors"
                      >
                        <div className="w-12 h-12 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200/70">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Search className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-brand transition-colors">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.sku && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                کد: {p.sku}
                              </span>
                            )}
                            {p.in_stock ? (
                              <span className="text-[10px] text-emerald-600 font-medium inline-flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                موجود
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-0.5">
                                <AlertCircle className="w-2.5 h-2.5" />
                                ناموجود
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-start shrink-0">
                          <span className="text-xs font-bold text-gray-900">
                            {toPersianDigits(p.formatted_price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {suggestions && !hasSuggestions && !loading && (
                <div className="py-8 px-4 text-center">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    محصولی با عبارت «{query}» در پیشنهادات سریع یافت نشد.
                  </p>
                  <p className="text-[11px] text-gray-400 mb-3">
                    برای بررسی عبارتهای مشابه و محصولات مرتبط، کلید Enter را بزنید.
                  </p>
                  <button
                    type="button"
                    onClick={() => executeSearch(query)}
                    className="btn-primary text-xs py-1.5 px-4 cursor-pointer"
                  >
                    جستجوی کامل در سایت
                  </button>
                </div>
              )}

              {/* Footer */}
              {hasSuggestions && (
                <div className="p-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    تعداد کل نتایج:{' '}
                    <strong className="text-gray-800 font-bold">
                      {toPersianDigits(suggestions?.total_results ?? 0)}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => executeSearch(query)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-700 transition-colors cursor-pointer"
                  >
                    <span>مشاهده نتایج کامل</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
