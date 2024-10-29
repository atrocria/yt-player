from flask import Flask, jsonify, request, send_file, safe_join
import os
from flask_cors import CORS
from download_songs import download_song as yt_download_song
import sys
from mutagen.easyid3 import EasyID3
from mutagen.mp3 import MP3
import logging
import locale
import io

app = Flask(__name__)
CORS(app)

# Set environment variable to force UTF-8 encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Set default locale to utf-8
locale.setlocale(locale.LC_ALL, 'C.UTF-8')

# Configure logging to write to a UTF-8 encoded log file
log_file_path = os.path.join(os.getcwd(), "app.log")
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path, encoding='utf-8'),
        logging.StreamHandler(io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8'))
    ]
)

def safe_unicode(string):
    try:
        if isinstance(string, bytes):
            return string.decode('utf-8')
        return str(string)
    except (UnicodeEncodeError, UnicodeDecodeError) as e:
        logging.error(f"Error handling string: {string}, {e}")
        return "Encoding Error"

@app.route('/api/songs', methods=['GET'])
def get_songs():
    try:
        download_folder = os.path.join(os.getcwd(), "downloaded_yt_videos")
        if not os.path.exists(download_folder):
            return jsonify([]), 200

        songs = []
        for filename in os.listdir(download_folder):
            if filename.endswith(('.webm', '.mp3', '.m4a')):
                song_path = os.path.join(download_folder, filename)
                title = filename
                artist = "Unknown Artist"
                duration = 0

                # Attempt to extract metadata if it's an mp3 file
                if filename.endswith('.mp3'):
                    try:
                        audio = MP3(song_path, ID3=EasyID3)
                        title = audio.get('title', [filename])[0]
                        artist = audio.get('artist', ['Unknown Artist'])[0]
                        duration = int(audio.info.length)
                    except Exception as e:
                        logging.error(f"Error extracting metadata: {e}")

                songs.append({
                    "title": safe_unicode(title),
                    "artist": safe_unicode(artist),
                    "duration": duration,
                    "filename": safe_unicode(filename)
                })
        
        return jsonify(songs), 200
    except Exception as e:
        logging.error(f"Error retrieving songs: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/songs/<song_title>/play', methods=['GET'])
def play_song(song_title):
    try:
        download_folder = os.path.join(os.getcwd(), "downloaded_yt_videos")
        song_path = safe_join(download_folder, song_title)

        if not os.path.exists(song_path):
            return jsonify({"error": "Song not found"}), 404
        
        return send_file(song_path, as_attachment=False)
    except Exception as e:
        logging.error(f"Failed to play song: {e}")
        return jsonify({"error": f"Failed to play song: {str(e)}"}), 500

@app.route('/api/download_song', methods=['POST'])
def download_song():
    try:
        data = request.json
        if not data or 'query' not in data:
            logging.error("Song query is missing in the request")
            return jsonify({"error": "Song query is missing"}), 400
        
        song_query = data['query']
        logging.debug(f"Received download request for query: {song_query}")
        
        download_folder = os.path.join(os.getcwd(), "downloaded_yt_videos")
        if not os.path.exists(download_folder):
            os.makedirs(download_folder)
        
        title = yt_download_song(song_query, download_folder)
        if not title:
            logging.error("Failed to download the song.")
            return jsonify({"error": "Failed to download the song."}), 500
        
        logging.info(f"Successfully downloaded song: {title}")
        return jsonify({"message": "Song downloaded successfully", "title": safe_unicode(title)}), 200
    
    except UnicodeEncodeError as ue:
        logging.error(f"Unicode encoding error: {ue}")
        return jsonify({"error": "Failed to encode song metadata due to unsupported characters."}), 500
    except Exception as e:
        logging.error(f"General error occurred: {e}")
        return jsonify({"error": f"Failed to process song request: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True, use_reloader=False)
