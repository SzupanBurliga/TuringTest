import React from 'react';

function ChatWindow({ chatHistory }) {
  return (
    <div className="chat-box">
      {chatHistory.map((msg, index) => (
        <div key={index} className="chat-message">
          {msg}
        </div>
      ))}
    </div>
  );
}

export default ChatWindow;