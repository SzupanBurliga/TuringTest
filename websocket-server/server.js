require("dotenv").config();
const OpenAI = require("openai");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: "https://api.x.ai/v1",
});

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

// Lista pokojów z ich typami
const rooms = [
  { name: "room1", type: "AI", occupancy: 1 },
  { name: "room2", type: "users", occupancy: 0 },
  { name: "room3", type: "AI", occupancy: 1 },
  { name: "room4", type: "users", occupancy: 0 },
  { name: "room5", type: "AI", occupancy: 1 },
  { name: "room6", type: "users", occupancy: 0 },
];

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Obsługa żądania przypisania pokoju
  socket.on("requestRoom", () => {
    let assignedRoom = null;

    // Losowanie pokoju z AI lub użytkownikami
    const isAI = Math.random() < 0.5;
    const availableRooms = rooms.filter(
        (room) => room.type === (isAI ? "AI" : "users") && room.occupancy < 2
    );

    if (availableRooms.length > 0) {
      // Mieszanie listy pokojów
      const shuffledRooms = availableRooms.sort(() => Math.random() - 0.5);

      // Przydzielenie pierwszego wolnego pokoju
      assignedRoom = shuffledRooms[0].name;
      const roomData = rooms.find((r) => r.name === assignedRoom);
      roomData.occupancy++;
      socket.join(assignedRoom);
      socket.emit("roomAssigned", assignedRoom); // Informacja zwrotna o przypisaniu pokoju
      console.log(
          `User ${socket.id} assigned to room ${assignedRoom} (${roomData.type})`
      );
    } else {
      // Brak dostępnych pokojów
      socket.emit("roomFull");
      console.log(`No available rooms for user ${socket.id}`);
    }
  });

  // Obsługa ustawiania nazwy użytkownika
  socket.on("setUsername", (username) => {
    socket.username = username;
    console.log(`User ${socket.username} connected with ID: ${socket.id}`);
  });

  const chat = {}; // Historia czatu dla każdego pokoju
  const randomNicknames = [
    "bambi_lover",
    "cool_kid_99",
    "ai_friend",
    "chat_wizard",
    "lazy_panda",
    "rocknrolla",
    "coffee_addict",
    "game_master",
    "drama_queen",
    "funny_dude",
  ];
  function getRandomNickname() {
    return randomNicknames[Math.floor(Math.random() * randomNicknames.length)];
  }
  // Obsługa wiadomości
  socket.on("message", async (data) => {
    const room = data.room;
    const roomData = rooms.find((r) => r.name === room);

    if (!chat[room]) {
      chat[room] = [];
    }

    // Zapisanie wiadomości do historii czatu
    chat[room].push({ role: "user", content: data.message });

    // Rozsyłanie wiadomości do wszystkich w pokoju
    io.to(room).emit("message", {
      user: socket.username || "Unknown",
      message: data.message,
    });

    // Jeśli to pokój z AI, generujemy odpowiedź
    if (roomData?.type === "AI") {
      try {
        const completion = await openai.chat.completions.create({
          model: "grok-beta",
          messages: [
            { role: "system", content: "You are a 19/20-year-old responding to questions in a chill manner. You can curse a lot. Your tone should sound like you're talking to a friend, so keep it relaxed. Answer the questions directly, without over-explaining or giving extra details. Your responses must be short and to the point, with a maximum of 10 words, but the shorter, the better. Focus on the exact topic being asked, and stay on topic. Do not add unnecessary information or go off on tangents. If you don’t know something, just say ‘idk’ or ‘no idea’. Keep the conversation flowing naturally, but make sure each answer feels authentic, like it’s coming from a typical young adult. Don’t sound robotic or overly formal. Start with lowercase letter, dont use capital letters. Be rude sometimes. Do not use punctuation. Make mistakes on porpose for example misspel or add extra letter. When asked for your last message just quote your last message. "
            },
            ...chat[room],
            { role: "system", content: `User's name is ${socket.username || "Unknown"}` },
          ],
          max_tokens: 200, // Maksymalnie 200 tokenów w odpowiedzi
        });

        const aiResponse =
            completion.choices[0]?.message?.content || "No response";
        chat[room].push({ role: "assistant", content: aiResponse });

        // Symulowanie opóźnienia w odpowiedzi AI
        const randomDelay = Math.floor(Math.random() * 4000) + 1000;
        const randomNickname = getRandomNickname(); // losujemy nick dla AI
        setTimeout(() => {
          io.to(room).emit("message", { user: randomNickname, message: aiResponse });
        }, randomDelay);
      } catch (error) {
        console.error("Error with OpenAI API:", error);
        io.to(room).emit("message", {
          user: "AI",
          message: "Sorry, something went wrong.",
        });
      }
    }
  });

  // Obsługa odłączenia użytkownika
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const room of rooms) {
      if (socket.rooms.has(room.name)) {
        room.occupancy--;
        break;
      }
    }
  });
});

// Start serwera
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
