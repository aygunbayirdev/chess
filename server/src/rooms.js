import { Chess } from 'chess.js';

const rooms = new Map();
const ROOM_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomId() {
  let id;
  do {
    id = Array.from({ length: 5 }, () => ROOM_ID_CHARS[Math.floor(Math.random() * ROOM_ID_CHARS.length)]).join('');
  } while (rooms.has(id));
  return id;
}

export function createRoom(socketId) {
  const room = {
    id: generateRoomId(),
    chess: new Chess(),
    players: [{ socketId, color: 'w' }],
  };
  rooms.set(room.id, room);
  return room;
}

export function joinRoom(roomId, socketId) {
  const room = rooms.get(roomId?.toUpperCase());
  if (!room) return { error: 'ROOM_NOT_FOUND' };
  if (room.players.some((p) => p.socketId === socketId)) return { error: 'ALREADY_IN_ROOM' };
  if (room.players.length >= 2) return { error: 'ROOM_FULL' };
  room.players.push({ socketId, color: 'b' });
  return { room };
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}

export function getPlayer(room, socketId) {
  return room.players.find((p) => p.socketId === socketId);
}

export function removePlayerFromAllRooms(socketId) {
  for (const room of rooms.values()) {
    const idx = room.players.findIndex((p) => p.socketId === socketId);
    if (idx !== -1) {
      room.players.splice(idx, 1);
      if (room.players.length === 0) {
        rooms.delete(room.id);
      }
      return room;
    }
  }
  return null;
}
