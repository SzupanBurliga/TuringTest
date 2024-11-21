import React from "react";
import {useNavigate} from "react-router-dom";
import "./Modal.css";

const Modal = ({ title, message, closeModal, onVote }) => {
    const navigate = useNavigate();
    const handleVote = (vote) => {
        console.log("User voted: ", vote);
        onVote(vote);
        closeModal();
        navigate("/");
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-buttons">
                    <button onClick={() => handleVote("AI Bot")} className="buttonAI" >AI Bot</button>
                    <button onClick={() => handleVote("Human")} className="buttonHuman">Human</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
