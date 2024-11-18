import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";
import ChatWindow from "./ChatWindow";
import UserInput from "./UserInput";
import SendButton from "./SendButton";
import Modal from "./Modal";

const socket = io("http://localhost:3001");

function MainView() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [room, setRoom] = useState(null);
  const [timer, setTimer] = useState(128);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vote, setVote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on("message", (data) => {
      setChatHistory((prevChat) => [...prevChat, data]);
    });

    socket.on("roomAssigned", (assignedRoom) => {
      setRoom(assignedRoom);
    });

    socket.on("roomFull", () => {
      alert("All rooms are full. Please try again later.");
    });

    return () => {
      socket.off("message");
      socket.off("roomAssigned");
      socket.off("roomFull");
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      setIsModalVisible(true);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const data = { user: username, message, room };
      socket.emit("message", data);
      setMessage("");
    }
  };

  const handleSetUsername = () => {
    if (username.trim()) {
      socket.emit("setUsername", username);
      socket.emit("requestRoom");
      setIsUsernameSet(true);
    }
  };

  return (
    <div className="chat-container">
      {!isUsernameSet ? (
        <div className="username-setup">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleSetUsername}>Join Chat</button>
        </div>
      ) : (
        <>
          {room ? (
            <>
              <ChatWindow chatHistory={chatHistory} />
              <div className="input-area">
                <div>
                  <UserInput message={message} handleInputChange={handleInputChange} />
                </div>
                <div>
                  <SendButton handleSendMessage={handleSendMessage} />
                </div>
              </div>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </>
      )}
    </div>
  );
}

export default MainView;