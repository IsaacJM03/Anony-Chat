const express = require("express");
const helmet = require("helmet");
const { RoomManager } = require("./room");

function createApp(roomManager) {
  const app = express();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
    })
  );
  app.use(express.static("public"));
  app.use(express.json());

  app.get("/api/rooms", (_req, res) => {
    res.json(roomManager.listRooms());
  });

  app.post("/api/rooms", (_req, res) => {
    const roomId = roomManager.createRoom();
    res.status(201).json({ roomId });
  });

  app.get("/api/rooms/:id", (req, res) => {
    const room = roomManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json({
      id: room.id,
      userCount: room.users.size,
      createdAt: room.createdAt,
    });
  });

  return app;
}

module.exports = { createApp };
