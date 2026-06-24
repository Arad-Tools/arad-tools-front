import {
  Zap, Shield, Wrench, Factory, CheckCircle2,
} from 'lucide-react';

const ICONS = [Zap, Shield, Wrench, Factory, CheckCircle2];

export default function KeyFeatures({ features }: { features: string[] }) {
  if (!features.length) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">ویژگی‌های کلیدی</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature, i) => {
          const Icon = ICONS[i % ICONS.length];

          return (
            <div
              key={feature}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-800">{feature}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
