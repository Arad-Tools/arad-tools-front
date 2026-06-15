import Link from 'next/link';
import {
  Phone, Mail, MapPin,
  ShieldCheck, Truck, CreditCard, RefreshCw,
} from 'lucide-react';

const FOOTER_LINKS = {
  shop: [
    { label: 'ابزار برقی',      href: '/category/power-tools'  },
    { label: 'ابزار دستی',      href: '/category/hand-tools'   },
    { label: 'جوشکاری',         href: '/category/welding'      },
    { label: 'اندازه‌گیری',     href: '/category/measuring'    },
    { label: 'تجهیزات ایمنی',  href: '/category/safety'       },
    { label: 'تازه‌واردها',     href: '/products/new'          },
  ],
  brands: [
    { label: 'بوش',             href: '/brand/bosch'           },
    { label: 'ماکیتا',          href: '/brand/makita'          },
    { label: 'هیلتی',           href: '/brand/hilti'           },
    { label: 'استنلی',          href: '/brand/stanley'         },
    { label: 'بلک‌اند‌دکر',    href: '/brand/black-decker'    },
    { label: 'همه برندها',      href: '/brands'                },
  ],
  info: [
    { label: 'درباره ما',       href: '/about'                 },
    { label: 'تماس با ما',      href: '/contact'               },
    { label: 'وبلاگ',           href: '/blog'                  },
    { label: 'پیگیری سفارش',   href: '/track'                 },
    { label: 'قوانین و مقررات', href: '/terms'                 },
    { label: 'حریم خصوصی',     href: '/privacy'               },
  ],
};

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'گارانتی اصالت',   sub: 'تضمین اورجینال بودن'     },
  { icon: Truck,       label: 'ارسال سریع',       sub: '۱ تا ۳ روز کاری'         },
  { icon: CreditCard,  label: 'پرداخت امن',       sub: 'درگاه‌های معتبر بانکی'   },
  { icon: RefreshCw,   label: 'مرجوعی آسان',      sub: 'تا ۷ روز ضمانت برگشت'   },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-gray-300 mt-8" aria-label="پاورقی سایت">

      {/* ── Trust Badges Strip ──────────────────────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-brand" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Column 1 — Brand / About */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-white text-sm shadow">
                ا
              </div>
              <span className="font-black text-xl text-white">ابزار آراد</span>
            </div>
            <p className="text-sm text-gray-400 leading-loose mb-5">
              ابزار آراد، مرجع تخصصی خرید آنلاین ابزار و تجهیزات صنعتی در ایران. بیش از ۵٬۰۰۰ محصول از بهترین برندهای جهانی با ضمانت اصالت.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="اینستاگرام ابزار آراد"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-pink-500 flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="توییتر ابزار آراد"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="یوتیوب ابزار آراد"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2 — Shop categories */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">دسته‌بندی محصولات</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Brands */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">برندها</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.brands.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact + Info */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">تماس و اطلاعات</h3>
            <ul className="space-y-3 mb-5">
              <li>
                <a href="tel:02112345678" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-brand flex-shrink-0" />
                  <span dir="ltr">۰۲۱-۱۲۳۴-۵۶۷۸</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@abzarsara.ir" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-brand flex-shrink-0" />
                  info@abzarsara.ir
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
              </li>
            </ul>

            <h3 className="text-white font-bold mb-3 text-sm">اطلاعات</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            © {currentYear} ابزار آراد — تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">قوانین</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">حریم خصوصی</Link>
            <Link href="/sitemap.xml" className="hover:text-gray-300 transition-colors">نقشه سایت</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
