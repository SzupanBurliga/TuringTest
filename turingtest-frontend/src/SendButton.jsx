import React from 'react';

function SendButton({ handleSendMessage }) {
  return (
    <button onClick={handleSendMessage}>Send</button>
  );
}

export default SendButton;