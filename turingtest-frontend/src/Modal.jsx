import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Modal.css";

const Modal = ({ title, message, closeModal, onVote, room }) => {
  const navigate = useNavigate();
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleVote = (vote) => {
    const isCorrect =
      (["room1", "room3", "room5"].includes(room) && vote === "AI Bot") ||
      (["room2", "room4", "room6"].includes(room) && vote === "Human");

    setIsCorrect(isCorrect);
    setShowResult(true);

    // Opóźniamy zamknięcie modalu i nawigację, aby użytkownik mógł zobaczyć wynik
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
