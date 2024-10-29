import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaChevronRight,
  FaChevronDown,
  FaPlay,
  FaPause,
  FaSync,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";

// use api from where?
const API_BASE_URL = "http://localhost:5000";
// const API_BASE_URL = "https://1h13wmxr-5000.asse.devtunnels.ms";

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
  isLooping: boolean;
  setIsLooping: React.Dispatch<React.SetStateAction<boolean>>;
  onRepeatToggle: () => void;
}

const MusicPanel: React.FC<MusicPanelProps> = ({
  isPlaying,
  setIsPlaying,
  audioRef,
  currentSong,
  setCurrentSong,
  isLooping,
  setIsLooping,
  onRepeatToggle,
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [expandedSong, setExpandedSong] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const location = useLocation();

  // Parse URL parameters
  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const repeatParam = params.get("repeat");

    if (repeatParam === "true") {
      setIsLooping(true);
    }
  }, [location, setIsLooping]);

  useEffect(() => {
    parseUrlParams();
  }, [parseUrlParams]);

  // Fetch songs only on initial mount
  useEffect(() => {
    fetchSongs();
  }, []);

  // Example: Avoid multiple load attempts
  useEffect(() => {
    if (currentSong && audioRef.current) {
      if (
        audioRef.current.src !==
        `${API_BASE_URL}/api/songs/${encodeURIComponent(
          currentSong.filename
        )}/play`
      ) {
        audioRef.current.src = `${API_BASE_URL}/api/songs/${encodeURIComponent(
          currentSong.filename
        )}/play`;
        audioRef.current.load();
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSong, audioRef, setIsPlaying]);

  const fetchSongs = async () => {
    try {
      const response = await axios.get<Song[]>(`${API_BASE_URL}/api/songs`);
      console.log("Response data:", response.data);
      console.log("Attempting to fetch from:", `${API_BASE_URL}/api/songs`);

      if (response.status === 200 && Array.isArray(response.data)) {
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
      audioRef.current.src = `${API_BASE_URL}/api/songs/${encodeURIComponent(
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
    onRepeatToggle();
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
      const response = await axios.post(`${API_BASE_URL}/api/download_song`, {
        query: searchQuery,
      });

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
    <>
      <div className="music-panel w-[60%] flex-col overflow-x-hidden h-[calc(100vh-5.5rem)] custom-scrollbar">
        {/* Search Bar */}
        <div className="search-bar mb-6 w-full relative rounded-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search songs..."
            className="w-full p-2 rounded-full bg-gray-800 text-[#F8F8FF] focus:outline-none pr-10"
          />
          <button
            onClick={toggleLoop}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#F8F8FF]"
          >
            <FaSync
              className={`${isLooping ? "text-blue-500" : ""} ${
                isDownloading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {/* Audio Player */}
        <div className="audio-player w-full center">
          <audio
            className="w-full"
            controls
            ref={audioRef}
            preload="auto"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            src={
              currentSong
                ? `${API_BASE_URL}/api/songs/${encodeURIComponent(
                    currentSong.filename
                  )}/play`
                : ""
            }
          >
            Your browser does not support the audio element.
          </audio>
          {currentSong && (
            <h3 className="text-xl font-semibold mt-3 mb-3 text-white">
              Now Playing: {currentSong.title}
            </h3>
          )}
        </div>
      </div>

      {/* Song List */}
      <div className="song-list w-[40%] ml-2 h-[80%]">
        <h3 className="text-xl font-semibold mb-3 text-white">Saved Songs</h3>
        <ul className="list-none h-[50%] overflow-y-auto overflow-x-hidden custom-scrollbar ml-1 mr-1">
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
              <button onClick={() => handlePlaySong(song)} className="ml-5">
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
    </>
  );
};

export default MusicPanel;
