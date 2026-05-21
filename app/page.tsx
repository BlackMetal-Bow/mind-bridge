'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client'; // ◀ 소켓 부품 추가

// 지호님 매칭 서버(4000번 포트) 주소로 직접 무전기 주파수 맞춤
const socket = io('http://localhost:4000', { autoConnect: false });

export default function Home() {
  const router = useRouter();

  // 상태 관리
  const [thought, setThought] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [username, setUsername] = useState('');

  // 1. 로그인 여부 및 사용자 정보 체크 + 소켓 리스너 등록
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedName = localStorage.getItem('nickname');

    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setUsername(savedName || '익명 사용자');
    }

    // ★ 지호님 매칭 서버가 "매칭 성공했어! 방 번호는 이거야" 라고 신호(matching:success)를 보내주길 대기
    socket.on('matching:success', (data: { roomId: string }) => {
      console.log('서버로부터 매칭 성공 신호 수신:', data.roomId);
      localStorage.setItem('currentRoomId', data.roomId); // 방 주소 저장
      setIsMatching(false);
      alert('비슷한 고민을 가진 상대를 찾았습니다!');
      router.push('/chat'); // 매칭이 '진짜 성사되었을 때만' 채팅방으로 이동!
    });

    return () => {
      socket.off('matching:success');
    };
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

  // ★ 수정한 진짜 매칭 시작 함수 (서버에 통신 요청)
  const startMatching = () => {
    if (!thought || selectedTags.length === 0) return;
    
    // 소켓 서버 연결
    if (!socket.connected) socket.connect();
    setIsMatching(true);

    localStorage.setItem('userThought', thought);
    localStorage.setItem('userTags', JSON.stringify(selectedTags));

    // ★ 지호님 매칭 서버 규격(nickname, text, tags)에 정확히 맞춰서 매칭 요청 무전 발송!
    socket.emit('matching:request', {
      nickname: username,
      text: thought,
      tags: selectedTags
    });
  };

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
