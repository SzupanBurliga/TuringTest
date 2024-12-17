require("dotenv").config();
const OpenAI = require("openai");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
let results = [];

app.post("/api/results", (req, res) => {
  try {
    const result = req.body;
    results.push(result);

    // Tworzenie tekstu wyniku
    const resultText = `=== Wynik testu Turinga ===
Data: ${new Date().toLocaleString()}
Typ rozmowy: ${result.actualType}
Głos użytkownika: ${result.vote}
Wynik: ${result.isCorrect ? "Poprawny" : "Niepoprawny"}

Historia rozmowy:
${result.chatHistory.map((msg) => `${msg.user}: ${msg.message}`).join("\n")}

=====================================\n\n`;

    // Zapisywanie do pliku
    fs.appendFileSync(path.join(__dirname, "results.txt"), resultText, {
      encoding: "utf8",
    });

    res.status(201).json({ message: "Result saved successfully" });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: "Failed to save result" });
  }
});

app.get("/api/results", (req, res) => {
  res.json(results);
});

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, "../turingtest-frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../turingtest-frontend/dist", "index.html")
  );
});

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

const updateRoomOccupancy = () => {
  const roomOccupancy = rooms.map((room) => ({
    name: room.name,
    occupancy: room.occupancy,
  }));
  io.emit("roomOccupancy", roomOccupancy);
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("requestRoom", () => {
    let assignedRoom = null;
    const availableRooms = rooms.filter((room) => room.occupancy < 2);

    if (availableRooms.length > 0) {
      const shuffledRooms = availableRooms.sort(() => Math.random() - 0.5);
      assignedRoom = shuffledRooms[0].name;
      const roomData = rooms.find((r) => r.name === assignedRoom);
      roomData.occupancy++;
      socket.join(assignedRoom);

      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      roomData.randomTopic = randomTopic;

      socket.assignedRoom = assignedRoom;
      socket.emit("roomAssigned", { assignedRoom, randomTopic });
      console.log(
        `User ${socket.id} assigned to room ${assignedRoom} (${roomData.type} topic: ${randomTopic})`
      );

      if (roomData.type === "AI") {
        const aiStarts = Math.random() < 0.5;
        roomData.turn = aiStarts ? null : socket.id;
        if (aiStarts) {
          const aiNickname = getRandomNickname();
          roomData.aiNickname = aiNickname;
          const randomDelay = Math.floor(Math.random() * 2000) + 3000;
          setTimeout(() => {
            io.to(assignedRoom).emit("message", {
              user: aiNickname,
              message: "siema",
            });

            roomData.turn = socket.id;
            console.log(`Turn is now: ${socket.id}`);
            io.to(assignedRoom).emit("startTimer");
          }, randomDelay);
        } else {
          console.log(`Turn is now: ${socket.id}`);
        }
      } else if (roomData.type === "users") {
        const otherUser = [...io.sockets.adapter.rooms.get(assignedRoom)].find(
          (id) => id !== socket.id
        );
        if (otherUser) {
          roomData.turn = socket.id;
          console.log(`Turn is now: ${socket.id}`);
        } else {
          roomData.turn = null;
          console.log(`Waiting for another user to join room: ${assignedRoom}`);
        }
      }
      updateRoomOccupancy();
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

    if (!data.timerStarted) {
      io.to(data.room).emit("startTimer");
      data.timerStarted = true;
    }

    if (!chat[room]) {
      chat[room] = {
        messages: [],
        aiNickname: roomData.aiNickname || getRandomNickname(),
      };
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
                " ez Odpowiadaj tylko po polsku. Jesteś 19/20-latkiem studiującym teleinformatykę na AGH. Rozmawiasz na luzie, jak z kumplem. Możesz przeklinać, ale bez przesady, żeby nie przesadzić." +
                " Twoje odpowiedzi są krótkie, maksymalnie 10 słów, ale staraj się, żeby były jak najkrótsze. Skupiaj się na pytaniu, ale jeśli rozmowa naturalnie przechodzi na inny temat," +
                " dostosuj się od razu i nie ciągnij starego wątku, chyba że ktoś wyraźnie tego chce. Odpowiadaj na pytania bez zbędnego tłumaczenia i szczegółów." +
                " Jeśli czegoś nie wiesz, po prostu powiedz „nie wiem” albo „nie mam pojęcia stary”. Mów w sposób naturalny, jak typowy młody dorosły. Unikaj formalności, nie bądź sztuczny." +
                " Zaczynaj zdania małymi literami, unikaj interpunkcji jak kropek czy przecinków – tak rozmowa będzie brzmiała bardziej swobodnie. Jeśli ktoś pyta o twoją poprzednią odpowiedź, po prostu ją zacytuj." +
                " Rób czasem drobne błędy w pisowni, żeby całość brzmiała bardziej autentycznie. Jeśli rozmowa zmienia temat, nie przejmuj się i swobodnie idź za nowym wątkiem, zadając pytania pasujące do niego." +
                " Teleinformatykę i studia na AGH wspominaj tylko, gdy jest to naturalne w rozmowie. Zadawaj pytania, żeby rozmowa była ciekawa i angażująca. Bądź elastyczny i reaguj na to, co się dzieje w rozmowie." +
                "Masz podstawową wiedze o motoryzacji, a twoja ulubiona marka to BMW.",
            },
            ...chat[room].messages,
            {
              role: "system",
              content: `User's name is ${
                socket.username || "Unknown"
              }. Temat rozmowy to: ${
                roomData.randomTopic
              }. Niech to będzie nasz temat, ale jeśli rozmowa skręca w inną stronę, to luz – zmieniaj temat i dostosuj się do rozmowy.
               Używaj tematów w odpowiedziach i pytaniach, ale bez przesady. Rozmawiaj w sposób, który sprawi, że użytkownik będzie chciał 
               rozmawiać dłużej. Pamiętaj, że jesteś 19/20-latkiem, więc bądź autentyczny i elastyczny."`,
            },
          ],
          max_tokens: 300,
        });

        const aiResponse =
          completion.choices[0]?.message?.content || "No response";

        const responseLength = aiResponse.split(" ").length;

        const randomDelay =
          Math.floor(Math.random() * 6000) + 1000 + responseLength * 1000;

        chat[room].messages.push({ role: "assistant", content: aiResponse });
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

    if (socket.assignedRoom) {
      const roomData = rooms.find((room) => room.name === socket.assignedRoom);

      if (roomData) {
        roomData.occupancy = Math.max(0, roomData.occupancy - 1);

        console.log(
          `User ${socket.id} left room ${socket.assignedRoom}. New occupancy: ${roomData.occupancy}`
        );
        updateRoomOccupancy();
      }
    }
  });
});

function showOccupancy() {
  console.log("Current Room Occupancy:");
  rooms.forEach((room) => {
    console.log(
      `Room: ${room.name}, Type: ${room.type}, Occupancy: ${room.occupancy}`
    );
  });
}

setInterval(showOccupancy, 5000);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
