import React from "react";

function SendButton({ handleSendMessage }) {
  return <button onClick={handleSendMessage}>Wyślij</button>;
}

export default SendButton;
