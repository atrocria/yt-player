import React, { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatWindow from "./components/ChatWindow";
import MusicPanel from "./components/MusicPanel";
import FriendsList from "./components/FriendsList";
import "./App.css";

// Define the Song interface (should match the one used in MusicPanel)
interface Song {
  title: string;
  artist: string;
  duration: number;
  filename: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Function to display music panel status
  const renderPanelStatus = () => {
    if (activeTab === "music" && currentSong) {
      return (
        <div className="music-panel-status text-xs text-white absolute top-0 left-1">
          {isPlaying ? "Music Panel (Playing...)" : "Music Panel (Paused)"}
        </div>
      );
    }
    return null;
  };

  return (
    <Router>
      <div className="app flex flex-col bg-[#121212] min-h-screen overflow-hidden">
        {/* Header Section */}
        <header className="w-full h-15 flex justify-center items-center bg-[#202020] shadow-lg">
          <nav className="flex space-x-8">
            {["chat", "vc", "music"].map((tab) => (
              <button
                key={tab}
                className={`header-item ${
                  activeTab === tab
                    ? "bg-[#BB86FC] border-2 border-white"
                    : "bg-[#202020] border-2 border-[#BB86FC]"
                } text-white w-11 h-11 rounded-full font-semibold hover:bg-[#BB86FC] transition-all flex items-center justify-center`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
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
                "flex flex-row mt-2  mr-2 transition-all duration-300 flex-grow h-full"
              }
            >
              {/* Chat Window Wrapper */}
              <div className="chat-wrapper-container flex flex-col flex-1 h-full overflow-hidden">
                {/* Chat Window Container */}
                <div className="chat-window-container flex-1 overflow-y-auto custom-scrollbar mb-2">
                  <Routes>
                    <Route
                      path="/channels/:serverId/:channelId"
                      element={<ChatWindow />}
                    />
                    <Route path="/friends" element={<FriendsList />} />
                  </Routes>
                </div>

                {/* Chat Field (moved to bottom) */}
                <div className="chat-field-container px-3 py-2 flex items-center justify-between w-full mt-auto bg-[#121212] rounded-full">
                  <div className="input-container flex items-center w-full bg-[#202020] p-1 rounded-full">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-grow bg-transparent text-white focus:outline-none placeholder-gray-400 rounded-full"
                    />
                    <button className="chat-box-circle w-10 h-10 bg-black rounded-full ml-4 flex items-center justify-center">
                      <span className="text-white">Go</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Music Panel */}
              {activeTab === "music" && (
                <aside className="music-panel-container h-[90vh] flex flex-1 p-4 bg-[#202020] rounded-2xl shadow-lg overflow-hidden">
                    <MusicPanel
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      audioRef={audioRef}
                      currentSong={currentSong}
                      setCurrentSong={setCurrentSong}
                    />
                </aside>
              )}
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
