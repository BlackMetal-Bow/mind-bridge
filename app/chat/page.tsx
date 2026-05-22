'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '../socket'; // ★ 메인 화면과 똑같은 공유 무전기 사용!

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

  const myNicknameRef = useRef('');

  useEffect(() => {
    const thought = localStorage.getItem('userThought');
    const tags = JSON.parse(localStorage.getItem('userTags') || '[]');
    const nickname = localStorage.getItem('nickname') || '익명 사용자';
    const savedRoomId = localStorage.getItem('currentRoomId') || '';

    if (thought) setTargetThought(thought);
    if (tags) setTargetTags(tags);
    
    setMyNickname(nickname);
    myNicknameRef.current = nickname;
    setRoomId(savedRoomId);

    // 페이지를 넘어가도 소켓이 안 끊기므로, 이미 방에 들어와 있지만 안전장치로 한 번 더 확인
    const joinRoom = () => {
      if (savedRoomId) {
        socket.emit('join_room', { roomId: savedRoomId });
      }
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    const handleReceiveMessage = (data: MessageItem) => {
      console.log('상대방 메시지 수신:', data);
      setMessages((prev) => [...prev, data]);
    };

    socket.on('receive_message', handleReceiveMessage);

    const handlePartnerDisconnect = (data: { message: string }) => {
      alert(data.message);
    };

    socket.on('partner_disconnected', handlePartnerDisconnect);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('partner_disconnected', handlePartnerDisconnect);
    };
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const newMsg = {
      roomId: roomId,
      nickname: myNickname,
      message: inputValue.trim()
    };

    socket.emit('send_message', newMsg);
    setMessages((prev) => [...prev, newMsg]);
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
          <button onClick={handleLeave} className="text-xs text-slate-400 hover:text-red-500 transition-colors">나가기</button>
        </div>
        
        <div className="p-4 bg-indigo-50 m-4 rounded-2xl border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-wider">상대방의 고민 주제</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {targetTags.map(tag => (
              <span key={tag} className="text-[11px] bg-white text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-200">{tag}</span>
            ))}
          </div>
          <p className="text-sm text-slate-700 italic line-clamp-3">"{targetThought}"</p>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
          {messages.length === 0 ? (
            <div className="text-center text-xs text-slate-300 mt-4">매칭이 완료되었습니다. 따뜻한 대화를 나누어보세요!</div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.nickname === myNickname;
              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'}`}>
                    {!isMe && <p className="text-[10px] text-indigo-400 font-bold mb-1">{msg.nickname}</p>}
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t flex gap-2">
          <input className="flex-1 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="따뜻한 한마디를 건네보세요..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}/>
          <button onClick={sendMessage} className="bg-indigo-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-all">→</button>
        </div>
      </div>
    </main>
  );
}
