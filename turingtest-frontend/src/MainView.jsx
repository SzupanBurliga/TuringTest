import React, { useState, useEffect } from "react";
import "./App.css";
import ChatWindow from "./ChatWindow";
import UserInput from "./UserInput";
import SendButton from "./SendButton";

function MainView() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      if (!isTimerActive) {
        setIsTimerActive(true);
      }

      setChatHistory([...chatHistory, message]);
      setMessage("");
    }
  };
  useEffect(() => {
    const randomLoadTime = Math.floor(Math.random() * 4000) + 4000;
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, randomLoadTime);

    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  if(isLoading) {
    return(
        <div className="loader">
          <img src= "/Spinner.svg" alt ="Loading spinner" className="spinner"/>
          <div className="loader-text">Searching for your partner...</div>
        </div>
    );
  }


  return (
    <div className="backgroud">
      <div className="container-for-header-timer">
        <div className="header-text">Welcome to the Chat!</div>
        <div className="timer">{formatTime(timer)}</div>
      </div>
      <div className="chat-container">
        <ChatWindow chatHistory={chatHistory} />
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
