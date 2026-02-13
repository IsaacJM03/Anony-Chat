const http = require("http");
const { Server } = require("socket.io");
const { createApp } = require("../src/app");
const { RoomManager } = require("../src/room");
const { setupSocket } = require("../src/socket");
const ioClient = require("socket.io-client");

let server, io, roomManager, port;

function createClient() {
  return ioClient(`http://localhost:${port}`, {
    transports: ["websocket"],
    forceNew: true,
  });
}

beforeAll((done) => {
  roomManager = new RoomManager();
  const app = createApp(roomManager);
  server = http.createServer(app);
  io = new Server(server);
  setupSocket(io, roomManager);
  server.listen(0, () => {
    port = server.address().port;
    done();
  });
});

afterAll((done) => {
  io.close();
  server.close(done);
});

describe("Socket.IO events", () => {
  let client1;

  afterEach((done) => {
    if (client1 && client1.connected) {
      client1.disconnect();
    }
    // Short delay to let cleanup happen
    setTimeout(done, 100);
  });

  test("create-room returns a roomId", (done) => {
    client1 = createClient();
    client1.on("connect", () => {
      client1.emit("create-room", (response) => {
        expect(response).toHaveProperty("roomId");
        expect(typeof response.roomId).toBe("string");
        done();
      });
    });
  });

  test("join-room returns name and userCount", (done) => {
    client1 = createClient();
    client1.on("connect", () => {
      client1.emit("create-room", (createRes) => {
        client1.emit("join-room", createRes.roomId, (joinRes) => {
          expect(joinRes).toHaveProperty("name");
          expect(joinRes).toHaveProperty("userCount");
          expect(joinRes.userCount).toBe(1);
          done();
        });
      });
    });
  });

  test("join-room with invalid ID returns error", (done) => {
    client1 = createClient();
    client1.on("connect", () => {
      client1.emit("join-room", "invalid-room-id", (response) => {
        expect(response).toHaveProperty("error");
        done();
      });
    });
  });

  test("chat-message is broadcast to room members", (done) => {
    client1 = createClient();

    client1.on("connect", () => {
      client1.emit("create-room", (createRes) => {
        const roomId = createRes.roomId;
        client1.emit("join-room", roomId, () => {
          const client2 = createClient();
          client2.on("connect", () => {
            client2.emit("join-room", roomId, () => {
              client2.on("chat-message", (msg) => {
                expect(msg).toHaveProperty("name");
                expect(msg).toHaveProperty("text", "hello");
                expect(msg).toHaveProperty("timestamp");
                client2.disconnect();
                done();
              });
              // Small delay to ensure listener is ready
              setTimeout(() => {
                client1.emit("chat-message", { text: "hello" });
              }, 100);
            });
          });
        });
      });
    });
  }, 10000);

  test("user-left is emitted on disconnect", (done) => {
    client1 = createClient();

    client1.on("connect", () => {
      client1.emit("create-room", (createRes) => {
        const roomId = createRes.roomId;
        client1.emit("join-room", roomId, () => {
          const client2 = createClient();
          client2.on("connect", () => {
            client2.emit("join-room", roomId, () => {
              client1.on("user-left", (data) => {
                expect(data).toHaveProperty("name");
                expect(data).toHaveProperty("userCount");
                done();
              });
              // Small delay to ensure listener is ready
              setTimeout(() => {
                client2.disconnect();
              }, 100);
            });
          });
        });
      });
    });
  }, 10000);
});
