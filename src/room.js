const { v4: uuidv4 } = require("uuid");

const ADJECTIVES = [
  "Brave",
  "Calm",
  "Gentle",
  "Kind",
  "Quiet",
  "Warm",
  "Bright",
  "Swift",
  "Wise",
  "Bold",
];

const ANIMALS = [
  "Owl",
  "Fox",
  "Deer",
  "Bear",
  "Hawk",
  "Wolf",
  "Dove",
  "Lynx",
  "Hare",
  "Wren",
];

function generateAnonymousName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${animal}${num}`;
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom() {
    const roomId = uuidv4();
    this.rooms.set(roomId, {
      id: roomId,
      users: new Map(),
      createdAt: new Date().toISOString(),
    });
    return roomId;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  addUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const name = generateAnonymousName();
    room.users.set(socketId, { name, joinedAt: new Date().toISOString() });
    return name;
  }

  removeUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const user = room.users.get(socketId);
    if (!user) return null;
    room.users.delete(socketId);
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
    return user.name;
  }

  getUserName(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const user = room.users.get(socketId);
    return user ? user.name : null;
  }

  getUserCount(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.users.size : 0;
  }

  listRooms() {
    const result = [];
    for (const [id, room] of this.rooms) {
      result.push({
        id,
        userCount: room.users.size,
        createdAt: room.createdAt,
      });
    }
    return result;
  }
}

module.exports = { RoomManager, generateAnonymousName };
