'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || '로그인에 실패했습니다');
        setLoading(false);
        return;
      }

      const { access_token } = await res.json();

      // 내 정보 조회 (익명 닉네임 받기)
      const me = await fetch('http://localhost:8000/api/v1/users/me', {
        headers: { 'Authorization': `Bearer ${access_token}` },
      }).then(r => r.json());

      // localStorage 저장
      localStorage.setItem('token', access_token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('nickname', me.nickname);
      localStorage.setItem('userId', String(me.id));

      alert(`반갑습니다, ${me.nickname}님!`);
      router.push('/');
    } catch (e) {
      alert('서버 연결에 실패했습니다. 백엔드가 켜져있는지 확인해주세요.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600">로그인</h1>
          <p className="text-slate-500 text-sm mt-2">고민 상담을 위해 로그인이 필요합니다.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:bg-slate-300"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500">
          아직 회원이 아니신가요? <Link href="/signup" className="text-indigo-600 font-bold hover:underline">회원가입</Link>
        </div>
      </div>
    </main>
  );
}