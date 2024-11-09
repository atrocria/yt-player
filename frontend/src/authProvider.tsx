// src/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import firebase from "firebase/compat/app";

const AuthContext = createContext<{ user: firebase.User | null }>({
  user: null,
});

export const AuthProvider: React.FC = ( children ) => {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe; // Cleanup on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
