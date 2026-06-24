import Link from 'next/link';
import ShopShell from '@/components/layout/ShopShell';

export default function ProductNotFound() {
  return (
    <ShopShell>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-3">محصول یافت نشد</h1>
        <p className="text-gray-500 mb-6">محصول مورد نظر وجود ندارد یا حذف شده است.</p>
        <Link href="/products" className="btn-primary inline-flex">
          بازگشت به محصولات
        </Link>
      </div>
    </ShopShell>
  );
}
