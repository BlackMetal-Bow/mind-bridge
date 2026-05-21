'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

// 지호님의 4000번 매칭 서버 소켓으로 연결 주파수 고정
const socket = io('http://localhost:4000', { autoConnect: false });

// 대화 메시지 한 개당 들어갈 데이터 규격 설정
interface MessageItem {
  nickname: string;
  message: string;
}

export default function ChatPage() {
  const router = useRouter();
  
  // 상태 관리
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [targetThought, setTargetThought] = useState('');
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [myNickname, setMyNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  // 1. 페이지 로드 시 데이터 세팅 및 소켓 연결
  useEffect(() => {
    const thought = localStorage.getItem('userThought');
    const tags = JSON.parse(localStorage.getItem('userTags') || '[]');
    const nickname = localStorage.getItem('nickname') || '익명 사용자';
    const savedRoomId = localStorage.getItem('currentRoomId') || '';

    if (thought) setTargetThought(thought);
    if (tags) setTargetTags(tags);
    setMyNickname(nickname);
    setRoomId(savedRoomId);

    // 소켓 연결 시작
    if (!socket.connected) socket.connect();

    // ★ 중요: 지호님 서버로 "나 이 방에 들어왔어"라고 먼저 알려주기 위한 로직
    // (서버 코드 규격에 맞춰서 소켓이 연결되면 서버가 알아서 방을 묶어줍니다)

    // ★ 지호님 서버가 쏴주는 실시간 대화 신호('chat:message')를 대기
    socket.on('chat:message', (data: MessageItem) => {
      console.log('실시간 메시지 수신:', data);
      setMessages((prev) => [...prev, data]); // 대화창에 메시지 누적
    });

    // 화면 나갈 때 무전기 끄기
    return () => {
      socket.off('chat:message');
    };
  }, []);

  // 2. 메시지 전송 함수
  const sendMessage = () => {
    if (!inputValue.trim()) return; // 빈 칸이면 전송 금지

    // 지호님 매칭 서버(server.js)가 딱 요구하는 3가지 데이터 규격 전송
    socket.emit('chat:message', {
      roomId: roomId,
      nickname: myNickname,
      message: inputValue.trim()
    });

    setInputValue(''); // 입력창 초기화
  };

  // 3. 엔터키 누르면 전송되는 편의 기능
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // 4. 나가기 버튼 함수
  const handleLeave = () => {
    if (confirm('채팅방을 나가시겠습니까?')) {
      localStorage.removeItem('currentRoomId');
      window.location.href = '/';
    }
  };

  return (
    <main className="min-h-screen bg-indigo-50 p-4 font-sans">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* 상단바 */}
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <span className="font-bold text-indigo-600">익명 상담방 ({myNickname})</span>
          <button onClick={handleLeave} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
            나가기
          </button>
        </div>
        
        {/* 상대방 고민 요약 (카드 형태) */}
        <div className="p-4 bg-indigo-50 m-4 rounded-2xl border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-wider">상대방의 고민 주제</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {targetTags.map(tag => (
              <span key={tag} className="text-[11px] bg-white text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-200">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-700 italic line-clamp-3">"{targetThought}"</p>
        </div>

        {/* 메시지 구역 (진짜 실시간 대화가 출력되는 곳) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
          {messages.length === 0 ? (
            <div className="text-center text-xs text-slate-300 mt-4">
              매칭이 완료되었습니다. 따뜻한 대화를 나누어보세요!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.nickname === myNickname;
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                    isMe 
                      ? 'bg-indigo-500 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {/* 내가 보낸 게 아니라면 위에 보낸 사람 닉네임 띄워주기 */}
                    {!isMe && <p className="text-[10px] text-indigo-400 font-bold mb-1">{msg.nickname}</p>}
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 입력 구역 */}
        <div className="p-4 bg-slate-50 border-t flex gap-2">
          <input 
            className="flex-1 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" 
            placeholder="따뜻한 한마디를 건네보세요..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={sendMessage}
            className="bg-indigo-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-all"
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}
