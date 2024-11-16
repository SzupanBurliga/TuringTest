import React, { useEffect, useRef } from "react";

function ChatWindow({ chatHistory }) {
  const endOfChat = useRef(null);

  useEffect(() => {
    if (endOfChat.current) {
      endOfChat.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  return (
    <div className="chat-box">
      {chatHistory.map((entry, index) => (
        <div key={index} className="chat-message">
          <strong>{entry.user}:</strong> {entry.message}
        </div>
      ))}
      <div ref={endOfChat} />
    </div>
  );
}

export default ChatWindow;
