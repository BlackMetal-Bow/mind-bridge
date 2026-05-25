'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const e = searchParams.get('email');
    if (e) setEmail(e);
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      alert('6자리 코드를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || '인증에 실패했습니다');
        setLoading(false);
        return;
      }

      alert('이메일 인증이 완료되었습니다! 로그인해주세요.');
      router.push('/login');
    } catch (e) {
      alert('서버 연결 실패');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        alert('인증 코드를 다시 발송했습니다');
      } else {
        const err = await res.json();
        alert(err.detail || '재발송 실패');
      }
    } catch (e) {
      alert('서버 연결 실패');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600">이메일 인증</h1>
          <p className="text-slate-500 text-sm mt-2">
            {email}로 발송된<br />6자리 코드를 입력해주세요
          </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="------"
            className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none text-center text-2xl tracking-widest font-bold"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:bg-slate-300"
          >
            {loading ? '확인 중...' : '인증 확인'}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500">
          코드가 안 왔나요?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-indigo-600 font-bold hover:underline disabled:text-slate-400"
          >
            {resending ? '발송 중...' : '재발송'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}