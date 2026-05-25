'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  bio: string;
  is_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 수정 모드
  const [editing, setEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');

  // 비밀번호 변경
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  // 회원 탈퇴
  const [showDelete, setShowDelete] = useState(false);
  const [deletePw, setDeletePw] = useState('');

  // 처음 로드 시 내 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:8000/api/v1/users/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('인증 실패');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setEditNickname(data.nickname);
        setEditBio(data.bio || '');
        setLoading(false);
      })
      .catch(() => {
        alert('로그인이 필요합니다');
        router.push('/login');
      });
  }, [router]);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname: editNickname !== user?.nickname ? editNickname : undefined,
          bio: editBio !== user?.bio ? editBio : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || '수정 실패');
        return;
      }

      const updated = await res.json();
      setUser(updated);
      localStorage.setItem('nickname', updated.nickname);
      setEditing(false);
      alert('프로필이 수정되었습니다');
    } catch (e) {
      alert('서버 연결 실패');
    }
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) {
      alert('새 비밀번호는 8자 이상이어야 합니다');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/users/me/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPw,
          new_password: newPw,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || '변경 실패');
        return;
      }

      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      localStorage.clear();
      router.push('/login');
    } catch (e) {
      alert('서버 연결 실패');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/users/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePw }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || '탈퇴 실패');
        return;
      }

      alert('회원 탈퇴가 완료되었습니다');
      localStorage.clear();
      router.push('/login');
    } catch (e) {
      alert('서버 연결 실패');
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">로딩 중...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="w-full max-w-lg mx-auto space-y-4">
        {/* 상단 - 뒤로가기 */}
        <button
          onClick={() => router.push('/')}
          className="text-sm text-slate-500 hover:text-indigo-600"
        >
          ← 메인으로
        </button>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <h1 className="text-2xl font-bold text-indigo-600">마이페이지</h1>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">이메일</p>
              <p className="text-slate-700">{user.email}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">닉네임</p>
              {editing ? (
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              ) : (
                <p className="text-slate-700 font-semibold">{user.nickname}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">자기소개</p>
              {editing ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 mt-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                />
              ) : (
                <p className="text-slate-700">{user.bio || '아직 자기소개가 없습니다'}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">이메일 인증</p>
              <p className={user.is_verified ? 'text-green-600 font-semibold' : 'text-red-500'}>
                {user.is_verified ? '✓ 인증됨' : '✗ 미인증'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">가입일</p>
              <p className="text-slate-700 text-sm">
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 수정 버튼 */}
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-600"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditNickname(user.nickname);
                  setEditBio(user.bio || '');
                }}
                className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-600"
            >
              프로필 수정
            </button>
          )}
        </div>

        {/* 비밀번호 변경 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="w-full text-left text-slate-700 font-medium hover:text-indigo-600"
            >
              🔒 비밀번호 변경
            </button>
          ) : (
            <div className="space-y-3">
              <h2 className="font-bold text-slate-700">비밀번호 변경</h2>
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <input
                type="password"
                placeholder="새 비밀번호 (8자 이상)"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 bg-indigo-500 text-white py-2 rounded-lg font-bold hover:bg-indigo-600"
                >
                  변경
                </button>
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setCurrentPw('');
                    setNewPw('');
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold hover:bg-slate-300"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 회원 탈퇴 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="w-full text-left text-red-500 font-medium hover:text-red-700"
            >
              ⚠ 회원 탈퇴
            </button>
          ) : (
            <div className="space-y-3">
              <h2 className="font-bold text-red-500">회원 탈퇴</h2>
              <p className="text-xs text-slate-500">
                탈퇴 시 모든 데이터가 영구 삭제됩니다. 본인 확인을 위해 비밀번호를 입력해주세요.
              </p>
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={deletePw}
                onChange={(e) => setDeletePw(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-400 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600"
                >
                  탈퇴하기
                </button>
                <button
                  onClick={() => {
                    setShowDelete(false);
                    setDeletePw('');
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold hover:bg-slate-300"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}