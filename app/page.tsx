'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // 상태 관리
  const [thought, setThought] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [username, setUsername] = useState('');

  // 1. 로그인 여부 및 사용자 정보 체크
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedName = localStorage.getItem('nickname');

    if (!isLoggedIn) {
      // 로그인 안 되어 있으면 로그인 페이지로 강제 이동
      router.push('/login');
    } else {
      setUsername(savedName || '익명 사용자');
    }
  }, [router]);

  // 2. 로그아웃 함수
  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('nickname');
      localStorage.removeItem('userEmail');
      router.push('/login');
    }
  };

  const availableTags = [
    '📚 학업/진로', '🤝 인간관계', '❤️ 연애/사랑', 
    '🏠 가족문제', '😢 우울/불안', '💰 경제적고민', 
    '🔥 번아웃', '👻 기타'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const startMatching = () => {
    if (!thought || selectedTags.length === 0) return;
    setIsMatching(true);

    setTimeout(() => {
      localStorage.setItem('userThought', thought);
      localStorage.setItem('userTags', JSON.stringify(selectedTags));
      setIsMatching(false);
      router.push('/chat');
    }, 2500);
  };

  // 로그인 체크 중일 때 깜빡임 방지를 위해 닉네임이 로드될 때까지 빈 화면 처리 (선택사항)
  if (!username) return <div className="min-h-screen bg-slate-50" />;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 text-slate-800">
      
      {/* 상단 네비게이션 바 (로그아웃 포함) */}
      <div className="w-full max-w-lg flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xs font-bold">👤</span>
          </div>
          <span className="text-sm font-bold text-slate-700">{username}님</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
        >
          로그아웃
        </button>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-slate-100">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">마음 연결</h1>
          <p className="text-slate-500 text-sm">지금 마음 속 이야기를 들려주세요.</p>
        </div>

        <hr className="border-slate-100" />

        {/* 태그 선택 */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block">어떤 고민인가요?</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all border ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 고민 입력 */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block">고민 내용 적기</label>
          <textarea
            className="w-full h-44 p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all"
            placeholder="상대방에게 하고 싶은 말을 적어보세요."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
          />
        </div>

        {/* 매칭 버튼 */}
        <button
          onClick={startMatching}
          disabled={!thought || selectedTags.length === 0 || isMatching}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
            isMatching ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isMatching ? '비슷한 마음을 찾는 중...' : '매칭 시작하기'}
        </button>
      </div>
    </main>
  );
}