'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductFAQ } from '@/lib/types';

export default function ProductFAQ({ faqs }: { faqs: ProductFAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs.length) return null;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">سوالات متداول</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;

          return (
            <div key={faq.question} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-start bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-800">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
