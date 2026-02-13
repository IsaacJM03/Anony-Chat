const http = require("http");
const { createApp } = require("../src/app");
const { RoomManager } = require("../src/room");

let server, roomManager, port;

beforeAll((done) => {
  roomManager = new RoomManager();
  const app = createApp(roomManager);
  server = http.createServer(app);
  server.listen(0, () => {
    port = server.address().port;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe("REST API", () => {
  test("POST /api/rooms creates a room", async () => {
    const res = await fetch(`http://localhost:${port}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("roomId");
  });

  test("GET /api/rooms lists rooms", async () => {
    const res = await fetch(`http://localhost:${port}/api/rooms`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/rooms/:id returns room details", async () => {
    const createRes = await fetch(`http://localhost:${port}/api/rooms`, {
      method: "POST",
    });
    const { roomId } = await createRes.json();

    const res = await fetch(`http://localhost:${port}/api/rooms/${roomId}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(roomId);
  });

  test("GET /api/rooms/:id returns 404 for unknown room", async () => {
    const res = await fetch(`http://localhost:${port}/api/rooms/nonexistent`);
    expect(res.status).toBe(404);
  });
});
