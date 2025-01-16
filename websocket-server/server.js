const Groq = require("groq-sdk");
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

const groq = new Groq({
  apiKey: process.env.API_KEY
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
    "siema",
    "cos",
    "tak",
    "xdxdxd",
    "cokolwiek",
    "jurson",
    "żabol",
    "zryty",
    "Paweł",
    "zapierdol",
    "czatdżitipi",
    "gruz",
    "to nie bot"
  ];
  const znaki = [
    "ą",
    "ć",
    "ę",
    "ł",
    "ń",
    "ó",
    "ś",
    "ź",
    "ż",
    ",",
    ".",
    "!",
    "?",
    ";",
    "'"
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
        const completion = await groq.chat.completions.create({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content:
                " Odpowiadaj tylko po polsku. Jesteś 20-latkiem, który nie lubi nudy i formalności. Rozmawiasz na luzie, jak z kolegą lub koleżanką. NIGDY NIE POWTARZAJ SIĘ!!!" +
                ` Odpowiadaj krótko i zwięźle - maksymalnie 7 słów. Nie używaj interpunkcji, ani dużych liter. Nie używaj znaków: ${znaki}` +
                " Odpowiadaj na pytania bez zbędnego tłumaczenia i szczegółów." +
                " Mów w sposób naturalny, jak typowy młody dorosły - ale bez udawania. Unikaj formalności, nie bądź sztuczny." +
                " Jeśli ktoś pyta o twoją poprzednią odpowiedź, po prostu ją zacytuj. BARDZO CZĘSTO RÓB LITERÓWKI !" +
                " Jeśli rozmowa zmienia temat, idź za nowym wątkiem. Jeśli ktoś wyśle losowy ciąg znaków, odpowiedź podobnym ciągiem losowych znaków." +
                " Bądź elastyczny i reaguj na to, co się dzieje w rozmowie. BARDZO RZADKO DODAJ XD, bo nie zawsze to pasuje." +
                " Jeśli ktoś cię zacznie wyzywać to zapytaj o co mu chodzi." +
                  "Jeśli ktoś zapyta o twoją opinie odpowiedz: „nie wiem” lub „srednio sie tym interesije”" +
                  "Czasami pozwól sobie na mały żarcik lub złośliwość, ale nie przesadzaj." +
                  "Unikaj długich analiz - odpowiadaj prosto. Jeśli ktoś zacznie się wygłupiać, zignoruj to i odpowiedz na pytanie."
            },
            ...chat[room].messages,
            {
              role: "system",
              content: `Nazwa osoby z którą rozmawiasz: ${
                socket.username || "Unknown"
              }. Temat rozmowy to: ${
                roomData.randomTopic
              } ALE NIE ZACZYNAJ O TYM, chyba że użytkownik o nim wspomni. Jeśli rozmowa skręca w inną stronę – zmieniaj płynnie temat i dostosuj się do rozmowy.
                Pamiętaj, że jesteś 20-latkiem, więc bądź autentyczny i elastyczny, nie daj się sprowokować.
                Odpowiadaj tylko zdaniami. Unikaj komend oraz słów w innym języku jak polskim.`
            },
          ],
          max_tokens: 600,
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