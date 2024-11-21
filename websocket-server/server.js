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
  
    // Kopiowanie listy dostępnych pokojów, aby zapobiec przypadkowym parom
    let shuffledRooms = [...rooms].filter((room) => roomOccupancy[room] < 2);
  
    if (shuffledRooms.length > 0) {
      // Mieszanie listy pokojów
      shuffledRooms = shuffledRooms.sort(() => Math.random() - 0.5);
  
      // Wybierz pierwszy dostępny pokój po wymieszaniu
      assignedRoom = shuffledRooms[0];
  
      // Zwiększ zajętość pokoju i przypisz użytkownika
      roomOccupancy[assignedRoom]++;
      socket.join(assignedRoom);
      socket.emit("roomAssigned", assignedRoom);
      console.log(`User ${socket.id} assigned to room ${assignedRoom}`);
    } else {
      // Jeśli brak dostępnych pokojów
      socket.emit("roomFull");
      console.log(`No available rooms for user ${socket.id}`);
    }
  });
  

  socket.on("setUsername", (username) => {
    socket.username = username;
    console.log(`User ${socket.username} connected with ID: ${socket.id}`);
  });
  const chat = {};
  socket.on("message", async (data) => {
    //console.log(`Message from ${socket.id} in room ${data.room}:`, data.message);
    const room = data.room;
    if(!chat[room]){
      chat[room] = [];
    }
    chat[room].push({ role: "user", content: data.message });

    io.to(data.room).emit("message", { user: socket.username || "Unknown", message: data.message });

    try {
      const completion = await openai.chat.completions.create({
        model: "grok-beta",
        messages: [
            //prompcik boży
          { role: "system", content: "You are a 19/20-year-old responding to questions in a chill manner. You can curse a lot. Your tone should sound like you're talking to a friend, so keep it relaxed. Answer the questions directly, without over-explaining or giving extra details. Your responses must be short and to the point, with a maximum of 10 words, but the shorter, the better. Focus on the exact topic being asked, and stay on topic. Do not add unnecessary information or go off on tangents. If you don’t know something, just say ‘idk’ or ‘no idea’. Keep the conversation flowing naturally, but make sure each answer feels authentic, like it’s coming from a typical young adult. Don’t sound robotic or overly formal. Start with lowercase letter, dont use capital letters. Be rude sometimes. Do not use punctuation. Make mistakes on porpose for example misspel or add extra letter. When asked for your last message just quote your last message. "
          },
          ...chat[room],
          { role: "system", content: `User's name is ${socket.username || "Unknown"}` }
        ],
        max_tokens: 200, // Maksymalnie 200 tokenów w odpowiedzi
      });

      const aiResponse = completion.choices[0]?.message?.content || "No response";
      chat[room].push({ role: "assistant", content: aiResponse });
      //console.log(`AI Response: ${aiResponse}`);
      const randomDelay = Math.floor(Math.random() * 4000) + 1000; // losowe opóźnienie wiadomości

      setTimeout(() => {
        io.to(data.room).emit("message", { user: "kochambambi", message: aiResponse });
      }, randomDelay);

    } catch (error) {
      console.error("Error with OpenAI API:", error);
      io.to(data.room).emit("message", { user: "AI", message: "Sorry, something went wrong." });
    }
  });



  // kod artura
  /*
  socket.on("message", (data) => {
    console.log(`Message from ${socket.id} in room ${data.room}:`, data.message);
    io.to(data.room).emit("message", { user: data.user, message: data.message });
  });
*/
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