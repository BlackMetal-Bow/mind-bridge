require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

// -----------------------------
// 기본 미들웨어 설정
// -----------------------------
app.use(cors({
  origin: "*", // 모든 주소 허용
}));

app.use(express.json());

// -----------------------------
// Socket.io 서버 설정
// -----------------------------
const io = new Server(server, {
  cors: {
    origin: "*", // 소켓 통신도 무조건 허용
    methods: ["GET", "POST"]
  },
});

let openai = null;

if (process.env.OPENAI_API_KEY) {
  const OpenAI = require("openai");
  const OpenAIClient = OpenAI.default || OpenAI;
  openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY });
  console.log("OpenAI API 연결 준비 완료");
} else {
  console.log("OpenAI API 키 없음 → 키워드 기반 감정 분석 사용");
}

const waitingUsers = [];
const rooms = new Map();

app.get("/", (req, res) => res.send("AI Matching Socket Server is running"));
app.get("/health", (req, res) => res.json({ ok: true, waitingUserCount: waitingUsers.length, roomCount: rooms.size }));

// -----------------------------
// Socket.io 연결 처리
// -----------------------------
io.on("connection", (socket) => {
  console.log("사용자 접속:", socket.id);

  // 사용자가 매칭 대기열에 들어올 때
  socket.on("join_queue", async (payload) => {
    try {
      const nickname = payload?.nickname || "익명";
      const text = payload?.text || "";
      const tags = Array.isArray(payload?.tags) ? payload.tags : [];

      if (!text.trim()) {
        socket.emit("queue_error", { message: "감정이나 고민 내용을 입력해주세요." });
        return;
      }

      const emotionData = await analyzeEmotion(text);

      const currentUser = {
        socketId: socket.id,
        nickname,
        text,
        tags,
        emotion: emotionData.emotion,
        intensity: emotionData.intensity,
        topic: emotionData.topic,
        confidence: emotionData.confidence ?? 0.7,
        joinedAt: Date.now(),
      };

      const validation = validateMatchingRequest(currentUser);

      if (!validation.ok) {
        socket.emit("queue_error", { message: validation.message, analysis: { emotion: currentUser.emotion, intensity: currentUser.intensity, topic: currentUser.topic } });
        console.log("매칭 요청 거절:", validation.reason, currentUser);
        return;
      }

      console.log("매칭 대기 요청:", currentUser);
      const matchedUser = findBestMatch(currentUser);

      if (matchedUser) {
        removeWaitingUser(matchedUser.socketId);
        const roomId = createRoomId();

        socket.join(roomId);

        const matchedSocket = io.sockets.sockets.get(matchedUser.socketId);
        if (matchedSocket) matchedSocket.join(roomId);

        const roomInfo = {
          roomId,
          users: [
            { socketId: currentUser.socketId, nickname: currentUser.nickname, emotion: currentUser.emotion, topic: currentUser.topic },
            { socketId: matchedUser.socketId, nickname: matched
