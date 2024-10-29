const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());

const downloadFolder = path.join(__dirname, "downloaded_yt_videos");

// Ensure the download folder exists
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
}

// Endpoint to get a list of songs
app.get("/api/songs", (req, res) => {
  try {
    if (!fs.existsSync(downloadFolder)) {
      return res.status(200).json([]);
    }

    const songs = fs
      .readdirSync(downloadFolder)
      .filter(
        (filename) =>
          filename.endsWith(".webm") ||
          filename.endsWith(".mp3") ||
          filename.endsWith(".m4a")
      )
      .map((filename) => {
        return {
          title: filename,
          artist: "Unknown Artist",
          duration: 0, // Metadata extraction would be required to get duration
          filename: filename,
        };
      });

    res.status(200).json(songs);
  } catch (error) {
    console.error(`Error fetching songs: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to play a specific song
app.get("/api/songs/:songTitle/play", (req, res) => {
  try {
    const songTitle = req.params.songTitle;
    const songPath = path.join(downloadFolder, songTitle);

    if (!fs.existsSync(songPath)) {
      return res.status(404).json({ error: "Song not found" });
    }

    res.sendFile(songPath);
  } catch (error) {
    console.error(`Error playing song: ${error.message}`);
    res.status(500).json({ error: `Failed to play song: ${error.message}` });
  }
});

// Endpoint to download a song
app.post("/api/download_song", (req, res) => {
  try {
    console.log("Received request to download song");
    const { query } = req.body;
    if (!query) {
      console.error("Song query is missing");
      return res.status(400).json({ error: "Song query is missing" });
    }

    const scriptPath = path.join(__dirname, "download_songs.py");
    const pythonExecutable = "C:\\Python312\\python.exe"; // Use 'python3' or the full path if needed

    console.log(
      `Executing Python script: ${scriptPath} with query: ${query}`
    );
    const pythonProcess = spawn(pythonExecutable, [
      scriptPath,
      query,
      downloadFolder,
    ]);

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
      console.log(`Stdout: ${data.toString()}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
      console.error(`Stderr: ${data.toString()}`);
    });

    pythonProcess.on("error", (err) => {
      console.error(`Failed to start Python script: ${err.message}`);
      res
        .status(500)
        .json({ error: `Failed to start Python script: ${err.message}` });
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python process closed with code ${code}`);
      if (code === 0) {
        console.log("Python script executed successfully.");
        res.status(200).json({
          message: "Song downloaded successfully",
          output: stdoutData.trim(),
        });
      } else {
        console.error(
          `Python process closed with code ${code}. Stderr: ${stderrData.trim()}`
        );
        res.status(500).json({
          error:
            "Failed to download the song. Check server logs for more details.",
          details: stderrData.trim(),
        });
      }
    });
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    res
      .status(500)
      .json({ error: `Failed to process song request: ${error.message}` });
  }
});

// Socket.IO for real-time notifications
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // Broadcast message to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
