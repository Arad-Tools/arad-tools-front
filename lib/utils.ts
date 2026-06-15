import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Tailwind Utility ─────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Persian Numerals ─────────────────────────────────────────────────────────

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Converts Western Arabic digits to Persian/Farsi equivalents. */
export function toPersianDigits(input: number | string): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[+d]);
}

// ─── Toman Currency ───────────────────────────────────────────────────────────

/**
 * Formats a number as Toman with Persian digits and separators.
 * Example: 4850000 → "۴٬۸۵۰٬۰۰۰ تومان"
 */
export function formatToman(price: number): string {
  if (!price && price !== 0) return '—';
  const formatted = new Intl.NumberFormat('fa-IR').format(price);
  return `${formatted} تومان`;
}

/**
 * Returns compact Toman label for badge use.
 * Example: 4850000 → "۴٫۸ میلیون"
 */
export function formatTomanShort(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    const str = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
    return `${toPersianDigits(str)} میلیون تومان`;
  }
  if (price >= 1_000) {
    return `${toPersianDigits(Math.floor(price / 1000))} هزار تومان`;
  }
  return formatToman(price);
}

// ─── Discount ─────────────────────────────────────────────────────────────────

/** Returns the discount percentage as a whole number. */
export function calcDiscount(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** Returns discount as Persian string, e.g. "۱۴٪". */
export function discountLabel(price: number, oldPrice?: number): string {
  const pct = calcDiscount(price, oldPrice);
  if (!pct) return '';
  return `${toPersianDigits(pct)}٪`;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export interface BadgeConfig {
  label: string;
  className: string; // bg + text Tailwind classes
}

const BADGE_MAP: Record<string, BadgeConfig> = {
  sale:       { label: 'تخفیف',   className: 'bg-red-500 text-white' },
  new:        { label: 'جدید',    className: 'bg-emerald-500 text-white' },
  bestseller: { label: 'پرفروش',  className: 'bg-amber-500 text-white' },
  featured:   { label: 'ویژه',    className: 'bg-blue-600 text-white' },
};

export function renderBadgeLabel(badge: string): BadgeConfig {
  return BADGE_MAP[badge] ?? { label: badge, className: 'bg-gray-500 text-white' };
}

// ─── Rating ───────────────────────────────────────────────────────────────────

/** Renders a star rating as filled/empty chars. */
export function ratingStars(rating: number): { filled: number; half: boolean; empty: number } {
  const filled = Math.floor(rating);
  const half   = rating - filled >= 0.5;
  const empty  = 5 - filled - (half ? 1 : 0);
  return { filled, half, empty };
}

export function formatRating(rating: number): string {
  return toPersianDigits(rating.toFixed(1));
}

// ─── Images ───────────────────────────────────────────────────────────────────

/** Returns fallback src when image is empty or missing. */
export function imageFallback(src?: string, fallback = '/images/placeholder.png'): string {
  return src && src.trim().length > 0 ? src : fallback;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Clamps a string to a maximum character count with ellipsis. */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '…';
}
