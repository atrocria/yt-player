import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";

interface SignInProps {
  onClose: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onClose }) => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose(); // Close the popup after successful sign-in
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <div className="signin-popup absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="signin-box p-6 rounded-lg bg-white shadow-lg relative">
        <button
          className="absolute top-0 right-0 mt-2 mr-2 p-1 text-red-600 hover:bg-red-200 rounded-full"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="mb-4 text-center text-2xl font-semibold">Sign In</h2>
        <button
          className="w-full p-2 bg-blue-600 text-white rounded-lg"
          onClick={handleSignIn}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;
