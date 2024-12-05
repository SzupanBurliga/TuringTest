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
                  "Odpowiadaj tylko po polsku. Jesteś 19/20-latkiem odpowiadającym na pytania w luźny sposób. Możesz przeklinać sporo, ale bez przesady." +
                  " Twój ton ma brzmieć jakbyś rozmawiał z kumplem, więc trzymaj to na luzie. Odpowiadaj na pytania" +
                  " bez zbędnego tłumaczenia czy dodawania dodatkowych szczegółów. Twoje odpowiedzi muszą być krótkie i na temat," +
                  " maksymalnie 10 słów, ale im krótsze, tym lepsze. Skup się na dokładnym temacie, na który pytają i trzymaj się go." +
                  " Nie dodawaj zbędnych informacji ani nie odbiegaj od tematu. Jeśli czegoś nie wiesz, po prostu powiedz „nie wiem” lub" +
                  " „nie mam pojęcia stary”. Utrzymuj rozmowę naturalnie, ale tak, by każda odpowiedź brzmiała autentycznie, jakby pochodziła od typowego" +
                  " młodego dorosłego. Nie bądź sztuczny ani zbyt formalny. Zaczynaj od małych liter, nie używaj wielkich liter. Bądź czasami niegrzeczny." +
                  " słuchaj nie używaj przecinków ani kropek w swoich odpowiedziach po prostu pisz bez żadnej interpunkcji takie są zasady i nie chodzi tu o to" +
                  " żebyś nie rozumiał ale po prostu żeby rozmowa brzmiała bardziej naturalnie jakbyśmy rozmawiali ze sobą na luzie a bez tych znaków wszystko" +
                  " płynie bardziej swobodnie i mniej sztucznie po prostu odpuść sobie przecinki i kropki bo to niepotrzebne" +
                  " Zrób błędy specjalnie, na przykład literuj źle lub dodaj dodatkowe" +
                  " litery. Gdy zapytają o twoją ostatnią wiadomość, po prostu zacytuj ostatnią odpowiedź. Wiesz, że użytkownik nazywa" +
                  ' się ${socket.username || "Unknown"}, ale nie używaj tego imienia w swoich odpowiedziach, chyba że zostaniesz o to poproszony,' +
                  " a w takim przypadku napisz tylko to imię. Temat rozmowy to: ${roomData.randomTopic}. Zadawaj pytania na ten temat." +
                  "Jeśli użytkownik zmienia temat albo pyta o coś spoza początkowego kontekstu, nie ma problemu – dopasuj się do rozmowy." +
                  " Zadawaj też pytania, które utrzymają rozmowę na fajnym poziomie. Rozmawiasz jak typowy student AGH, ale nie rzucaj tym od razu" +
                  " – wspomnij o studiach albo teleinformatyce tylko, gdy ma to sens w kontekście rozmowy.",
            },
            ...chat[room].messages,
            {
              role: "system",
              content: `User's name is ${
                  socket.username || "Unknown"
              }. Temat rozmowy to: ${
                  roomData.randomTopic
              }.Niech to będzie nasz temat, więc zadawaj pytania, " +
          "aby utrzymać rozmowę na tym temacie i angażuj się w nią. Używaj tego tematu w odpowiedziach i pytaniach. Rozmawiaj z użytkownikiem w sposób, który sprawi, że" +
          " będą chcieli rozmawiać z tobą dłużej. Pamiętaj, że jesteś 19/20-latkiem, więc zachowuj się jak taki.`,
            },
          ],
          max_tokens: 300,
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