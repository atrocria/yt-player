import React, { useState, useEffect, memo, useCallback } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  Timestamp,
  deleteDoc,
  doc,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { User } from "firebase/auth";
import debounce from "lodash.debounce";

import { db } from "../firebaseConfig";

interface chatProps {
  user: User | null;
}

const ChatWindow: React.FC<chatProps> = ({ user }) => {
  interface Message {
    text: string;
    sender: User | string;
    timestamp: Timestamp;
    id: string;
  }

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to adjust debounce interval dynamically based on usage
  const getDebounceInterval = useCallback(() => {
    const messageCount = messages.length;
    if (messageCount > 100) return 500; // Increase debounce interval for large message counts
    return 200; // Default debounce interval
  }, [messages.length]);

  // Combined real-time listener for messages
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const debouncedUpdate = debounce((snapshot) => {
      const messagesData = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        text: doc.data().text,
        sender: doc.data().sender,
        timestamp: doc.data().timestamp,
      }));
      setMessages(messagesData);
    }, getDebounceInterval());

    const unsubscribe = onSnapshot(q, (snapshot) => {
      debouncedUpdate(snapshot);
    });
    return () => {
      unsubscribe();
      debouncedUpdate.cancel();
    };
  }, [getDebounceInterval]);

  const handleSendMessage = async (message: string) => {
    if (message.trim() !== "") {
      setIsSending(true);

      const newMessage = {
        text: message,
        sender: user?.displayName || "Anonymous",
        timestamp: Timestamp.now(),
        id: `temp-${new Date().getTime()}`,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      try {
        const docRef = await addDoc(collection(db, "messages"), {
          text: message,
          sender: user?.displayName,
          timestamp: Timestamp.now(),
        });

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newMessage.id ? { ...msg, id: docRef.id } : msg
          )
        );
      } catch (error) {
        console.error("Error adding message: ", error);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== newMessage.id)
        );
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  const areEqual = (
    prevProps: { msg: Message; index: number },
    nextProps: { msg: Message; index: number }
  ) => {
    return (
      prevProps.msg.text === nextProps.msg.text &&
      prevProps.msg.sender === nextProps.msg.sender &&
      prevProps.msg.timestamp.isEqual(nextProps.msg.timestamp) &&
      prevProps.index === nextProps.index
    );
  };

  const MessageComponent = memo(
    ({ msg, index }: { msg: Message; index: number }) => (
      <div
        key={msg.id}
        className={`message ${
          msg.sender === user?.displayName ? "sent" : "received"
        }`}
      >
        {(index === 0 || messages[index - 1].sender !== msg.sender) && (
          <span className="sender text-orange-500">
            {msg.sender.toString()}{" "}
          </span>
        )}
        <div>
          {msg.text.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
        <button
          className="delete-all w-5 h-5 bg-slate-500 rounded-full absolute flex items-center justify-center text-right"
          onClick={() => {
            handleDeleteMessage(msg.id);
          }}
        >
          <span className="text-white">
            <FaTrash style={{ fontSize: "12px" }} />
          </span>
        </button>
      </div>
    ),
    areEqual
  );

  const debouncedHandleSendMessage = debounce((message: string) => {
    handleSendMessage(message);
  }, 300);

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
          <MessageComponent key={msg.id} msg={msg} index={index} />
        ))}
      </div>

      {/* Chat Field */}
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
              debouncedHandleSendMessage(message);
            }}
            disabled={isSending}
          >
            <motion.div
              className="parallax-background absolute inset-0"
              style={{
                backgroundColor: "#1E90FF",
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
