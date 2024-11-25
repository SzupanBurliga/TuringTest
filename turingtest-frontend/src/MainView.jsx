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
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vote, setVote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on("message", (data) => {
      setChatHistory((prevChat) => [...prevChat, data]);
    });

    socket.on("roomAssigned", (assignedRoom) => {
      setRoom(assignedRoom);
      setIsLoading(false);
    });

    socket.on("roomFull", () => {
      alert("All rooms are full. Please try again later.");
      setIsLoading(false);
    });

    socket.on("startTimer", () => {
      setIsTimerActive(true);
    });

    return () => {
      socket.off("message");
      socket.off("roomAssigned");
      socket.off("roomFull");
      socket.off("startTimer");
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
    console.log("handleSendMessage called");
    if (message.trim() && room) {
      const data = { user: username, message, room, timerStarted: false };
      socket.emit("message", data);
      setMessage("");
    }
  };

  const handleSetUsername = () => {
    if (username.trim()) {
      socket.emit("setUsername", username);
      socket.emit("requestRoom");
      setIsUsernameSet(true);
      setIsLoading(true);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (!isUsernameSet) {
    return (
      <div className="username-setup">
        <h2>Set your username</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <button onClick={handleSetUsername}>Set Username</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <div className="loader-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="backgroud">
      {isModalVisible && (
        <Modal
          title="Time's Up!"
          message="Who do you think you were chatting with?"
          closeModal={closeModal}
          onVote={handleVote}
        />
      )}
      <div className="container-for-header-timer">
        <div className="header-text">Welcome, {username}!</div>
        <div className="timer">{formatTime(timer)}</div>
      </div>
      <div className="chat-container">
        <ChatWindow chatHistory={chatHistory} username={username} />
        <div className="input-area">
          <div>
            <UserInput
              message={message}
              handleInputChange={handleInputChange}
            />
          </div>
          <div>
            <SendButton handleSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainView;