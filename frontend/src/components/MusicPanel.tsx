// ./components/MusicPanel.tsx
import { useState, useEffect } from "react";
import axios from "axios";

interface Song {
  id: string;
  title: string;
  playCount: number;
}

function MusicPanel({ isPlaying }: { isPlaying: boolean }) {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
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

    fetchSongs();
  }, []);

  const handlePlaySong = async (songId: string) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/songs/${songId}/play`
      );
      if (response.status === 200) {
        setSongs((prevSongs) =>
          prevSongs.map((song) =>
            song.id === songId
              ? { ...song, playCount: song.playCount + 1 }
              : song
          )
        );
      } else {
        console.error("Failed to update play count: ", response.status);
      }
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  return (
    <div
      className={`music-panel p-4 bg-gray-800 text-white ${
        isPlaying ? "playing" : "paused"
      }`}
    >
      <h2 className="text-lg font-semibold mb-4">
        Music Panel {isPlaying ? "(Playing)" : "(Paused)"}
      </h2>
      <ul className="space-y-3">
        {songs.map((song) => (
          <li
            key={song.id}
            className="song-item flex justify-between items-center p-2 bg-gray-700 rounded"
          >
            <span>
              {song.title} - Played {song.playCount} times
            </span>
            <button
              className="bg-purple-600 px-4 py-2 rounded text-white font-semibold hover:bg-purple-700 transition"
              onClick={() => handlePlaySong(song.id)}
            >
              Play
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MusicPanel;
