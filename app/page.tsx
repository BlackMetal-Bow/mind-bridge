'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // 1. 상태 관리
  const [thought, setThought] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [username, setUsername] = useState('사용자'); // 기본값

  // 2. 로그인 체크 및 사용자 정보 로드 (마운트 시 실행)
  useEffect(() => {
    // 실제 프로젝트에서는 여기서 세션이나 토큰을 확인합니다.
    // 만약 로그인이 필수라면 아래 주석을 해제하세요.
    /*
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
    */
    
    // 로컬 스토리지에서 저장된 닉네임이 있다면 가져오기
    const savedName = localStorage.getItem('nickname');
    if (savedName) setUsername(savedName);
  }, [router]);

  // 제공할 고민 키워드 태그 리스트
  const availableTags = [
    '📚 학업/진로', '🤝 인간관계', '❤️ 연애/사랑', 
    '🏠 가족문제', '😢 우울/불안', '💰 경제적고민', 
    '🔥 번아웃', '👻 기타'
  ];

  // 태그 선택/해제 핸들러
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 매칭 시작 로직
  const startMatching = () => {
    if (!thought || selectedTags.length === 0) return;

    setIsMatching(true);

    // 백엔드 연동 전까지 데이터를 브라우저에 임시 저장
    setTimeout(() => {
      localStorage.setItem('userThought', thought);
      localStorage.setItem('userTags', JSON.stringify(selectedTags));
      
      alert('유사한 고민을 가진 상대를 찾았습니다!');
      setIsMatching(false);
      router.push('/chat'); // 채팅 페이지로 이동
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-slate-100">
        
        {/* 상단 헤더 */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-2">
            Beta Service
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            마음 연결
          </h1>
          <p className="text-slate-500 text-sm">
            {username}님, 지금 마음 속 이야기를 들려주세요.
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* 1. 태그 선택 섹션 */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-slate-700">어떤 종류의 고민인가요?</label>
            <span className="text-[10px] text-slate-400">중복 선택 가능</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 border ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 상세 고민 입력 섹션 */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block">고민 내용 적기</label>
          <textarea
            className="w-full h-44 p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all text-slate-700 leading-relaxed"
            placeholder="상대방이 공감할 수 있도록 자세히 적어주시면 매칭 확률이 높아집니다. (예: 시험 기간만 되면 너무 불안해서 잠이 안 와요.)"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
          />
        </div>

        {/* 3. 매칭 실행 버튼 */}
        <div className="pt-2">
          <button
            onClick={startMatching}
            disabled={!thought || selectedTags.length === 0 || isMatching}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg ${
              isMatching 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200'
            }`}
          >
            {isMatching ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>비슷한 마음을 찾는 중...</span>
              </div>
            ) : (
              '매칭 시작하기'
            )}
          </button>
          
          <p className="text-[10px] text-center text-slate-400 mt-4">
            모든 대화는 철저히 익명으로 보호되며, 매칭 종료 시 데이터는 파기됩니다.
          </p>
        </div>
      </div>

      {/* 하단 로그인 정보 이동 버튼 (테스트용) */}
      <button 
        onClick={() => router.push('/login')}
        className="mt-8 text-slate-400 text-xs hover:text-indigo-500 underline underline-offset-4"
      >
        로그인 페이지로 돌아가기
      </button>
    </main>
  );
}