import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { createRoom, joinRoom, getRoom, getPlayer, removePlayerFromAllRooms } from './rooms.js';

const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  socket.on('room:create', (_payload, callback) => {
    const room = createRoom(socket.id);
    socket.join(room.id);
    callback?.({ roomId: room.id, color: 'w', fen: room.chess.fen(), opponentConnected: false });
  });

  socket.on('room:join', ({ roomId } = {}, callback) => {
    const result = joinRoom(roomId, socket.id);
    if (result.error) {
      callback?.({ error: result.error });
      return;
    }
    const { room } = result;
    socket.join(room.id);
    callback?.({ roomId: room.id, color: 'b', fen: room.chess.fen(), opponentConnected: true });
    socket.to(room.id).emit('room:opponent-joined');
  });

  socket.on('game:move', ({ roomId, from, to, promotion } = {}, callback) => {
    const room = getRoom(roomId);
    if (!room) {
      callback?.({ error: 'ROOM_NOT_FOUND' });
      return;
    }
    const player = getPlayer(room, socket.id);
    if (!player) {
      callback?.({ error: 'NOT_IN_ROOM' });
      return;
    }
    if (room.players.length < 2) {
      callback?.({ error: 'WAITING_FOR_OPPONENT' });
      return;
    }
    if (room.chess.turn() !== player.color) {
      callback?.({ error: 'NOT_YOUR_TURN' });
      return;
    }

    let move = null;
    try {
      move = room.chess.move({ from, to, promotion: promotion || 'q' });
    } catch {
      move = null;
    }
    if (!move) {
      callback?.({ error: 'ILLEGAL_MOVE' });
      return;
    }

    const fen = room.chess.fen();
    const status = {
      isGameOver: room.chess.isGameOver(),
      isCheckmate: room.chess.isCheckmate(),
      isDraw: room.chess.isDraw(),
      isStalemate: room.chess.isStalemate(),
      turn: room.chess.turn(),
    };

    io.to(room.id).emit('game:move', { move, fen, status });
    callback?.({ ok: true });
  });

  socket.on('disconnect', () => {
    const room = removePlayerFromAllRooms(socket.id);
    if (room) {
      io.to(room.id).emit('room:opponent-left');
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
