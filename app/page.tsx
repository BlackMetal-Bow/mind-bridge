'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';

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
      router.push('/login');
    } else {
      setUsername(savedName || '익명 사용자');
    }
  }, [router]);

  // 2. Socket.io 매칭 결과 받기
  useEffect(() => {
    const handleWaiting = (data: any) => {
      console.log('대기 중:', data);
      setIsMatching(true);
    };

    const handleMatched = (data: any) => {
      console.log('매칭 완료:', data);

      localStorage.setItem('roomId', data.room.roomId);
      localStorage.setItem('nickname', username || '익명 사용자');
      localStorage.setItem('userThought', thought);
      localStorage.setItem('userTags', JSON.stringify(selectedTags));

      setIsMatching(false);
      router.push('/chat');
    };

    const handleQueueError = (data: any) => {
      alert(data.message || '매칭 중 오류가 발생했습니다.');
      setIsMatching(false);
    };

    const handleConnectError = (error: any) => {
      console.error('Socket 연결 오류:', error);
      alert('서버 연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.');
      setIsMatching(false);
    };

    socket.on('waiting', handleWaiting);
    socket.on('matched', handleMatched);
    socket.on('queue_error', handleQueueError);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('waiting', handleWaiting);
      socket.off('matched', handleMatched);
      socket.off('queue_error', handleQueueError);
      socket.off('connect_error', handleConnectError);
    };
  }, [router, thought, selectedTags, username]);

  // 3. 로그아웃 함수
  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('nickname');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('roomId');
      localStorage.removeItem('userThought');
      localStorage.removeItem('userTags');

      if (socket.connected) {
        socket.disconnect();
      }

      router.push('/login');
    }
  };

  const availableTags = [
    '📚 학업/진로',
    '🤝 인간관계',
    '❤️ 연애/사랑',
    '🏠 가족문제',
    '😢 우울/불안',
    '💰 경제적고민',
    '🔥 번아웃',
    '👻 기타',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 4. 매칭 시작 함수
  const startMatching = () => {
    if (!thought || selectedTags.length === 0) return;

    setIsMatching(true);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_queue', {
      nickname: username || '익명 사용자',
      text: thought,
      tags: selectedTags,
    });

    console.log('매칭 요청 보냄:', {
      nickname: username || '익명 사용자',
      text: thought,
      tags: selectedTags,
    });
  };

  // 로그인 체크 중일 때 빈 화면 처리
  if (!username) return <div className="min-h-screen bg-slate-50" />;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 text-slate-800">
      {/* 상단 네비게이션 바 */}
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            마음 연결
          </h1>
          <p className="text-slate-500 text-sm">
            지금 마음 속 이야기를 들려주세요.
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* 태그 선택 */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block">
            어떤 고민인가요?
          </label>

          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                disabled={isMatching}
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
          <label className="text-sm font-bold text-slate-700 block">
            고민 내용 적기
          </label>

          <textarea
            className="w-full h-44 p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all"
            placeholder="상대방에게 하고 싶은 말을 적어보세요."
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            disabled={isMatching}
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