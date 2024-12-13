import React from "react";

function UserInput({ message, handleInputChange, handleKeyPress }) {
  return (
    <input
      type="text"
      value={message}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
      placeholder="Napisz wiadomość..."
    />
  );
}

export default UserInput;
