import React from 'react';

function UserInput({ message, handleInputChange }) {
  return (
    <input
      type="text"
      value={message}
      onChange={handleInputChange}
      placeholder="Type a message"
    />
  );
}

export default UserInput;