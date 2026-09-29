import type {
  AddressInput,
  CheckoutPayload,
  CheckoutResponse,
  CustomerAddress,
  Order,
  Payment,
  Seller,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => ({}))) as T & ApiError;

  if (!res.ok) {
    const message =
      data.message ??
      Object.values(data.errors ?? {}).flat()[0] ??
      'خطایی در برقراری ارتباط رخ داد.';
    throw new Error(message);
  }

  return data;
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export async function fetchAddresses(token: string): Promise<CustomerAddress[]> {
  const res = await request<{ addresses: CustomerAddress[] }>('/customer/addresses', { method: 'GET' }, token);
  return res.addresses;
}

export async function createAddress(
  data: AddressInput,
  token: string,
): Promise<{ address: CustomerAddress; message: string }> {
  return request<{ address: CustomerAddress; message: string }>(
    '/customer/addresses',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function updateAddress(
  id: number,
  data: Partial<AddressInput>,
  token: string,
): Promise<{ address: CustomerAddress; message: string }> {
  return request<{ address: CustomerAddress; message: string }>(
    `/customer/addresses/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function deleteAddress(id: number, token: string): Promise<void> {
  await request(`/customer/addresses/${id}`, { method: 'DELETE' }, token);
}

export async function setDefaultAddress(
  id: number,
  token: string,
): Promise<{ address: CustomerAddress; message: string }> {
  return request<{ address: CustomerAddress; message: string }>(
    `/customer/addresses/${id}/default`,
    { method: 'POST' },
    token,
  );
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export async function fetchServerCart(token: string) {
  return request<{ cart: any }>('/cart', { method: 'GET' }, token);
}

export async function addServerCartItem(productId: number, quantity: number, token: string) {
  return request<{ message: string; item: any; cart: any }>(
    '/cart/items',
    {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    },
    token,
  );
}

export async function updateServerCartItem(itemId: number, quantity: number, token: string) {
  return request<{ message: string; item: any; cart: any }>(
    `/cart/items/${itemId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    },
    token,
  );
}

export async function removeServerCartItem(itemId: number, token: string) {
  return request<{ message: string; cart: any }>(
    `/cart/items/${itemId}`,
    { method: 'DELETE' },
    token,
  );
}

export async function clearServerCart(token: string) {
  return request<{ message: string; cart: any }>('/cart', { method: 'DELETE' }, token);
}

export async function syncServerCart(
  items: Array<{ product_id: number; quantity: number }>,
  token: string,
) {
  return request<{ message: string; cart: any }>(
    '/cart/sync',
    {
      method: 'POST',
      body: JSON.stringify({ items }),
    },
    token,
  );
}

// ─── Checkout & Orders ───────────────────────────────────────────────────────

export async function submitCheckout(
  payload: CheckoutPayload,
  token: string,
): Promise<CheckoutResponse> {
  return request<CheckoutResponse>(
    '/checkout',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function fetchCustomerOrders(token: string): Promise<Order[]> {
  const res = await request<{ orders: Order[] }>('/customer/orders', { method: 'GET' }, token);
  return res.orders;
}

export async function fetchCustomerOrder(orderNumber: string, token: string): Promise<Order> {
  const res = await request<{ order: Order }>(`/customer/orders/${orderNumber}`, { method: 'GET' }, token);
  return res.order;
}

export async function cancelCustomerOrder(
  orderNumber: string,
  token: string,
): Promise<{ order: Order; message: string }> {
  return request<{ order: Order; message: string }>(
    `/customer/orders/${orderNumber}/cancel`,
    { method: 'POST' },
    token,
  );
}

export async function initiatePayment(
  orderNumber: string,
  token: string,
): Promise<{ message: string; payment: Payment; redirectUrl: string }> {
  return request<{ message: string; payment: Payment; redirectUrl: string }>(
    `/customer/orders/${orderNumber}/pay`,
    { method: 'POST' },
    token,
  );
}

export async function trackOrderApi(orderNumber: string, mobile?: string): Promise<{ order: Order }> {
  const params = new URLSearchParams({ order_number: orderNumber });
  if (mobile) {
    params.set('mobile', mobile);
  }
  return request<{ order: Order }>(`/orders/track?${params.toString()}`, { method: 'GET' });
}

export const trackOrder = trackOrderApi;

// ─── Mock Payment Gateway ────────────────────────────────────────────────────

export async function submitMockPayment(
  referenceId: string,
  success: boolean,
): Promise<{
  message: string;
  payment: Payment;
  orderNumber?: string;
  isSuccessful: boolean;
  trackingCode?: string;
  returnUrl: string;
}> {
  return request(`/payments/${referenceId}/mock-pay`, {
    method: 'POST',
    body: JSON.stringify({ success }),
  });
}

// ─── Multi-Vendor Sellers ────────────────────────────────────────────────────

export async function fetchSellers(): Promise<Seller[]> {
  const res = await request<{ sellers: Seller[] }>('/sellers', { method: 'GET' });
  return res.sellers;
}

export async function fetchSellerBySlug(
  slug: string,
): Promise<{ seller: Seller; products: any[] }> {
  return request<{ seller: Seller; products: any[] }>(`/sellers/${slug}`, { method: 'GET' });
}

export async function registerAsSeller(
  data: {
    store_name: string;
    contact_name: string;
    phone: string;
    email?: string;
    address?: string;
    description?: string;
    shaba_number?: string;
  },
  token: string,
): Promise<{ seller: Seller; message: string }> {
  return request<{ seller: Seller; message: string }>(
    '/seller/register',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function fetchSellerDashboard(token: string): Promise<{
  seller: Seller;
  stats: { totalProducts: number; totalOrders: number; totalRevenue: number };
  recentOrders: any[];
}> {
  return request('/seller/dashboard', { method: 'GET' }, token);
}
