import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatWindow from "./components/ChatWindow";
import MusicPanel from "./components/MusicPanel";
import FriendsList from "./components/FriendsList";
import "./App.css";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const renderPanelStatus = () => {
    if (activeTab === "music") {
      return (
        <div className="music-panel-status text-xs text-white absolute top-1 right-0">
          Music Panel (Playing)
        </div>
      );
    }
    return null;
  };

  return (
    <Router>
      <div className="app flex flex-col bg-[#1b1b1b] h-screen overflow-hidden">
        {/* Header Section */}
        <header className="w-full h-16 flex justify-center items-center bg-[#111] shadow-lg">
          <nav className="flex space-x-8">
            {["chat", "vc", "music"].map((tab) => (
              <button
                key={tab}
                className={`header-item ${
                  activeTab === tab
                    ? "bg-[#BB86FC]"
                    : "bg-[#1b1b1b] border-2 border-[#BB86FC]"
                } text-white w-12 h-12 rounded-full font-semibold hover:bg-[#BB86FC] transition-all flex items-center justify-center`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase()}
              </button>
            ))}
          </nav>
        </header>

        {/* Music Panel Indicator */}
        {renderPanelStatus()}

        {/* App Content Section */}
        <main className="app-content flex-grow flex relative overflow-hidden">
          {/* Main Content and Music Panel Container */}
          <div className="flex flex-grow">
            {/* Main Content Container */}
            <div
              className={`main-content-container flex flex-col transition-all duration-300 ${
                activeTab === "music" ? "w-[70%]" : "w-full"
              }`}
            >
              {/* Chat and Friends Routes */}
              <div className="chat-window-container flex-grow">
                <Routes>
                  <Route
                    path="/channels/:serverId/:channelId"
                    element={<ChatWindow />}
                  />
                  <Route path="/friends" element={<FriendsList />} />
                </Routes>
              </div>

              {/* Chat Field */}
              <div
                className="chat-field-container px-4 py-2 flex items-center justify-between w-full"
                style={{
                  position: "relative",
                  bottom: "1rem",
                }}
              >
                <div className="input-container flex items-center w-full bg-[#2a2a2a] p-4 rounded-full">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-grow bg-transparent text-white focus:outline-none placeholder-gray-400"
                  />
                  <button className="chat-box-circle w-10 h-10 bg-[#BB86FC] rounded-full ml-4 flex items-center justify-center">
                    <span className="text-white">Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Music Panel */}
            {activeTab === "music" && (
              <aside
                className="music-panel-container w-[30%] p-4 h-[calc(100vh-4rem)] shadow-2xl bg-[#1e1e2e] rounded-3xl transition-all duration-300 flex flex-col items-center overflow-hidden"
                style={{
                  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  margin: "1rem",
                }}
              >
                <MusicPanel isPlaying={activeTab === "music"} />
              </aside>
            )}
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
