import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Modal.css";

const Modal = ({ title, message, closeModal, onVote, room, chatHistory }) => {
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleVote = async (vote) => {
    const isCorrect =
      (["room1", "room3", "room5", "room7", "room9"].includes(room) &&
        vote === "AI Bot") ||
      (["room2", "room4", "room6", "room8", "room10"].includes(room) &&
        vote === "Human");

    setIsCorrect(isCorrect);
    setShowResult(true);

    const resultData = {
      timestamp: new Date().toISOString(),
      room: room,
      vote: vote,
      isCorrect: isCorrect,
      actualType: ["room1", "room3", "room5", "room7", "room9"].includes(room)
        ? "AI Bot"
        : "Human",
      username: localStorage.getItem("username"),
      chatHistory: chatHistory || [],
    };

    try {
      const response = await fetch("http://localhost:3001/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        throw new Error("Failed to save results");
      }
    } catch (error) {
      console.error("Error saving results:", error);
    }

    setTimeout(() => {
      onVote({ vote, isCorrect });
      closeModal();
      navigate("/TitlePage");
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        {!showResult ? (
          <div className="modal-buttons">
            <button onClick={() => handleVote("AI Bot")} className="buttonAI">
              AI
            </button>
            <button onClick={() => handleVote("Human")} className="buttonHuman">
              Człowiek
            </button>
          </div>
        ) : (
          <div className="result-message">
            {isCorrect ? (
              <p style={{ color: "green" }}>Poprawna odpowiedź!</p>
            ) : (
              <p style={{ color: "red" }}>Niepoprawna odpowiedź!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
