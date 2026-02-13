const { RoomManager, generateAnonymousName } = require("../src/room");

describe("generateAnonymousName", () => {
  test("returns a non-empty string", () => {
    const name = generateAnonymousName();
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });

  test("contains a number", () => {
    const name = generateAnonymousName();
    expect(name).toMatch(/\d+/);
  });
});

describe("RoomManager", () => {
  let manager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  test("createRoom returns a room ID", () => {
    const roomId = manager.createRoom();
    expect(typeof roomId).toBe("string");
    expect(roomId.length).toBeGreaterThan(0);
  });

  test("getRoom returns room after creation", () => {
    const roomId = manager.createRoom();
    const room = manager.getRoom(roomId);
    expect(room).not.toBeNull();
    expect(room.id).toBe(roomId);
  });

  test("getRoom returns null for unknown room", () => {
    expect(manager.getRoom("nonexistent")).toBeNull();
  });

  test("addUser adds a user and returns a name", () => {
    const roomId = manager.createRoom();
    const name = manager.addUser(roomId, "socket1");
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });

  test("addUser returns null for unknown room", () => {
    expect(manager.addUser("nonexistent", "socket1")).toBeNull();
  });

  test("getUserName returns the correct name", () => {
    const roomId = manager.createRoom();
    const name = manager.addUser(roomId, "socket1");
    expect(manager.getUserName(roomId, "socket1")).toBe(name);
  });

  test("getUserName returns null for unknown user", () => {
    const roomId = manager.createRoom();
    expect(manager.getUserName(roomId, "unknown")).toBeNull();
  });

  test("getUserCount reflects correct count", () => {
    const roomId = manager.createRoom();
    expect(manager.getUserCount(roomId)).toBe(0);
    manager.addUser(roomId, "socket1");
    expect(manager.getUserCount(roomId)).toBe(1);
    manager.addUser(roomId, "socket2");
    expect(manager.getUserCount(roomId)).toBe(2);
  });

  test("removeUser removes user and returns name", () => {
    const roomId = manager.createRoom();
    const name = manager.addUser(roomId, "socket1");
    const removedName = manager.removeUser(roomId, "socket1");
    expect(removedName).toBe(name);
    expect(manager.getUserCount(roomId)).toBe(0);
  });

  test("removeUser deletes empty room", () => {
    const roomId = manager.createRoom();
    manager.addUser(roomId, "socket1");
    manager.removeUser(roomId, "socket1");
    expect(manager.getRoom(roomId)).toBeNull();
  });

  test("removeUser returns null for unknown room", () => {
    expect(manager.removeUser("nonexistent", "socket1")).toBeNull();
  });

  test("removeUser returns null for unknown socket", () => {
    const roomId = manager.createRoom();
    expect(manager.removeUser(roomId, "unknown")).toBeNull();
  });

  test("listRooms returns all rooms", () => {
    manager.createRoom();
    manager.createRoom();
    const rooms = manager.listRooms();
    expect(rooms).toHaveLength(2);
    expect(rooms[0]).toHaveProperty("id");
    expect(rooms[0]).toHaveProperty("userCount");
    expect(rooms[0]).toHaveProperty("createdAt");
  });
});
