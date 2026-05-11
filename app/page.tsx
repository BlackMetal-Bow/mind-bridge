'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [thought, setThought] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // 제공할 태그 리스트
  const availableTags = ['📚 학업/진로', '🤝 인간관계', '❤️ 연애/사랑', '🏠 가족문제', '😢 우울/불안', '💰 경제적고민', '🔥 번아웃', '👻 기타'];

  // 태그 클릭 핸들러
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const startMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      // 로컬 스토리지에 고민 내용과 태그를 임시 저장 (채팅방에서 꺼내 쓰기 위함)
      localStorage.setItem('userThought', thought);
      localStorage.setItem('userTags', JSON.stringify(selectedTags));
      
      alert('비슷한 고민을 가진 상대를 찾았습니다!');
      router.push('/chat');
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-600">마음 연결</h1>
          <p className="text-slate-500 mt-2">어떤 고민을 나누고 싶으신가요?</p>
        </div>

        {/* 태그 선택 구역 */}
        <div>
          <label className="text-sm font-bold mb-3 block text-slate-600">관련 키워드 선택 (중복 가능)</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 상세 고민 입력 */}
        <div>
          <label className="text-sm font-bold mb-3 block text-slate-600">상세 내용 작성</label>
          <textarea
            className="w-full h-48 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none resize-none transition-all"
            placeholder="채팅 상대가 먼저 읽게 될 고민 내용입니다. 자세히 적을수록 좋아요."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
          />
        </div>

        <button
          onClick={startMatching}
          disabled={!thought || selectedTags.length === 0 || isMatching}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
            isMatching ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          {isMatching ? '매칭 대기 중...' : '이 고민으로 매칭 시작하기'}
        </button>
      </div>
    </main>
  );
}