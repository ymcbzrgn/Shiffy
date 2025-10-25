import { useState } from "react";
import ChatButton from "./ChatButton";
import ChatWindow from "./ChatWindow";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={handleToggle} />
      <ChatWindow isOpen={isOpen} onClose={handleClose} onMinimize={handleMinimize} />
    </>
  );
};

export default ChatBot;
