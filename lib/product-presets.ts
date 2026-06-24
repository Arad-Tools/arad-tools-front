import type { ProductListingPreset } from '@/lib/types';

export const PRODUCT_PRESETS: Record<string, ProductListingPreset> = {
  featured: {
    title: 'محصولات ویژه',
    subtitle: 'منتخب هفته',
    defaultFilters: { featured: true },
  },
  bestsellers: {
    title: 'پرفروش‌ترین‌ها',
    subtitle: 'پرطرفدار‌ترین ابزارهای هفته',
    defaultFilters: { bestseller: true },
  },
  sale: {
    title: 'پیشنهادات شگفت‌انگیز',
    subtitle: 'تخفیف‌های ویژه با زمان محدود',
    defaultFilters: { on_sale: true },
  },
  new: {
    title: 'تازه‌واردها',
    subtitle: 'آخرین محصولات اضافه‌شده',
    defaultFilters: { is_new: true },
  },
};

export const VALID_PRESETS = Object.keys(PRODUCT_PRESETS);
