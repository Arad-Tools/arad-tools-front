import { Truck, ShieldCheck, RefreshCw, Phone } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'ارسال سریع',
    desc: 'تحویل ۱ تا ۳ روز کاری',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: ShieldCheck,
    title: 'گارانتی اصالت',
    desc: 'محصولات ۱۰۰٪ اورجینال',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: RefreshCw,
    title: 'مرجوعی آسان',
    desc: 'تا ۷ روز ضمانت بازگشت',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Phone,
    title: 'پشتیبانی ۲۴ ساعته',
    desc: 'کارشناس آماده پاسخگویی',
    color: 'text-brand',
    bg: 'bg-orange-50',
  },
];

export default function TrustBar() {
  return (
    <section className="bg-white border-y border-gray-200" aria-label="مزایای خرید">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
