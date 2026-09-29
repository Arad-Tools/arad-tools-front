'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/lib/types';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: (token: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { value: items, setValue: setItems, hydrated } = useLocalStorage<CartItem[]>('arad-cart', []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);

        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }

        return [...prev, { ...item, quantity }];
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    },
    [setItems],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
      );
    },
    [removeItem, setItems],
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const syncWithServer = useCallback(
    async (token: string) => {
      if (!token || items.length === 0) {
        return;
      }

      try {
        const payload = items
          .map((i) => ({
            product_id: Number(i.productId),
            quantity: i.quantity,
          }))
          .filter((i) => !Number.isNaN(i.product_id) && i.product_id > 0);

        if (payload.length > 0) {
          const { syncServerCart } = await import('@/lib/ecommerce-api');
          await syncServerCart(payload, token);
        }
      } catch {
        // Fallback gracefully if network/auth issues occur
      }
    },
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      syncWithServer,
    }),
    [items, count, total, hydrated, addItem, removeItem, updateQuantity, clearCart, syncWithServer],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
