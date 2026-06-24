import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

export default function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
