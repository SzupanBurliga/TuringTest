import React from "react";
import { useNavigate } from "react-router-dom";
import "./Modal.css";

const Modal = ({ title, message, closeModal, onVote, room }) => {
  const navigate = useNavigate();
  const handleVote = (vote) => {
    const isCorrect =
      (["room1", "room3", "room5"].includes(room) && vote === "AI Bot") ||
      (["room2", "room4", "room6"].includes(room) && vote === "Human");

    console.log("User voted: ", vote);
    console.log("Was correct:", isCorrect);
    onVote({ vote, isCorrect });
    closeModal();
    navigate("/TitlePage");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={() => handleVote("AI Bot")} className="buttonAI">
            AI
          </button>
          <button onClick={() => handleVote("Human")} className="buttonHuman">
            Człowiek
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
