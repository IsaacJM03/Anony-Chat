const http = require("http");
const { Server } = require("socket.io");
const { createApp } = require("./app");
const { RoomManager } = require("./room");
const { setupSocket } = require("./socket");

const PORT = process.env.PORT || 3000;

const roomManager = new RoomManager();
const app = createApp(roomManager);
const server = http.createServer(app);
const io = new Server(server);

setupSocket(io, roomManager);

server.listen(PORT, () => {
  console.log(`Anony-Chat server running on port ${PORT}`);
});

module.exports = { server };
