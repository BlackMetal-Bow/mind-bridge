'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/app/socket';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [myNickname, setMyNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const savedRoomId = localStorage.getItem('currentRoomId') || '';
    const nickname = localStorage.getItem('nickname') || '익명 사용자';
    
    setRoomId(savedRoomId);
    setMyNickname(nickname);

    if (savedRoomId) {
      socket.emit('join_room', { roomId: savedRoomId });
    }

    // ★ 채팅 중복 해결: 서버에서 메아리쳐서 돌아온 메시지만 화면에 그린다!
    const handleReceive = (data: any) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.off('receive_message');
    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    // ★ 내가 쓴 글을 서버로 쏘기만 함 (여기서 setMessages를 안 하기 때문에 2번 뜰 일이 없음!)
    socket.emit('send_message', {
      roomId: roomId,
      nickname: myNickname,
      message: inputValue.trim()
    });
    
    setInputValue(''); // 텍스트 입력창만 비워줌
  };

  const handleLeave = () => {
    if (confirm('채팅방을 나가시겠습니까?')) {
      localStorage.removeItem('currentRoomId');
      window.location.href = '/';
    }
  };

  return (
    <main className="min-h-screen bg-indigo-50 p-4">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-3xl h-[92vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-bold text-indigo-600">익명 상담방 ({myNickname})</span>
          <button onClick={handleLeave} className="text-xs text-slate-400 hover:text-red-500">나가기</button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
          {messages.map((msg, index) => {
            const isMe = msg.nickname === myNickname;
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                  {!isMe && <p className="text-[10px] text-indigo-400 font-bold mb-1">{msg.nickname}</p>}
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t flex gap-2">
          <input 
            className="flex-1 border-none rounded-full px-5 py-3 text-sm outline-none bg-white shadow-sm" 
            placeholder="메시지를 입력하세요..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-indigo-500 text-white w-12 h-12 rounded-full">→</button>
        </div>
      </div>
    </main>
  );
}
