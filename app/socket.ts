import { io } from 'socket.io-client';

// 앱 채팅오류 해결 
export const socket = io('http://localhost:4000', { autoConnect: true });
