'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { socket } from '@/lib/socket';

type ChatMessage = {
  roomId: string;
  nickname: string;
  message: string;
  sentAt: string;
};

export default function ChatPage() {
  const router = useRouter();

  const [targetThought, setTargetThought] = useState('');
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('익명 사용자');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 페이지 로드 시 저장된 고민 데이터와 채팅방 정보 가져오기
  useEffect(() => {
    const savedRoomId = localStorage.getItem('roomId') || '';
    const savedNickname = localStorage.getItem('nickname') || '익명 사용자';
    const thought = localStorage.getItem('userThought') || '';
    const tags = JSON.parse(localStorage.getItem('userTags') || '[]');

    setRoomId(savedRoomId);
    setNickname(savedNickname);
    setTargetThought(thought);
    setTargetTags(tags);

    if (!savedRoomId) {
      alert('채팅방 정보가 없습니다. 다시 매칭해주세요.');
      router.push('/');
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleReceiveMessage = (data: ChatMessage) => {
      console.log('메시지 받음:', data);
      setMessages((prev) => [...prev, data]);
    };

    const handleChatError = (data: any) => {
      alert(data.message || '채팅 오류가 발생했습니다.');
    };

    const handlePartnerDisconnected = (data: any) => {
      alert(data.message || '상대방이 연결을 종료했습니다.');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('chat_error', handleChatError);
    socket.on('partner_disconnected', handlePartnerDisconnected);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('chat_error', handleChatError);
      socket.off('partner_disconnected', handlePartnerDisconnected);
    };
  }, [router]);

  const sendMessage = () => {
    if (!roomId) {
      alert('채팅방 정보가 없습니다.');
      return;
    }

    if (!message.trim()) return;

    socket.emit('send_message', {
      roomId,
      nickname,
      message,
    });

    setMessage('');
  };

  const reportUser = async () => {
  const reason = prompt('신고 사유를 입력해주세요.');

  if (!reason || reason.trim() === '') {
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        reporterNickname: nickname,
        reportedNickname: '상대방',
        reason,
        recentMessages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || '신고 접수에 실패했습니다.');
      return;
    }

    alert('신고가 접수되었습니다.');
  } catch (error) {
    console.error('신고 요청 오류:', error);
    alert('서버 오류로 신고 접수에 실패했습니다.');
  }
};

  const leaveChat = () => {
    if (confirm('채팅방을 나가시겠습니까?')) {
      localStorage.removeItem('roomId');
      localStorage.removeItem('userThought');
      localStorage.removeItem('userTags');

      if (socket.connected) {
        socket.disconnect();
      }

      router.push('/');
    }
  };
=======
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
>>>>>>> b510bd63158c911ba7517b22f385d1de31367b1f

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
<<<<<<< HEAD
    <main className="min-h-screen bg-indigo-50 p-4 font-sans">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl h-[92vh] flex flex-col overflow-hidden">
        {/* 상단바 */}
        <div className="p-4 border-b bg-white flex justify-between items-center">
  <span className="font-bold text-indigo-600">익명 상담방</span>

  <div className="flex gap-3">
    <button
      onClick={reportUser}
      className="text-xs text-red-400 hover:text-red-600"
    >
      신고
    </button>

    <button
      onClick={leaveChat}
      className="text-xs text-slate-400 hover:text-red-500"
    >
      나가기
    </button>
  </div>
</div>

        {/* 고민 요약 카드 */}
        <div className="p-4 bg-indigo-50 m-4 rounded-2xl border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-wider">
            매칭된 고민 주제
          </p>

          <div className="flex flex-wrap gap-1 mb-2">
            {targetTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-white text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-sm text-slate-700 italic line-clamp-3">
            "{targetThought}"
          </p>
=======
    <main className="min-h-screen bg-indigo-50 p-4">
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-3xl h-[92vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-bold text-indigo-600">익명 상담방 ({myNickname})</span>
          <button onClick={handleLeave} className="text-xs text-slate-400 hover:text-red-500">나가기</button>
>>>>>>> b510bd63158c911ba7517b22f385d1de31367b1f
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
<<<<<<< HEAD
          {messages.length === 0 ? (
            <div className="text-center text-sm text-slate-400 mt-10">
              아직 메시지가 없습니다. 먼저 따뜻한 한마디를 건네보세요.
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.nickname === nickname;

              return (
                <div
                  key={index}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 max-w-[80%] text-sm shadow-sm ${
                      isMine
                        ? 'bg-indigo-500 text-white rounded-2xl rounded-tr-none'
                        : 'bg-slate-100 text-slate-700 rounded-2xl rounded-tl-none'
                    }`}
                  >
                    <p className={`text-[10px] mb-1 ${isMine ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {msg.nickname}
                    </p>
                    <p>{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
=======
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
>>>>>>> b510bd63158c911ba7517b22f385d1de31367b1f
        </div>

        <div className="p-4 bg-slate-50 border-t flex gap-2">
<<<<<<< HEAD
          <input
            className="flex-1 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            placeholder="따뜻한 한마디를 건네보세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            className="bg-indigo-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-all"
          >
            →
          </button>
=======
          <input 
            className="flex-1 border-none rounded-full px-5 py-3 text-sm outline-none bg-white shadow-sm" 
            placeholder="메시지를 입력하세요..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-indigo-500 text-white w-12 h-12 rounded-full">→</button>
>>>>>>> b510bd63158c911ba7517b22f385d1de31367b1f
        </div>
      </div>
    </main>
  );
}
