import type { AuthResponse, Customer } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

async function authFetch<T>(
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

  const data = await res.json().catch(() => ({})) as T & ApiError;

  if (!res.ok) {
    const message = data.message
      ?? Object.values(data.errors ?? {}).flat()[0]
      ?? 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';
    throw new Error(message);
  }

  return data;
}

export async function sendOtp(mobile: string): Promise<{ message: string; expires_in: number; debug_code?: string }> {
  return authFetch('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
}

export async function verifyOtp(mobile: string, code: string): Promise<AuthResponse> {
  return authFetch<AuthResponse>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ mobile, code }),
  });
}

export async function completeProfile(
  data: { name: string; email?: string },
  token: string,
): Promise<{ customer: Customer; message: string }> {
  return authFetch('/auth/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

export async function fetchMe(token: string): Promise<{ customer: Customer }> {
  return authFetch('/auth/me', { method: 'GET' }, token);
}

export async function logoutApi(token: string): Promise<void> {
  await authFetch('/auth/logout', { method: 'POST' }, token);
}
