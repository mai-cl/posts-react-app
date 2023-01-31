import React from "react";

const FlashMessages = ({ messages }) => {
  return (
    <div className="floating-alerts">
      {messages.map((msg, index) => (
        <div
          className="alert alert-success text-center floating-alert shadow-sm"
          key={index}
        >
          {msg}
        </div>
      ))}
    </div>
  );
};

export default FlashMessages;
