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
      socket.join(assignedRoom);
      socket.emit("roomAssigned", assignedRoom);
      console.log(
          `User ${socket.id} assigned to room ${assignedRoom} (${roomData.type})`
      );

      if (roomData.type === "AI") {
        const aiStarts = Math.random() < 0.5;
        roomData.turn = aiStarts ? null : socket.id;
        if (aiStarts) {
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
                  "Odpowiadaj tylko po polsku. Jesteś 19/20-latkiem odpowiadającym na pytania w luźny sposób. Możesz przeklinać sporo." +
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
                  " się ${socket.username || \"Unknown\"}, ale nie używaj tego imienia w swoich odpowiedziach, chyba że zostaniesz o to poproszony," +
                  " a w takim przypadku napisz tylko to imię.",
            },
            ...chat[room].messages,
            {
              role: "system",
              content: `User's name is ${socket.username || "Unknown"}`,
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