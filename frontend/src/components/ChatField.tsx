import React from "react";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ChatField: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  
  const handleSendMessage = async (message: string) => {
    if (message.trim() !== "") {
      setIsSending(true);
      try {
        await addDoc(collection(db, "messages"), {
          text: message,
          sender: "Me",
          timestamp: Timestamp.now(),
        });
        setMessage(""); // Clear input after sending
      } catch (error) {
        console.error("Error adding message: ", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
  );
};

export default ChatField;
