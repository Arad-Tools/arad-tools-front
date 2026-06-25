'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/stores/auth-context';
import { toPersianDigits } from '@/lib/utils';

type Step = 'mobile' | 'otp' | 'profile';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 120;

export default function LoginModal() {
  const {
    loginOpen,
    closeLogin,
    requestOtp,
    verifyOtpCode,
    saveProfile,
    customer,
  } = useAuth();

  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetForm = useCallback(() => {
    setStep('mobile');
    setMobile('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setName('');
    setEmail('');
    setError('');
    setResendIn(0);
    setDebugCode(null);
  }, []);

  useEffect(() => {
    if (!loginOpen) {
      resetForm();
    }
  }, [loginOpen, resetForm]);

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  if (!loginOpen) {
    return null;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await requestOtp(mobile);
      setResendIn(RESEND_SECONDS);
      setDebugCode(result.debugCode ?? null);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    if (code.length !== OTP_LENGTH) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const complete = await verifyOtpCode(mobile, code);
      if (!complete) {
        setStep('profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'کد تأیید نامعتبر است.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== '')) {
      void handleVerifyOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await saveProfile({ name, email: email || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await requestOtp(mobile);
      setResendIn(RESEND_SECONDS);
      setDebugCode(result.debugCode ?? null);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={closeLogin}
        aria-hidden
      />
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="dialog"
        aria-modal
        aria-label="ورود به حساب کاربری"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">
                {step === 'profile' ? 'تکمیل اطلاعات' : 'ورود / ثبت‌نام'}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {step === 'mobile' && 'شماره موبایل خود را وارد کنید'}
                {step === 'otp' && `کد ارسال‌شده به ${toPersianDigits(mobile)} را وارد کنید`}
                {step === 'profile' && 'برای اولین ورود، اطلاعات خود را تکمیل کنید'}
              </p>
            </div>
            <button
              type="button"
              onClick={closeLogin}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {step === 'mobile' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="login-mobile" className="block text-sm font-medium text-gray-700 mb-1.5">
                    شماره موبایل
                  </label>
                  <input
                    id="login-mobile"
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="09123456789"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-left"
                    required
                    pattern="09[0-9]{9}"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || mobile.length !== 11}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  دریافت کد تأیید
                </button>
              </form>
            )}

            {step === 'otp' && (
              <div className="space-y-5">
                <div className="flex justify-center gap-2" dir="ltr">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50"
                      aria-label={`رقم ${toPersianDigits(String(i + 1))}`}
                    />
                  ))}
                </div>

                {debugCode && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-center">
                    کد تست (محیط توسعه): {toPersianDigits(debugCode)}
                  </p>
                )}

                {loading && (
                  <div className="flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-brand" />
                  </div>
                )}

                <div className="text-center text-sm text-gray-500">
                  {resendIn > 0 ? (
                    <span>ارسال مجدد تا {toPersianDigits(String(resendIn))} ثانیه دیگر</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-brand font-medium hover:underline"
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => { setStep('mobile'); setOtp(Array(OTP_LENGTH).fill('')); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  تغییر شماره موبایل
                </button>
              </div>
            )}

            {step === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    ایمیل (اختیاری)
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 text-left"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  ذخیره و ادامه
                </button>
              </form>
            )}

            {customer?.profile_complete && step !== 'profile' && (
              <p className="mt-4 text-center text-xs text-gray-400">
                با ورود، شرایط استفاده از خدمات را می‌پذیرید.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
