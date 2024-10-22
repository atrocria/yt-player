import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaChevronRight,
  FaChevronDown,
  FaPlay,
  FaPause,
  FaSync, // Replace FaSync with FaSync or another similar icon
} from "react-icons/fa";

interface Song {
  title: string;
  artist: string;
  duration: number;
  filename: string;
}

interface MusicPanelProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentSong: Song | null;
  setCurrentSong: React.Dispatch<React.SetStateAction<Song | null>>;
}

const MusicPanel: React.FC<MusicPanelProps> = ({
  isPlaying,
  setIsPlaying,
  audioRef,
  currentSong,
  setCurrentSong,
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [expandedSong, setExpandedSong] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false); // New state to manage download animation

  // Fetch songs only on initial mount
  useEffect(() => {
    fetchSongs();
  }, []);

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

  const handlePlaySong = (song: Song) => {
    if (currentSong?.filename !== song.filename) {
      setCurrentSong(song);
      setIsPlaying(true);
    } else {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
          setIsPlaying(true);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        console.error("Audio element reference is null");
      }
    }
  };

  const toggleExpandSong = (index: number) => {
    setExpandedSong(expandedSong === index ? null : index);
  };

  // Watch for changes in currentSong and play the audio
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = `http://localhost:5000/api/songs/${encodeURIComponent(
        currentSong.filename
      )}/play`;
      audioRef.current.load();
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    }
  }, [currentSong, audioRef, setIsPlaying]);

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;

    setIsDownloading(true); // Start the animation

    try {
      const response = await axios.post(
        "http://localhost:5000/api/download_song",
        {
          query: searchQuery,
        }
      );

      if (response.status === 200) {
        // Song downloaded successfully, refresh song list
        fetchSongs();
        setSearchQuery(""); // Clear search input
      } else {
        console.error("Failed to download song:", response.data.error);
      }
    } catch (error) {
      console.error("Error downloading song:", error);
    } finally {
      setIsDownloading(false); // Stop the animation once the download is complete
    }
  };

  // Set loop attribute on audio element when isLooping changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping, audioRef]);

  return (
    <div className="music-panel w-full flex flex-col flex-1 overflow-x-hidden h-[calc(100vh-5.5rem)] custom-scrollbar">
      {/* Search Bar */}
      <div className="search-bar mb-6 w-full relative rounded-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search songs..."
          className="w-full p-2 rounded-full bg-gray-800 text-white focus:outline-none pr-10"
        />
        <button
          onClick={toggleLoop}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
        >
          <FaSync
            className={`${isLooping ? "text-blue-500" : ""} ${
              isDownloading ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Audio Player */}
      <div className="audio-player mb-6 w-full">
        {currentSong && (
          <h3 className="text-xl font-semibold mb-3 text-white">
            Now Playing: {currentSong.title}
          </h3>
        )}
        <audio
          controls
          ref={audioRef}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          src={
            currentSong
              ? `http://localhost:5000/api/songs/${encodeURIComponent(
                  currentSong.filename
                )}/play`
              : ""
          }
        >
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Song List */}
      <div className="song-list mb-6 w-full flex-1 h-full">
        <h3 className="text-xl font-semibold mb-3 text-white">
          Saved Songs
        </h3>
        <ul className="list-none w-full overflow-y-auto h-full custom-scrollbar ml-1 mr-1">
          {filteredSongs.map((song, index) => (
            <li
              key={index}
              className="flex items-center p-3 rounded-xl mb-1 bg-gray-700 hover:bg-gray-600 transition cursor-pointer w-full"
            >
              <div onClick={() => toggleExpandSong(index)} className="mr-4">
                {expandedSong === index ? (
                  <FaChevronDown className="text-white" />
                ) : (
                  <FaChevronRight className="text-white" />
                )}
              </div>
              <div className="flex-grow" onClick={() => handlePlaySong(song)}>
                {expandedSong === index
                  ? `${song.title} by ${song.artist} - ${song.duration} seconds`
                  : `${song.title.substring(0, 20)}${
                      song.title.length > 20 ? "..." : ""
                    }`}
              </div>
              <button onClick={() => handlePlaySong(song)} className="ml-4">
                {currentSong?.filename === song.filename && isPlaying ? (
                  <FaPause className="text-white" />
                ) : (
                  <FaPlay className="text-white" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MusicPanel;
