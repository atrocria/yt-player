// ... (other imports)
import React, { useState, useEffect } from "react";
import axios from "axios";

// Define the `Song` interface
interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number; // you can add more properties as per your requirements
}

// Define the props for MusicPanel
interface MusicPanelProps {
  isPlaying: boolean;
}

const MusicPanel: React.FC<MusicPanelProps> = ({ isPlaying }) => {
  // State for managing song requests, downloads, and song list
  const [songRequest, setSongRequest] = useState<string>(""); // New state for song request
  const [isDownloading, setIsDownloading] = useState<boolean>(false); // State to indicate downloading
  const [songs, setSongs] = useState<Song[]>([]); // Define the state to hold the songs

  // useEffect to fetch songs when the component mounts
  useEffect(() => {
    fetchSongs();
  }, []);

  // Handle input changes for song request
  const handleSongRequestChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSongRequest(event.target.value);
  };

  // Handle song request submission
  const handleSongRequestSubmit = async () => {
    if (songRequest.trim() === "") return;
    setIsDownloading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/download_song",
        {
          query: songRequest,
        }
      );
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

  // Fetch songs from the server
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
      {/* isPlaying state display */}
      <div className="is-playing-indicator mt-4">
        {isPlaying ? (
          <p className="text-green-400 font-bold">
            Does not work, don't even try. Look at frontend if you're daring enough...
          </p>
        ) : (
          <p className="text-red-400 font-bold">Music is paused.</p>
        )}
      </div>

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
              isDownloading
                ? "bg-gray-600"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold transition`}
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="song-list w-full mt-4 px-4">
        <h3 className="text-lg font-semibold mb-2">Available Songs</h3>
        <ul className="list-disc list-inside">
          {songs.map((song) => (
            <li key={song.id}>
              {song.title} by {song.artist} - {song.duration} seconds
            </li>
          ))}
        </ul>
      </div>

      {/* ... (existing components) */}
    </div>
  );
};

export default MusicPanel;
