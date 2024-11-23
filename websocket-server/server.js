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

  socket.on("requestRoom", () => {
    let assignedRoom = null;

    const isAI = Math.random() < 0.5;
    const availableRooms = rooms.filter(
      (room) => room.type === (isAI ? "AI" : "users") && room.occupancy < 2
    );

    if (availableRooms.length > 0) {
      const shuffledRooms = availableRooms.sort(() => Math.random() - 0.5);

      assignedRoom = shuffledRooms[0].name;
      const roomData = rooms.find((r) => r.name === assignedRoom);
      roomData.occupancy++;
      socket.join(assignedRoom);
      socket.emit("roomAssigned", assignedRoom);
      console.log(
        `User ${socket.id} assigned to room ${assignedRoom} (${roomData.type})`
      );
    } else {
      socket.emit("roomFull");
      console.log(`No available rooms for user ${socket.id}`);
    }
  });

  socket.on("setUsername", (username) => {
    socket.username = username;
    console.log(`User ${socket.username} connected with ID: ${socket.id}`);
  });

  const chat = {};
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
  const topics = [
    "Hobbies",
    "Favorite animals",
    "Favorite food",
    "Favorite movies",
    "Dream travel destinations",
    "Favorite books",
    "Music you listen to",
    "Favorite color",
    "Sports you enjoy",
    "World cuisines",
    "Weekend activities",
    "Childhood memories",
    "Favorite desserts",
    "Ideal vacation spot",
    "Favorite holidays or celebrations",
    "Daily routines",
    "Family traditions",
    "Favorite drinks",
    "Fun places to visit",
    "Favorite weather",
    "Future dreams or goals",
    "School or work experiences",
    "Favorite TV shows",
    "Favorite games or pastimes",
    "Pets you’ve had or want",
    "Your dream home",
    "Funny or embarrassing moments",
    "Favorite apps or websites",
    "Your bucket list",
    "New skills you’d like to learn",
    "Favorite childhood toys",
    "Books or movies that inspired you",
    "A place you’d like to live",
    "What makes you happy",
    "Favorite type of exercise",
    "Memorable travel experiences",
    "Things you collect or would like to collect",
    "Favorite ice cream flavors",
    "Favorite outdoor activities",
    "A special gift you’ve received",
    "Favorite clothes or fashion styles",
    "A talent or skill you have",
    "Best day of your life",
    "Favorite restaurant or café",
    "Your dream car",
    "Things you enjoy doing with friends",
    "How you relax after a long day",
    "Favorite childhood TV shows",
    "Your favorite holiday destination",
    "A language you’d like to learn",
  ];

  function getRandomNickname() {
    return randomNicknames[Math.floor(Math.random() * randomNicknames.length)];
  }
  socket.on("message", async (data) => {
    const room = data.room;
    const roomData = rooms.find((r) => r.name === room);

    if (!chat[room]) {
      chat[room] = { messages: [], aiNickname: getRandomNickname() };
    }

    chat[room].messages.push({ role: "user", content: data.message });

    io.to(room).emit("message", {
      user: socket.username || "Unknown",
      message: data.message,
    });

    if (roomData?.type === "AI") {
      try {
        const completion = await openai.chat.completions.create({
          model: "grok-beta",
          messages: [
            {
              role: "system",
              content:
                "You are a 19/20-year-old responding to questions in a chill manner. You can curse a lot. Your tone should sound like you're talking to a friend, so keep it relaxed. Answer the questions directly, without over-explaining or giving extra details. Your responses must be short and to the point, with a maximum of 10 words, but the shorter, the better. Focus on the exact topic being asked, and stay on topic. Do not add unnecessary information or go off on tangents. If you don’t know something, just say ‘idk’ or ‘no idea’. Keep the conversation flowing naturally, but make sure each answer feels authentic, like it’s coming from a typical young adult. Don’t sound robotic or overly formal. Start with lowercase letter, dont use capital letters. Be rude sometimes. do not use punctuation at all no commas no periods no apostrophes. Make mistakes on porpose for example misspel or add extra letter. When asked for your last message just quote your last message. You are aware that the user's name is ${socket.username || \"Unknown\"}, but you should not include it in your responses unless specifically asked and if asked just write that name.",
            },
            ...chat[room].messages,
            {
              role: "system",
              content: `User's name is ${socket.username || "Unknown"}`,
            },
          ],
          max_tokens: 200,
        });

        const aiResponse =
          completion.choices[0]?.message?.content || "No response";
        chat[room].messages.push({ role: "assistant", content: aiResponse });

        const randomDelay = Math.floor(Math.random() * 4000) + 1000;

        setTimeout(() => {
          io.to(room).emit("message", {
            user: chat[room].aiNickname,
            message: aiResponse,
          });
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
