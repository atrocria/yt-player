from flask import Flask, jsonify, request
from bson import ObjectId
from pymongo import MongoClient
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database configuration
from dotenv import load_dotenv

load_dotenv()

host = 'mongoplayer.bsez7.mongodb.net'
dbname = 'YTPlayer'
username = os.getenv('MONGO_USERNAME')
password = os.getenv('MONGO_PASSWORD')

if not username or not password:
    raise ValueError("MONGO_USERNAME and MONGO_PASSWORD must be set in environment variables")

MONGO_URI = f"mongodb+srv://{username}:{password}@{host}/{dbname}?retryWrites=true&w=majority&appName=mongoPlayer"
client = MongoClient(MONGO_URI)
db = client[dbname]

# Endpoint to fetch all songs
@app.route('/api/songs', methods=['GET'])
def get_songs():
    songs_collection = db['songs']
    songs = list(songs_collection.find({}))
    for song in songs:
        song['_id'] = str(song['_id'])  # Convert ObjectId to string for JSON serialization
    return jsonify(songs), 200

# Endpoint to increment the play count of a specific song
@app.route('/api/songs/<song_id>/play', methods=['PUT'])
def play_song(song_id):
    try:
        song_id_obj = ObjectId(song_id)
    except Exception:
        return jsonify({"error": "Invalid song ID format"}), 400

    songs_collection = db['songs']
    song = songs_collection.find_one({"_id": song_id_obj})

    if song:
        updated_count = song.get('playCount', 0) + 1
        result = songs_collection.update_one(
            {"_id": song_id_obj},
            {"$set": {"playCount": updated_count}}
        )
        if result.modified_count == 1:
            return jsonify({"message": "Play count updated successfully"}), 200
        else:
            return jsonify({"error": "Failed to update play count"}), 500
    else:
        return jsonify({"error": "Song not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
