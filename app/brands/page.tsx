import ShopShell from '@/components/layout/ShopShell';
import BrandSection from '@/components/home/BrandSection';
import { getBrands } from '@/lib/api';

export const revalidate = 3600;

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <ShopShell>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">همه برندها</h1>
          <p className="mt-1 text-sm text-gray-500">برندهای رسمی موجود در فروشگاه ابزار آراد</p>
        </div>

        <BrandSection brands={brands} showAllLink={false} embedded />
      </div>
    </ShopShell>
  );
}
