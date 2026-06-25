import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import { CartProvider } from '@/lib/stores/cart-context';
import { AuthProvider } from '@/lib/stores/auth-context';
import '@/app/globals.css';

// ── Persian-optimised font ────────────────────────────────────────────────────
const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-vazir',
  display: 'swap',
  preload: true,
});

// ── Site-wide SEO metadata ────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'ابزار آراد | ابزار و تجهیزات صنعتی',
    template: '%s | ابزار آراد',
  },
  description:
    'خرید آنلاین انواع ابزار برقی، ابزار دستی و تجهیزات صنعتی از برندهای معتبر جهانی. بوش، ماکیتا، هیلتی، استنلی — ارسال سریع، گارانتی اصالت.',
  keywords:
    'ابزار برقی، دریل، فرز آنگولار، ماکیتا، بوش، هیلتی، استنلی، پیچ‌گوشتی شارژی، ابزار صنعتی',
  openGraph: {
    title: 'ابزار آراد | ابزار و تجهیزات صنعتی',
    description: 'خرید آنلاین انواع ابزار و تجهیزات صنعتی از برندهای معتبر جهانی',
    locale: 'fa_IR',
    type: 'website',
    siteName: 'ابزار آراد',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a2e44',
};

// ── Root layout ───────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="fa" + dir="rtl" — both are required for correct RTL support
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} scroll-smooth`}>
      <body className={`${vazirmatn.className} min-h-screen bg-gray-50 text-gray-900 antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
