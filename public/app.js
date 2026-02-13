(() => {
  const socket = io();

  // Elements
  const landing = document.getElementById("landing");
  const chat = document.getElementById("chat");
  const btnCreate = document.getElementById("btn-create");
  const btnJoin = document.getElementById("btn-join");
  const btnLeave = document.getElementById("btn-leave");
  const inputRoomId = document.getElementById("input-room-id");
  const landingError = document.getElementById("landing-error");
  const roomInfo = document.getElementById("room-info");
  const messages = document.getElementById("messages");
  const typingIndicator = document.getElementById("typing-indicator");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");

  let myName = null;
  let currentRoomId = null;
  let typingTimeout = null;

  function showScreen(screen) {
    landing.classList.remove("active");
    chat.classList.remove("active");
    screen.classList.add("active");
  }

  function addMessage(type, content) {
    const div = document.createElement("div");
    div.className = `message ${type}`;

    if (type === "system") {
      div.innerHTML = `<div class="text">${escapeHtml(content)}</div>`;
    } else {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      div.innerHTML = `
        <div class="sender">${escapeHtml(content.name)}</div>
        <div class="text">${escapeHtml(content.text)}</div>
        <div class="time">${time}</div>
      `;
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function joinRoom(roomId) {
    socket.emit("join-room", roomId, (response) => {
      if (response.error) {
        landingError.textContent = response.error;
        return;
      }
      myName = response.name;
      currentRoomId = roomId;
      roomInfo.textContent = `Room: ${roomId.slice(0, 8)}… · You are ${myName} · ${response.userCount} online`;
      messages.innerHTML = "";
      addMessage("system", `You joined as ${myName}`);
      showScreen(chat);
    });
  }

  // Create room
  btnCreate.addEventListener("click", () => {
    landingError.textContent = "";
    socket.emit("create-room", (response) => {
      joinRoom(response.roomId);
    });
  });

  // Join room
  btnJoin.addEventListener("click", () => {
    landingError.textContent = "";
    const roomId = inputRoomId.value.trim();
    if (!roomId) {
      landingError.textContent = "Please enter a Room ID";
      return;
    }
    joinRoom(roomId);
  });

  // Leave room
  btnLeave.addEventListener("click", () => {
    currentRoomId = null;
    myName = null;
    socket.disconnect();
    socket.connect();
    showScreen(landing);
  });

  // Send message
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    socket.emit("chat-message", { text });
    messageInput.value = "";
    socket.emit("stop-typing");
  });

  // Typing indicator
  messageInput.addEventListener("input", () => {
    socket.emit("typing");
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop-typing");
    }, 1000);
  });

  // Socket events
  socket.on("chat-message", (msg) => {
    const type = msg.name === myName ? "own" : "other";
    addMessage(type, msg);
  });

  socket.on("user-joined", (data) => {
    addMessage("system", `${data.name} joined · ${data.userCount} online`);
    roomInfo.textContent = roomInfo.textContent.replace(
      /\d+ online/,
      `${data.userCount} online`
    );
  });

  socket.on("user-left", (data) => {
    addMessage("system", `${data.name} left · ${data.userCount} online`);
    roomInfo.textContent = roomInfo.textContent.replace(
      /\d+ online/,
      `${data.userCount} online`
    );
  });

  socket.on("typing", (data) => {
    typingIndicator.textContent = `${data.name} is typing...`;
  });

  socket.on("stop-typing", () => {
    typingIndicator.textContent = "";
  });
})();
