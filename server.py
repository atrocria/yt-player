from flask import Flask, request, jsonify, send_from_directory, render_template
import os
from download_songs import download_song

app = Flask(__name__)

# Set download path
download_path = os.path.join(os.getcwd(), "downloaded-yt-videos")
latest_audio_file = None
keep_song = False # future feature, keep song permanently

# Create the folder if it doesn't exist
if not os.path.exists(download_path):
    os.makedirs(download_path)

# only work on example.com/
@app.route('/')
def index():
    return render_template('index.html')

# only work on example.com/download
@app.route('/download', methods=['POST'])
def download():
    global latest_audio_file
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        latest_audio_file = download_song(url, download_path, keep_song)
        if not latest_audio_file:
            return jsonify({'error': 'Failed to download audio'}), 500
    except Exception as e:
        return jsonify({'error': f'Failed to download audio: {str(e)}'}), 500

    return jsonify({'status': 'Download completed', 'filename': latest_audio_file}), 200

# Endpoint to get the latest downloaded audio URL
@app.route('/get-latest-audio', methods=['GET'])
def get_latest_audio():
    if latest_audio_file:
        return jsonify({'audioUrl': f'/audio/{latest_audio_file}'}), 200
    else:
        return jsonify({'error': 'No audio file available'}), 404

@app.route('/audio/<filename>')
def serve_audio(filename):
    file_path = os.path.join(download_path, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_from_directory(download_path, filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
