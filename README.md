# Anony-Chat

Anonymous & secure counseling chat platform. No accounts, no tracking — just private conversations.

## Features

- **Anonymous identities** — random names assigned on join (e.g. BraveOwl42)
- **Ephemeral messages** — nothing is stored; messages exist only in memory
- **Real-time chat** — powered by Socket.IO WebSockets
- **Chat rooms** — create or join rooms via shareable Room IDs
- **Typing indicators** — see when someone is typing
- **Security headers** — Helmet.js for HTTP security best practices

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests

```bash
npm test
```

## Architecture

```
src/
  server.js   — entry point, creates HTTP + Socket.IO server
  app.js      — Express app with REST API and static file serving
  room.js     — RoomManager class for room/user lifecycle
  socket.js   — Socket.IO event handlers for real-time chat
public/
  index.html  — single-page chat UI
  style.css   — dark-theme styles
  app.js      — client-side Socket.IO logic
test/
  room.test.js    — unit tests for RoomManager
  app.test.js     — REST API integration tests
  socket.test.js  — WebSocket integration tests
```

## API

| Method | Path             | Description          |
|--------|-----------------|----------------------|
| GET    | /api/rooms      | List active rooms    |
| POST   | /api/rooms      | Create a new room    |
| GET    | /api/rooms/:id  | Get room details     |
