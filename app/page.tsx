'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/app/socket';

export default function Home() {
  const router = useRouter();
  const [thought, setThought] = useState('');
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    // 1. 매칭 성공 이벤트 (수정된 안전한 로직)
    const handleMatched = (data: any) => {
      console.log('서버로부터 받은 매칭 데이터:', data);

      // 데이터가 제대로 왔는지 꼼꼼하게 확인
      if (data && data.room && data.room.roomId) {
        localStorage.setItem('currentRoomId', data.room.roomId);
        setIsMatching(false);
        alert('비슷한 고민을 가진 상대를 찾았습니다!');
        router.push('/chat');
      } else {
        console.error('매칭 데이터 형식이 올바르지 않습니다:', data);
      }
    };

    socket.on('matched', handleMatched);
    socket.on('waiting', () => alert('상대를 찾는 중입니다...'));

    return () => {
      socket.off('matched', handleMatched);
      socket.off('waiting');
    };
  }, [router]);

  const startMatching = () => {
    if (!thought.trim()) {
      alert('고민을 먼저 입력해주세요!');
      return;
    }
    
    setIsMatching(true);
    localStorage.setItem('userThought', thought);
    localStorage.setItem('nickname', '익명_' + Math.floor(Math.random() * 1000));
    
    socket.emit('join_queue', {
      nickname: localStorage.getItem('nickname'),
      text: thought,
      tags: ['고민상담']
    });
  };

  return (
    <main className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-indigo-600 mb-6">마음 브릿지</h1>
        <textarea
          className="w-full h-32 p-4 border rounded-2xl mb-4 focus:ring-2 focus:ring-indigo-400 outline-none"
          placeholder="지금 어떤 고민이 있으신가요?"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
        />
        <button
          onClick={startMatching}
          disabled={isMatching}
          className={`w-full py-4 rounded-full font-bold text-white transition-all ${
            isMatching ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isMatching ? '상대방 찾는 중...' : '매칭 시작하기'}
        </button>
      </div>
    </main>
  );
}
