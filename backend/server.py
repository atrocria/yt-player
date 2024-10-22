from flask import Flask, jsonify, request, send_file
import os
from flask_cors import CORS
from download_songs import download_song as yt_download_song
import sys
from mutagen.easyid3 import EasyID3
from mutagen.mp3 import MP3

app = Flask(__name__)
CORS(app)

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

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
                    except Exception:
                        pass

                songs.append({
                    "title": title,
                    "artist": artist,
                    "duration": duration,
                    "filename": filename
                })
        
        return jsonify(songs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/songs/<song_title>/play', methods=['GET'])
def play_song(song_title):
    try:
        download_folder = os.path.join(os.getcwd(), "downloaded_yt_videos")
        song_path = os.path.join(download_folder, song_title)

        if not os.path.exists(song_path):
            return jsonify({"error": "Song not found"}), 404
        
        return send_file(song_path, as_attachment=False)
    except Exception as e:
        return jsonify({"error": f"Failed to play song: {str(e)}"}), 500

@app.route('/api/download_song', methods=['POST'])
def download_song():
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({"error": "Song query is missing"}), 400
        
        song_query = data['query']
        download_folder = os.path.join(os.getcwd(), "downloaded_yt_videos")
        if not os.path.exists(download_folder):
            os.makedirs(download_folder)
        
        title = yt_download_song(song_query, download_folder)
        if not title:
            return jsonify({"error": "Failed to download the song."}), 500
        
        return jsonify({"message": "Song downloaded successfully", "title": title}), 200
    
    except UnicodeEncodeError:
        return jsonify({"error": "Failed to encode song metadata due to unsupported characters."}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to process song request: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
