'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/app/socket';

export default function Home() {
  const router = useRouter();

  const [thought, setThought] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedName = localStorage.getItem('nickname');

    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setUsername(savedName || '익명 사용자');
    }

    const handleMatched = (data: any) => {
      console.log('매칭 성공 데이터:', data);
      const roomId = data?.room?.roomId || data?.roomId;

      if (roomId) {
        localStorage.setItem('currentRoomId', roomId);
        setIsMatching(false);
        alert('비슷한 고민을 가진 상대를 찾았습니다!');
        router.push('/chat');
      } else {
        console.error('방 정보 에러:', data);
      }
    };

    socket.on('matched', handleMatched);
    socket.on('waiting', () => alert('상대방을 찾는 중입니다...'));

    return () => {
      socket.off('matched', handleMatched);
      socket.off('waiting');
    };
  }, [router]);

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('nickname');
      localStorage.removeItem('userEmail');
      router.push('/login');
    }
  };

  const goToProfile = () => router.push('/profile');

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

    localStorage.setItem('userThought', thought);
    localStorage.setItem('userTags', JSON.stringify(selectedTags));

    socket.emit('join_queue', {
      nickname: username,
      text: thought,
      tags: selectedTags
    });
  };

  if (!username) return <div className="min-h-screen bg-slate-50" />;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 text-slate-800">
      <div className="w-full max-w-lg flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xs font-bold">👤</span>
          </div>
          <span className="text-sm font-bold text-slate-700">{username}님</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={goToProfile} className="text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
            마이페이지
          </button>
          <button onClick={handleLogout} className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
            로그아웃
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-slate-100">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">마음 연결</h1>
          <p className="text-slate-500 text-sm">지금 마음 속 이야기를 들려주세요.</p>
        </div>
        <hr className="border-slate-100" />

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

        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block">고민 내용 적기</label>
          <textarea
            className="w-full h-44 p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all"
            placeholder="상대방에게 하고 싶은 말을 적어보세요."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
          />
        </div>

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