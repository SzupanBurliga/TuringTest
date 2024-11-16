import React from "react";

function ChatWindow({ chatHistory }) {
  return (
    <div className="chat-window">
      {chatHistory.map((entry, index) => (
        <div key={index} className="chat-message">
          <strong>{entry.user}:</strong> {entry.message}
        </div>
      ))}
    </div>
  );
}

export default ChatWindow;
