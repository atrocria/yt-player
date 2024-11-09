import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyD_i5bXBYeJVkGxEGCQ--NUD7PFnB9TyKs",
  authDomain: "music-chat-p.firebaseapp.com",
  projectId: "music-chat-p",
  storageBucket: "music-chat-p.firebasestorage.app",
  messagingSenderId: "1056139190244",
  appId: "1:1056139190244:web:71feff08a4e66f098371f1",
  measurementId: "G-9KH1DS9N4E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// const analytics = getAnalytics(app);
export { auth, db };