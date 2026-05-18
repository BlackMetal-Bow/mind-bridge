'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 실제로는 API 호출을 하지만, 지금은 가상의 성공 로직을 넣습니다.
    if (email && password) {
      // 징표 남기기
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('nickname', email.split('@')[0]); // 이메일 앞부분을 닉네임으로 임시 사용
      
      alert('반갑습니다!');
      router.push('/'); 
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
          <button type="submit" className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all">
            로그인
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          아직 회원이 아니신가요? <Link href="/signup" className="text-indigo-600 font-bold hover:underline">회원가입</Link>
        </div>
      </div>
    </main>
  );
}