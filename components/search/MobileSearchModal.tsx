'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
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
  isOpen: boolean;
  onClose: () => void;
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
  'اینورتر جوشکاری',
];

export default function MobileSearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { token } = useAuth();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionsData | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load search history
  useEffect(() => {
    if (!isOpen) return;

    let localItems: SearchHistoryItem[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        localItems = JSON.parse(stored) as SearchHistoryItem[];
      }
    } catch {
      // Ignore
    }
    setHistory(localItems);

    void getSearchHistory(token ?? undefined).then((apiHistory) => {
      if (apiHistory && apiHistory.length > 0) {
        setHistory(apiHistory);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiHistory));
        } catch {
          // Ignore
        }
      }
    }).catch(() => {
      // Keep local
    });
  }, [isOpen, token]);

  // Debounced search suggestions
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
    onClose();
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    if (suggestions?.exact_match) {
      saveToHistory(trimmed);
      onClose();
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

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 w-screen h-[100dvh] bg-white z-[9999] flex flex-col overflow-hidden text-gray-800"
      role="dialog"
      aria-modal="true"
      aria-label="جستجوی محصولات در ابزار آراد"
    >
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-2 shadow-xs shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ms-1 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="بستن جستجو"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 min-w-0">
          <div className="flex-1 relative flex items-center bg-gray-100 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/20 transition-all">
            {loading ? (
              <Loader2 className="w-4 h-4 text-brand animate-spin shrink-0 me-2" />
            ) : (
              <Search className="w-4 h-4 text-gray-400 shrink-0 me-2" />
            )}

            <input
              ref={inputRef}
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
                  inputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 active:bg-gray-200 rounded-full transition-colors shrink-0 cursor-pointer"
                title="پاک کردن متن"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!query.trim()}
            className="px-3.5 py-2 bg-brand text-white rounded-xl text-xs font-bold shrink-0 active:bg-brand-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* ── Scrollable Body ── */}
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
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
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
                        className="p-0.5 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
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
                    className="flex items-center gap-1.5 bg-gray-50 active:bg-brand/15 border border-gray-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 transition-all cursor-pointer"
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
                    onClose();
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
                        onClose();
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
                        onClose();
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
                        onClose();
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
                  className="btn-primary text-xs py-2 px-5 rounded-xl shadow-xs cursor-pointer"
                >
                  جستجوی کامل در سایت
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Footer: View All Results ── */}
      {query.trim() && hasSuggestions && (
        <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 shadow-lg shrink-0 flex items-center justify-between">
          <span className="text-xs text-gray-600">
            تعداد کل نتایج:{' '}
            <strong className="text-gray-900 font-black">
              {toPersianDigits(suggestions?.total_results ?? 0)}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => executeSearch(query)}
            className="inline-flex items-center gap-1 px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold active:bg-brand-700 transition-colors shadow-xs cursor-pointer"
          >
            <span>مشاهده همه نتایج</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
