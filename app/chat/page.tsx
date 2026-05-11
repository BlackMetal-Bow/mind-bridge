'use client';

import React, { useEffect, useState } from 'react';

export default function ChatPage() {
  const [targetThought, setTargetThought] = useState('');
  const [targetTags, setTargetTags] = useState([]);

  // 페이지 로드 시 저장된 고민 데이터 가져오기
  useEffect(() => {
    const thought = localStorage.getItem('userThought');
    const tags = JSON.parse(localStorage.getItem('userTags') || '[]');
    if (thought) setTargetThought(thought);
    if (tags) setTargetTags(tags);
  }, []);

  return (
    <main className="min-h-screen bg-indigo-50 p-4 font-sans">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl h-[92vh] flex flex-col overflow-hidden">
        {/* 상단바 */}
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <span className="font-bold text-indigo-600">익명 상담방</span>
          <button className="text-xs text-slate-400">나가기</button>
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

        {/* 메시지 구역 */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none max-w-[80%] text-sm text-slate-700">
              반가워요. 남겨주신 고민글 잘 읽어보았습니다. 저도 비슷한 경험이 있어서 공감이 되네요.
            </div>
          </div>
        </div>

        {/* 입력 구역 */}
        <div className="p-4 bg-slate-50 border-t flex gap-2">
          <input 
            className="flex-1 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none" 
            placeholder="따뜻한 한마디를 건네보세요..." 
          />
          <button className="bg-indigo-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-all">
            →
          </button>
        </div>
      </div>
    </main>
  );
}