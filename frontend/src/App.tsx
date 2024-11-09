import { useAuthState } from "react-firebase-hooks/auth";  // Optional library for hooks
import { auth } from "./firebaseConfig"; // Adjust the path based on your component location

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSync } from "react-icons/fa";
import ChatWindow from "./components/ChatWindow";
import MusicPanel from "./components/MusicPanel";
import SignIn from "./components/SignIn";
// import FriendsList from "./components/FriendsList";
import VC from "./components/VC";
import "./App.css";

// Define the Song interface (matching the one used in MusicPanel)
interface Song {
  title: string;
  artist: string;
  duration: number;
  filename: string;
}

const App: React.FC = () => {
  const [user, loading, error] = useAuthState(auth); // Get the current authenticated user

  const [isChatWindowActive, setActive_ChatWindow] = useState<boolean>(true); // is chat window active? Default to true
  const [isMusicPanelActive, setActive_MusicPanel] = useState<boolean>(false); // is music panel active? Default to false
  const [isVCActive, setActive_VC] = useState<boolean>(false); // is vc active? Default to false
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // is music playing? default to false
  const [currentSong, setCurrentSong] = useState<Song | null>(null); // what is the current song of type: interface(song)? default to null
  const [isLooping, setIsLooping] = useState<boolean>(false); // is repeat active? default to false
  const [isSignInPopupVisible, setIsSignInPopupVisible] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null); // reference to audio element, default to null
  const location = useLocation(); // read url
  const navigate = useNavigate(); // write and navigate to url

  // Function to parse URL parameters
  // Function to parse URL parameters
  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const chatParam = params.get("Chat");
    const musicPanelParam = params.get("MusicPanel");
    const repeatParam = params.get("repeat") || params.get("loop");

    if (chatParam === "true") {
      setActive_ChatWindow(true);
    }

    if (musicPanelParam === "true") {
      setActive_MusicPanel(true);
    }

    if (repeatParam === "true") {
      setIsLooping(true);
      if (audioRef.current) {
        audioRef.current.loop = true;
      }
    }
  }, [
    location,
    setActive_ChatWindow,
    setActive_MusicPanel,
    setIsLooping,
    audioRef,
  ]);

  
  // Effect to handle URL parameters
  useEffect(() => {
    if(user){
      parseUrlParams();
    }
  }, [parseUrlParams, user]);

  // Effect to handle user navigation
  useEffect(() => {
    if (user && !location.pathname.includes("/channels/@me")) {
      navigate("/channels/@me", { replace: true });
    }
  }, [user, location, navigate]);

  //auth
  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <button
            className="p-4 bg-blue-500 text-white rounded-lg"
            onClick={() => setIsSignInPopupVisible(true)}
          >
            Sign In
          </button>
        </div>
        {isSignInPopupVisible && (
          <SignIn onClose={() => setIsSignInPopupVisible(false)} />
        )}
      </>
    );
  }
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.message}.</p>;
  }

  // Function to display music panel status
  const renderPanelStatus = () => {
    if (isMusicPanelActive === true && currentSong) {
      return (
        <div className="music-panel-status text-xs text-[#F8F8FF] absolute top-0 left-1">
          {isPlaying ? "Music Panel (Playing...)" : "Music Panel (Paused)"}
          {isLooping ? (
            <FaSync className="inline ml-1 text-blue-300" />
          ) : (
            <FaSync className="inline ml-1 text-gray-500" />
          )}
        </div>
      );
    }
    return null;
  };

  // Function to handle tab click and toggle active status
  const handleTabClick = (tab: string) => {
    let newIsChatWindowActive = isChatWindowActive;
    let newIsVCActive = isVCActive;
    let newIsMusicPanelActive = isMusicPanelActive;

    if (tab === "chat") {
      newIsChatWindowActive = !isChatWindowActive;
    } else if (tab === "vc") {
      newIsVCActive = !isVCActive;
    } else if (tab === "music") {
      newIsMusicPanelActive = !isMusicPanelActive;
    }

    setActive_ChatWindow(newIsChatWindowActive);
    setActive_VC(newIsVCActive);
    setActive_MusicPanel(newIsMusicPanelActive);

    const queryParams = new URLSearchParams();
    if (newIsChatWindowActive) queryParams.append("chat", "true");
    if (newIsVCActive) queryParams.append("VC", "true");
    if (newIsMusicPanelActive) queryParams.append("MusicPanel", "true");

    navigate({ search: `?${queryParams.toString()}` });
  };

  // Function to toggle repeat status
  const handleRepeatToggle = () => {
    const newIsRepeat = !isLooping;
    setIsLooping(newIsRepeat);
    if (audioRef.current) {
      audioRef.current.loop = newIsRepeat;
    }
    const params = new URLSearchParams(location.search);
    if (newIsRepeat) {
      params.set("repeat", "true");
    } else {
      params.delete("repeat");
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className="app flex flex-col bg-[#121212] min-h-screen overflow-hidden">
      {/* Header Section */}
      <header className="w-full h-[8.3vh] flex justify-center items-center bg-[#202020] shadow-lg">
        <nav className="flex space-x-8">
          {["chat", "vc", "music"].map((tab) => (
            <div
              key={tab}
              className={`relative w-[8.5vh] h-[8.5vh] rounded-full p-[2px] ${
                (tab === "chat" && isChatWindowActive) ||
                (tab === "vc" && isVCActive) ||
                (tab === "music" && isMusicPanelActive)
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 glow-effect hover:scale-105 transition-all duration-300 ease-in-out"
                  : ""
              }`}
            >
              <button
                className={`header-item ${
                  (tab === "chat" && isChatWindowActive) ||
                  (tab === "vc" && isVCActive) ||
                  (tab === "music" && isMusicPanelActive)
                    ? "bg-[#2a2b2d] text-white"
                    : "bg-[#2a2b2d] border border-gray-500 hover:bg-gray-600 hover:border-gray-400 text-gray-300"
                } w-full h-full rounded-full font-semibold hover:text-white transition-all duration-300 ease-in-out flex items-center justify-center`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            </div>
          ))}
        </nav>
      </header>

      {/* Music Panel Indicator */}
      {renderPanelStatus()}

      {/* App Content Section */}
      <main className="flex-grow flex overflow-hidden h-[calc(100vh - 10rem)]">
        {/* Main Content and Music Panel Container */}
        <div className="flex flex-grow gap-4 h-full">
          {/* Wrapper for Chat and Music Panels */}
          <div
            className={
              "flex flex-row mt-1 mr-2 transition-all duration-300 flex-grow h-full"
            }
          >
            {/* Chat Window Wrapper */}
            {isChatWindowActive && (
              <div className="chat-wrapper-container flex flex-col flex-1 h-full overflow-hidden">
                {/* Chat Window Container */}
                <div className="chat-window-container flex-1 overflow-y-auto custom-scrollbar mb-2">
                  <ChatWindow
                    user={user}
                  />
                </div>
              </div>
            )}

            {/* Music Panel */}
            {isMusicPanelActive ? (
              <aside className="music-panel-container w-full h-[90vh] ml-2 flex flex-col flex-[2] p-4 bg-[#242424] rounded-2xl shadow-lg">
                {/* Flexible container with stacked components */}
                <div className="w-full mb-4">
                  <MusicPanel
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    audioRef={audioRef}
                    currentSong={currentSong}
                    setCurrentSong={setCurrentSong}
                    isLooping={isLooping}
                    setIsLooping={setIsLooping}
                    onRepeatToggle={handleRepeatToggle}
                  />
                </div>
                {isVCActive && (
                  <div className="mt-1 mb-1 w-full">
                    <hr className="w-[95%] mx-auto mt-7 content-center border-t border-gray-600" />
                    <div className="w-full">
                      <VC />
                    </div>
                  </div>
                )}
              </aside>
            ) : (
              // If Music Panel is not active, VC takes up the full space
              isVCActive && (
                <aside className="music-panel-container w-full h-[90vh] ml-2 flex flex-1 p-4 bg-[#242424] rounded-2xl shadow-lg">
                  <div className="w-full">
                    <VC />
                  </div>
                </aside>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
