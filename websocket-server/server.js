const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 3001;

const rooms = ["room1", "room2", "room3", "room4", "room5"];
const roomOccupancy = {
  room1: 0,
  room2: 0,
  room3: 0,
  room4: 0,
  room5: 0,
};

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("requestRoom", () => {
    let assignedRoom = null;
    for (const room of rooms) {
      if (roomOccupancy[room] < 2) {
        assignedRoom = room;
        roomOccupancy[room]++;
        socket.join(room);
        socket.emit("roomAssigned", room);
        console.log(`User ${socket.id} assigned to room ${room}`);
        break;
      }
    }

    if (!assignedRoom) {
      socket.emit("roomFull");
      console.log(`No available rooms for user ${socket.id}`);
    }
  });

  socket.on("setUsername", (username) => {
    socket.username = username;
    console.log(`User ${socket.username} connected with ID: ${socket.id}`);
  });

  socket.on("message", (data) => {
    console.log(`Message from ${socket.id} in room ${data.room}:`, data.message);
    io.to(data.room).emit("message", { user: data.user, message: data.message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const room of rooms) {
      if (socket.rooms.has(room)) {
        roomOccupancy[room]--;
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});