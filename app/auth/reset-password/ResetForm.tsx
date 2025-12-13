"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  token?: string | null;
}

export default function ResetForm({ token }: Props) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage(t.resetPasswordTokenMissing);
      setSuccess(false);
      return;
    }

    if (password.length < 6) {
      setMessage(t.passwordMinLength?.replace?.('{min}', '6') ?? 'Password must be at least 6 characters');
      setSuccess(false);
      return;
    }

    if (password !== confirm) {
      setMessage(t.passwordsDoNotMatch ?? 'Passwords do not match');
      setSuccess(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || t.resetPasswordServerError);
        setSuccess(false);
      } else {
        setMessage(t.resetPasswordSuccess);
        setSuccess(true);
        setTimeout(() => router.push('/auth/signin'), 1500);
      }
    } catch (err) {
      setMessage(t.resetPasswordServerError);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#2C3B4D] to-[#1B2632] px-8 py-6">
            <h1 className="text-white text-2xl font-semibold">{t.resetPasswordTitle}</h1>
            <p className="text-sm text-gray-200 mt-1">{t.resetPasswordInstruction}</p>
          </div>

          <div className="p-8">
            {!token ? (
              <p className="text-red-600">{t.resetPasswordTokenMissing}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.newPassword}</label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full border border-gray-200 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#f56a24]"
                      placeholder={t.newPassword}
                    />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.confirmPassword}</label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="block w-full border border-gray-200 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#f56a24]"
                      placeholder={t.confirmPassword}
                    />
                    <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {message && (
                  <p className={`text-sm ${success ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
                )}

                <div className="flex items-center justify-between">
                  <Button type="submit" variant="secondary" size="md" className="w-full" disabled={loading}>
                    {loading ? t.sending ?? 'Sending...' : t.resetPasswordSubmit}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
