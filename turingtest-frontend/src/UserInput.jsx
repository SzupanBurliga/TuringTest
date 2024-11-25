import React from 'react';

function UserInput({ message, handleInputChange }) {
  return (
    <input
      type="text"
      value={message}
      onChange={handleInputChange}
      placeholder="Napisz wiadomość"
    />
  );
}

export default UserInput;