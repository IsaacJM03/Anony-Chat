function setupSocket(io, roomManager) {
  io.on("connection", (socket) => {
    let currentRoom = null;

    socket.on("create-room", (callback) => {
      const roomId = roomManager.createRoom();
      if (typeof callback === "function") {
        callback({ roomId });
      }
    });

    socket.on("join-room", (roomId, callback) => {
      const room = roomManager.getRoom(roomId);
      if (!room) {
        if (typeof callback === "function") {
          callback({ error: "Room not found" });
        }
        return;
      }

      if (currentRoom) {
        socket.leave(currentRoom);
        const leftName = roomManager.removeUser(currentRoom, socket.id);
        if (leftName) {
          io.to(currentRoom).emit("user-left", {
            name: leftName,
            userCount: roomManager.getUserCount(currentRoom),
          });
        }
      }

      currentRoom = roomId;
      socket.join(roomId);
      const name = roomManager.addUser(roomId, socket.id);

      if (typeof callback === "function") {
        callback({ name, userCount: roomManager.getUserCount(roomId) });
      }

      socket.to(roomId).emit("user-joined", {
        name,
        userCount: roomManager.getUserCount(roomId),
      });
    });

    socket.on("chat-message", (data) => {
      if (!currentRoom) return;
      const name = roomManager.getUserName(currentRoom, socket.id);
      if (!name) return;

      const message = {
        name,
        text: typeof data === "string" ? data : data.text,
        timestamp: new Date().toISOString(),
      };

      io.to(currentRoom).emit("chat-message", message);
    });

    socket.on("typing", () => {
      if (!currentRoom) return;
      const name = roomManager.getUserName(currentRoom, socket.id);
      if (name) {
        socket.to(currentRoom).emit("typing", { name });
      }
    });

    socket.on("stop-typing", () => {
      if (!currentRoom) return;
      const name = roomManager.getUserName(currentRoom, socket.id);
      if (name) {
        socket.to(currentRoom).emit("stop-typing", { name });
      }
    });

    socket.on("disconnect", () => {
      if (currentRoom) {
        const name = roomManager.removeUser(currentRoom, socket.id);
        if (name) {
          io.to(currentRoom).emit("user-left", {
            name,
            userCount: roomManager.getUserCount(currentRoom),
          });
        }
      }
    });
  });
}

module.exports = { setupSocket };
