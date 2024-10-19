// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import ChatWindow from "./components/ChatWindow";
// import MusicPanel from "./components/MusicPanel";
// import FriendsList from "./components/FriendsList";
import "./App.css";

import Header from "./sections/Header"; // temporary

const App: React.FC = () => {
  // const [activeTab, setActiveTab] = useState("chat");

  return (
    <Header/>

    // <Router>
    //   <div className="app flex flex-col">
    //     <div className="header w-full h-16 flex justify-center items-center bg-gray-800 shadow-md">
    //       <div className="flex space-x-8">
    //         <button
    //           className={`header-item ${
    //             activeTab === "chat" ? "bg-purple-600" : "bg-gray-700"
    //           } text-white rounded-full px-6 py-2 font-semibold hover:bg-purple-700 transition`}
    //           onClick={() => setActiveTab("chat")}
    //         >
    //           Chat
    //         </button>
    //         <button
    //           className={`header-item ${
    //             activeTab === "vc" ? "bg-purple-600" : "bg-gray-700"
    //           } text-white rounded-full px-6 py-2 font-semibold hover:bg-purple-700 transition`}
    //           onClick={() => setActiveTab("vc")}
    //         >
    //           VC
    //         </button>
    //         <button
    //           className={`header-item ${
    //             activeTab === "music" ? "bg-purple-600" : "bg-gray-700"
    //           } text-white rounded-full px-6 py-2 font-semibold hover:bg-purple-700 transition`}
    //           onClick={() => setActiveTab("music")}
    //         >
    //           Music
    //         </button>
    //       </div>
    //     </div>

    //     <div className="app-content flex-grow flex">
    //       <div
    //         className={`main-content-container flex-grow flex transition-all duration-300 ${
    //           activeTab === "music" ? "ml-0" : ""
    //         }`}
    //       >
    //         <div className="chat-window-container flex-grow">
    //           <Routes>
    //             <Route
    //               path="/channels/:serverId/:channelId"
    //               element={<ChatWindow />}
    //             />
    //             <Route path="/friends" element={<FriendsList />} />
    //           </Routes>
    //         </div>

    //         {activeTab === "music" && (
    //           <div className="music-panel-container w-1/3 p-4 fixed right-0 top-16 h-[calc(100vh-4rem)] shadow-lg bg-gray-800">
    //             <MusicPanel />
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </Router>
  );
};

export default App;

// python main.py > uv run main.py
// pip install flask > uv add flask
