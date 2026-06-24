import {
  Truck, MapPin, Headphones, Package, BadgeCheck,
} from 'lucide-react';

const INDICATORS = [
  { icon: Truck, label: 'ارسال سریع' },
  { icon: MapPin, label: 'ارسال به سراسر کشور' },
  { icon: Headphones, label: 'پشتیبانی فروش' },
  { icon: Package, label: 'امکان خرید عمده' },
  { icon: BadgeCheck, label: 'ضمانت اصالت کالا' },
];

export default function TrustIndicators() {
  return (
    <section className="bg-navy rounded-2xl p-5 sm:p-6 text-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {INDICATORS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2 p-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-brand-300" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-100">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
