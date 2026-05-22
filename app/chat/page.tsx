'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', { autoConnect: false });

interface MessageItem {
  roomId: string;
  nickname: string;
  message: string;
  sentAt?: string;
}

export default function ChatPage() {
  const router = useRouter();
  
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [targetThought, setTargetThought] = useState('');
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [myNickname, setMyNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const thought = localStorage.getItem('userThought');
    const tags = JSON.parse(localStorage.getItem('userTags') || '[]');
    const nickname = localStorage.getItem('nickname') || '익명 사용자';
    const savedRoomId = localStorage.getItem('currentRoomId') || '';

    if (thought) setTargetThought(thought);
    if (tags) setTargetTags(tags);
    setMyNickname(nickname);
    setRoomId(savedRoomId);

    if (!socket.connected) socket.connect();

    // ★ [방 재입장]: 지호님 서버에 새로 추가한 'join_room' 채널로 내 방 번호 전송!
    if (savedRoomId) {
      socket.emit('join_room', { roomId: savedRoomId });
      console.log('채팅방 재입장 신호 전송 완료:', savedRoomId);
    }

    // ★ [메시지 수신]: 지호님 서버가 쏴주는 진짜 대화 채널 'receive_message' 대기!
    socket.on('receive_message', (data: MessageItem) => {
      console.log('실시간 메시지 수신:', data);
      setMessages((prev) => [...prev, data]);
    });

    // 상대방 퇴장 알림 처리
    socket.on('partner_disconnected', (data: { message: string }) => {
      alert(data.message);
    });

    return () => {
      socket.off('receive_message');
      socket.off('partner_disconnected');
    };
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    // ★ [메시지 송신]: 지호님 서버가 기다리는 'send_message' 채널로 데이터 발송!
    socket.emit('send_message', {
      roomId: roomId,
      nickname: myNickname,
      message: inputValue.trim()
    });

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleLeave = () => {
    if (confirm('채팅방을 나가시겠습니까?')) {
      localStorage.removeItem('currentRoomId');
      window.location.href = '/';
    }
  };

  return (
    <main className="min-h-screen bg-indigo-50 p-4 font-sans">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl h-[92vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <span className="font-bold text-indigo-600">익명 상담방 ({myNickname})</span>
          <button onClick={handleLeave} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
            나가기
          </button>
        </div>
        
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
                    isMe ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    {!isMe && <p className="text-[10px] text-indigo-400 font-bold mb-1">{msg.nickname}</p>}
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t flex gap-2">
          <input 
            className="flex-1 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" 
            placeholder="따뜻한 한마디를 건네보세요..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage} className="bg-indigo-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-all">
            →
          </button>
        </div>
      </div>
    </main>
  );
}
