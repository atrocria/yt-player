// src/ChatProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { firestore } from "./firebaseConfig";

interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: firebase.firestore.Timestamp;
}

const ChatContext = createContext<{ messages: Message[] }>({ messages: [] });

export const ChatProvider: React.FC = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Set up Firestore listener for messages
    const unsubscribe = firestore
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(newMessages);
      });

    return unsubscribe; // Cleanup on unmount
  }, []);

  return (
    <ChatContext.Provider value={{ messages }}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
