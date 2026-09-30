'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowRight,
  ChevronLeft,
  Loader2,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
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
  variant?: 'header' | 'mobile';
  onSubmit?: () => void;
}

const LOCAL_STORAGE_KEY = 'arad_search_history_v1';

const POPULAR_SEARCHES = [
  'دریل شارژی',
  'مینی فرز',
  'آچار فرانسه',
  'لولا آرام‌بند',
  'ریل ساچمه‌ای',
  'لیهو',
  'بوش',
  'رونیکس',
  'متر لیزری',
  'جعبه ابزار',
];

export default function SearchForm({ variant = 'header', onSubmit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionsData | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Track hydration for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

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

      // Fetch from API in background
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

  // Lock body scroll when mobile modal is open
  useEffect(() => {
    if (isMobileModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      // Auto-focus mobile input
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 60);

      return () => {
        document.body.style.overflow = originalStyle;
        clearTimeout(timer);
      };
    }
  }, [isMobileModalOpen]);

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

  // Handle global escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileModalOpen(false);
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

    // Update local state immediately
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

    // Persist to backend asynchronously
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
    setIsMobileModalOpen(false);
    onSubmit?.();
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
      setIsMobileModalOpen(false);
      onSubmit?.();
      router.push(`/product/${encodeURIComponent(suggestions.exact_match.slug)}`);
      return;
    }

    executeSearch(trimmed);
  };

  const handleDesktopKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
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
    <div ref={containerRef} className="relative w-full">
      {/* ── 1. Header Trigger for Mobile Screens (< md) ── */}
      {variant === 'header' && (
        <button
          type="button"
          onClick={() => setIsMobileModalOpen(true)}
          className="md:hidden flex items-center justify-between w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-gray-300 transition-all text-start cursor-pointer"
          aria-label="جستجو در ابزار آراد"
        >
          <span className="truncate">
            {query ? query : 'جستجوی ابزار، برند، مدل یا کد کالا...'}
          </span>
          <Search className="w-4 h-4 text-gray-300 shrink-0 ms-2" />
        </button>
      )}

      {/* ── 2. Mobile Drawer Trigger (when used inside drawer) ── */}
      {variant === 'mobile' && (
        <button
          type="button"
          onClick={() => {
            onSubmit?.();
            setIsMobileModalOpen(true);
          }}
          className="flex items-center justify-between w-full border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-500 transition-all text-start cursor-pointer"
          aria-label="جستجو در ابزار آراد"
        >
          <span className="truncate">
            {query ? query : 'جستجوی نام ابزار، برند، مدل یا SKU...'}
          </span>
          <Search className="w-4 h-4 text-gray-400 shrink-0 ms-2" />
        </button>
      )}

      {/* ── 3. Desktop Search Input & Floating Dropdown (>= md) ── */}
      {variant === 'header' && (
        <div className="hidden md:block relative w-full">
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
              onKeyDown={handleDesktopKeyDown}
              placeholder="جستجو در نام محصول، برند (لیهو، بوش...)، مدل یا کد کالا..."
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
                className="absolute top-1/2 -translate-y-1/2 start-3 p-0.5 text-gray-400 hover:text-gray-200 rounded-full transition-colors"
                title="پاک کردن متن"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Desktop Floating Dropdown */}
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
              {/* Desktop History */}
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
                      className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
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
                          className="p-0.5 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                          title="حذف این مورد"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop Results */}
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
                          onSubmit?.();
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
                              onSubmit?.();
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
                              onSubmit?.();
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
                              onSubmit?.();
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
                        className="btn-primary text-xs py-1.5 px-4"
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-700 transition-colors"
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
      )}

      {/* ── 4. Full-Screen Mobile Pop-Up Modal (White Overlay) ── */}
      {mounted &&
        isMobileModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="جستجوی محصولات در ابزار آراد"
          >
            {/* Modal Top Bar */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-2 shadow-xs shrink-0">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setIsMobileModalOpen(false)}
                className="p-2 -ms-1 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors"
                aria-label="بستن جستجو"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Search Form inside Modal */}
              <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 relative flex items-center bg-gray-100 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 transition-all">
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-brand animate-spin shrink-0 me-2" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400 shrink-0 me-2" />
                  )}

                  <input
                    ref={mobileInputRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجوی ابزار، برند، مدل یا کد کالا..."
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    autoComplete="off"
                    spellCheck="false"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setSuggestions(null);
                        mobileInputRef.current?.focus();
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 active:bg-gray-200 rounded-full transition-colors shrink-0"
                      title="پاک کردن متن"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="px-3.5 py-2 bg-brand text-white rounded-xl text-xs font-bold shrink-0 active:bg-brand-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
                >
                  جستجو
                </button>
              </form>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-gray-800">
              {/* When query is empty: show search history & popular tags */}
              {!query.trim() && (
                <div className="p-4 space-y-6">
                  {/* Recent searches */}
                  {history.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          جستجوهای اخیر شما
                        </span>
                        <button
                          type="button"
                          onClick={handleClearHistory}
                          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          پاک‌کردن همه
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {history.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setQuery(item.query);
                              executeSearch(item.query);
                            }}
                            className="group flex items-center gap-2 bg-gray-50 active:bg-brand/15 border border-gray-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 cursor-pointer transition-all"
                          >
                            <span>{item.query}</span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteHistoryItem(e, item.id, item.query)}
                              className="p-0.5 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                              title="حذف"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular searches */}
                  <div>
                    <div className="pb-2 mb-2.5 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-brand" />
                        بیشترین جستجوهای ابزار آراد
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setQuery(item);
                            executeSearch(item);
                          }}
                          className="flex items-center gap-1.5 bg-gray-50 active:bg-brand/15 border border-gray-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 transition-all"
                        >
                          <Search className="w-3 h-3 text-gray-400" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* When query has text: show live suggestions */}
              {query.trim() && (
                <div className="pb-20">
                  {/* Exact match card */}
                  {suggestions?.exact_match && (
                    <div className="p-3 bg-amber-50/90 border-b border-amber-200/80">
                      <Link
                        href={`/product/${suggestions.exact_match.slug}`}
                        onClick={() => {
                          saveToHistory(query);
                          setIsMobileModalOpen(false);
                          onSubmit?.();
                        }}
                        className="flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                            <PackageCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded">
                                تطابق دقیق کد کالا (SKU)
                              </span>
                              <span className="text-xs font-mono font-bold text-gray-900">
                                {suggestions.exact_match.sku}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-900 truncate mt-0.5 group-hover:text-brand">
                              {suggestions.exact_match.title}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-800 shrink-0 flex items-center gap-1">
                          مشاهده کالا
                          <ChevronLeft className="w-4 h-4" />
                        </span>
                      </Link>
                    </div>
                  )}

                  {/* Brands */}
                  {suggestions && suggestions.brands.length > 0 && (
                    <div className="p-3 bg-gray-50/60">
                      <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5 px-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        برندهای مرتبط
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.brands.map((b) => (
                          <Link
                            key={b.id}
                            href={`/brand/${b.slug}`}
                            onClick={() => {
                              saveToHistory(query);
                              setIsMobileModalOpen(false);
                              onSubmit?.();
                            }}
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 active:border-brand active:text-brand px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
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
                    <div className="p-3 bg-gray-50/60">
                      <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5 px-1">
                        <Folder className="w-3.5 h-3.5 text-gray-400" />
                        دسته‌بندی‌های پیشنهادی
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map((c) => (
                          <Link
                            key={c.id}
                            href={`/products?category=${c.slug}`}
                            onClick={() => {
                              saveToHistory(query);
                              setIsMobileModalOpen(false);
                              onSubmit?.();
                            }}
                            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 active:border-brand active:text-brand px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
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
                      <p className="text-xs font-bold text-gray-500 mb-2 px-2 pt-2">
                        محصولات پیشنهادی
                      </p>
                      <div className="divide-y divide-gray-100">
                        {suggestions.products.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => {
                              saveToHistory(query);
                              setIsMobileModalOpen(false);
                              onSubmit?.();
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl active:bg-gray-100 group transition-colors"
                          >
                            {/* Thumbnail */}
                            <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200/80">
                              {p.image ? (
                                <Image
                                  src={p.image}
                                  alt={p.title}
                                  fill
                                  sizes="56px"
                                  className="object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Search className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            {/* Title & SKU & Stock */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-relaxed">
                                {p.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {p.sku && (
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    کد: {p.sku}
                                  </span>
                                )}
                                {p.in_stock ? (
                                  <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    موجود
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-0.5">
                                    <AlertCircle className="w-3 h-3" />
                                    ناموجود
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-start shrink-0">
                              <span className="text-xs font-black text-gray-900">
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
                    <div className="py-12 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mb-3">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">
                        محصولی با عبارت «{query}» در پیشنهادات سریع پیدا نشد.
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        می‌توانید برای مشاهده تمامی نتایج و کالاهای مرتبط، در کل فروشگاه جستجو کنید.
                      </p>
                      <button
                        type="button"
                        onClick={() => executeSearch(query)}
                        className="btn-primary text-xs py-2 px-5 rounded-xl shadow-xs"
                      >
                        جستجوی کامل در سایت
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Modal Footer Bar: View All Results */}
            {query.trim() && hasSuggestions && (
              <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 shadow-lg z-10 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  تعداد کل نتایج:{' '}
                  <strong className="text-gray-900 font-black">
                    {toPersianDigits(suggestions?.total_results ?? 0)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold active:bg-brand-700 transition-colors shadow-xs"
                >
                  <span>مشاهده همه نتایج</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
