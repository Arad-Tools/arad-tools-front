'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { User, LayoutDashboard, ShoppingCart, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/stores/auth-context';

export default function ProfileMenu() {
  const { customer, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayName = customer?.name ?? 'پروفایل';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/15 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="منوی پروفایل"
      >
        <User className="w-4 h-4" />
        <span className="max-w-[100px] truncate">{displayName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 end-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 text-gray-800"
          role="menu"
        >
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            role="menuitem"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-400" />
            داشبورد
          </Link>
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
            role="menuitem"
          >
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            سبد خرید
          </Link>
          <hr className="my-1 border-gray-100" />
          <button
            type="button"
            onClick={() => { setOpen(false); void logout(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            role="menuitem"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      )}
    </div>
  );
}
