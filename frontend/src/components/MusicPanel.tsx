// ... (other imports)
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const MusicPanel: React.FC = () => {
  // ... (existing state and refs)
  const [songRequest, setSongRequest] = useState<string>(""); // New state for song request
  const [isDownloading, setIsDownloading] = useState<boolean>(false); // State to indicate downloading

  // ... (existing useEffect and functions)

  const handleSongRequestChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSongRequest(event.target.value);
  };

  const handleSongRequestSubmit = async () => {
    if (songRequest.trim() === "") return;
    setIsDownloading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/download_song", {
        query: songRequest,
      });
      if (response.status === 200) {
        // Song downloaded successfully, refresh the songs list
        fetchSongs();
        setSongRequest(""); // Clear the input
      } else {
        console.error("Failed to download song: ", response.status);
      }
    } catch (error) {
      console.error("Error downloading song:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await axios.get<Song[]>(
        "http://localhost:5000/api/songs"
      );
      if (response.status === 200 && response.data) {
        setSongs(response.data);
      } else {
        console.error("Failed to fetch songs: ", response.status);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };


  return (
    <div className="music-panel w-full h-full flex flex-col items-center justify-start text-white">
      {/* ... (existing components) */}

      {/* Song Request Input */}
      <div className="song-request w-full mt-4 px-4">
        <h3 className="text-lg font-semibold mb-2">Request a Song</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={songRequest}
            onChange={handleSongRequestChange}
            placeholder="Enter song name or URL"
            className="flex-grow p-2 rounded bg-gray-800 text-white"
          />
          <button
            onClick={handleSongRequestSubmit}
            disabled={isDownloading}
            className={`px-4 py-2 rounded ${
              isDownloading ? "bg-gray-600" : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold transition`}
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      {/* ... (existing components) */}
    </div>
  );
};

export default MusicPanel;
