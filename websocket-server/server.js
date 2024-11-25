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
  { name: "room1", type: "AI", occupancy: 1, turn: null },
  { name: "room2", type: "users", occupancy: 0, turn: null },
  { name: "room3", type: "AI", occupancy: 1, turn: null },
  { name: "room4", type: "users", occupancy: 0, turn: null },
  { name: "room5", type: "AI", occupancy: 1, turn: null },
  { name: "room6", type: "users", occupancy: 0, turn: null },
];

app.get("/MainView", (req, res) => {
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
      const aiStarts = Math.random() < 0.5;
      roomData.turn = aiStarts ? null : socket.id;
      socket.join(assignedRoom);
      socket.emit("roomAssigned", assignedRoom);
      console.log(
          `User ${socket.id} assigned to room ${assignedRoom} (${roomData.type})`
      );

      if (aiStarts && roomData.type === "AI") {
        const aiNickname = getRandomNickname();
        roomData.aiNickname = aiNickname;
        setTimeout(() => {
          io.to(assignedRoom).emit("message", {
            user: aiNickname,
            message: "siema",
          });
          roomData.turn = socket.id;
          console.log(`Turn is now: ${socket.id}`);
        }, 8000);
      } else if (!aiStarts && roomData.type === "users") {
        const otherUser = [...io.sockets.adapter.rooms.get(assignedRoom)].find(
            (id) => id !== socket.id
        );
        roomData.turn = otherUser || socket.id;
        console.log(`Turn is now: ${roomData.turn}`);
      }
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
    "michał",
    "dsadassa",
    "siema",
    "cos",
    "łobza",
    "hfdgfdgd",
    "fafsdf",
    "tak",
    "xdxdxd",
    "cokolwiek",
  ];
  const topics = [
    "Hobby",
    "Ulubione zwierzęta",
    "Ulubione jedzenie",
    "Ulubione filmy",
    "Wymarzone miejsca do podróży",
    "Ulubione książki",
    "Muzyka, którą słuchasz",
    "Ulubiony kolor",
    "Sporty, które lubisz",
    "Kuchnie świata",
    "Aktywności weekendowe",
    "Wspomnienia z dzieciństwa",
    "Ulubione desery",
    "Idealne miejsce na wakacje",
    "Ulubione święta",
    "Codzienne rutyny",
    "Tradycje rodzinne",
    "Ulubione napoje",
    "Ciekawe miejsca, które warto odwiedzić",
    "Ulubiona pogoda",
    "Marzenia na przyszłość",
    "Doświadczenia ze szkoły lub pracy",
    "Ulubione programy TV",
    "Ulubione gry lub zabawy",
    "Zwierzęta, które miałeś lub chcesz mieć",
    "Twój wymarzony dom",
    "Śmieszne lub wstydliwe momenty",
    "Ulubione aplikacje lub strony internetowe",
    "Lista rzeczy do zrobienia w życiu",
    "Nowe umiejętności, które chciałbyś opanować",
    "Ulubione zabawki z dzieciństwa",
    "Książki lub filmy, które cię zainspirowały",
    "Miejsce, w którym chciałbyś mieszkać",
    "Co cię uszczęśliwia",
    "Ulubiony rodzaj ćwiczeń",
    "Niezapomniane wspomnienia z podróży",
    "Rzeczy, które zbierasz lub chciałbyś zbierać",
    "Ulubione smaki lodów",
    "Ulubione aktywności na świeżym powietrzu",
    "Specjalny prezent, który otrzymałeś",
    "Ulubione ubrania lub style mody",
    "Ulubiona restauracja lub kawiarnia w Krakowie",
    "Twój wymarzony samochód",
    "Rzeczy, które lubisz robić z przyjaciółmi",
    "Jak relaksujesz się po długim dniu",
    "Ulubione programy TV z dzieciństwa",
    "Twoje ulubione miejsce na wakacje",
    "Język, który chciałbyś poznać",
  ];


  function getRandomNickname() {
    return randomNicknames[Math.floor(Math.random() * randomNicknames.length)];
  }
  socket.on("message", async (data) => {
    const room = data.room;
    const roomData = rooms.find((r) => r.name === room);

    if (!chat[room]) {
      chat[room] = { messages: [], aiNickname: roomData.aiNickname || getRandomNickname() };
    }

    if (roomData.turn !== socket.id) {
      socket.emit("notYourTurn");
      return;
    }

    chat[room].messages.push({ role: "user", content: data.message });

    io.to(room).emit("message", {
      user: socket.username || "Unknown",
      message: data.message,
    });

    roomData.turn = null;

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
          roomData.turn = socket.id;
          console.log(`Turn is now: ${socket.username}`);
        }, randomDelay);
      } catch (error) {
        console.error("Error with OpenAI API:", error);
        io.to(room).emit("message", {
          user: chat[room].aiNickname,
          message: "Sorry, something went wrong.",
        });
        roomData.turn = socket.id;
        console.log(`Turn is now: ${socket.id}`);
      }
    } else {
      const otherUser = [...io.sockets.adapter.rooms.get(room)].find(
          (id) => id !== socket.id
      );
      roomData.turn = otherUser || socket.id;
      console.log(`Turn is now: ${roomData.turn}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const room of rooms) {
      if (socket.rooms.has(room.name)) {
        room.occupancy--;
        if (room.turn === socket.id) {
          room.turn = null;
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});