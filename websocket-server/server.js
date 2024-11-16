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

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setUsername", (username) => {
    socket.username = username;
    console.log(`User ${socket.username} connected with ID: ${socket.id}`);
  });

  socket.on("message", (data) => {
    console.log(`Message from ${socket.id}:`, data);
    io.emit("message", { user: data.user, message: data.message }); 
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
