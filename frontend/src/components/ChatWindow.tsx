import React from "react";
import { FaPaperPlane, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";

const ChatWindow: React.FC = () => {
  interface Message {
    text: string;
    sender: string;
  }

  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isSending, setIsSending] = React.useState(false);

  const handleSendMessage = (message: string) => {
    if (message.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, sender: "Me" },
      ]);
      setMessage("");
      setIsSending(true);
      setTimeout(() => {
        setIsSending(false);
      }, 500); // Animation time for the paper airplane
    }
  };

  return (
    <div className="chat-window">
      <h2 className="self-center text-orange-500 ml-3">Me</h2>
      <img
        src="https://media.tenor.com/wy2zHeWyf2gAAAAe/side-eye-dog-suspicious-look.png"
        alt="Suspicious looking dog"
        className="ml-3 w-60 h-auto rounded-lg"
      />
      <div className="messages-container self-center text-zinc-300 ml-3">
        <p>don't go searching sus shi a</p>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "Me" ? "sent" : "received"}`}
          >
            {(index === 0 || messages[index - 1].sender !== msg.sender) && (
              <span className="sender text-orange-500">{msg.sender} </span>
            )}
            <div>
              {msg.text.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        {messages.length > 0 && (
          <button
            className="delete-all w-5 h-5 bg-slate-500 rounded-full absolute flex items-center justify-center"
            onClick={() => {
              setMessages([]);
            }}
          >
            <span className="text-white">
              <FaTrash style={{ fontSize: "12px" }} />
            </span>
          </button>
        )}
      </div>

      {/* Chat Field (moved to bottom) */}
      <div className="chatting-container px-3 py-2 absolute bottom-0 items-center justify-between w-full bg-[#121212] rounded-full">
        <div className="input-container flex items-center w-full bg-[#202020] p-1 rounded-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(message)}
            placeholder="Type a message..."
            className="flex-grow bg-transparent text-white focus:outline-none placeholder-gray-400 ml-2"
          />
          <button
            className="chat-box-circle w-10 h-10 bg-sky-700 rounded-full ml-4 flex items-center justify-center relative overflow-hidden"
            onClick={() => {
              handleSendMessage(message);
            }}
            disabled={isSending}
          >
            <motion.div
              className="parallax-background absolute inset-0"
              style={{
                backgroundColor: "#1E90FF", // Dark blue sky
                backgroundImage:
                  "radial-gradient(circle at 25% 35%, rgba(255, 255, 255, 0.4) 20%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.3) 25%, transparent 50%), radial-gradient(circle at 55% 55%, rgba(255, 255, 255, 0.5) 15%, transparent 35%)",
                backgroundBlendMode: "screen",
              }}
            />
            <motion.span
              className="relative"
              animate={
                isSending
                  ? { x: [0, 100], y: [0, -100], opacity: [1, 0] }
                  : { x: [-100, 0], y: [100, 0], opacity: [0, 1] }
              }
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <FaPaperPlane style={{ fontSize: "21px" }} />
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
