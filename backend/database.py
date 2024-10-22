from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os

load_dotenv()

host = 'mongoplayer.bsez7.mongodb.net'
dbname = 'YTPlayer'
username = os.getenv('MONGO_USERNAME')
password = os.getenv('MONGO_PASSWORD')

if not username or not password:
    raise ValueError("MONGO_USERNAME and MONGO_PASSWORD must be set in environment variables")

def get_database():
    try:
        client = MongoClient(f"mongodb+srv://{username}:{password}@{host}/{dbname}?retryWrites=true&w=majority&appName=mongoPlayer")
        return client[dbname]
    except Exception as e:
        raise ConnectionError(f"Failed to connect to the database: {str(e)}")

# Function to fetch all songs
def fetch_all_songs():
    db = get_database()
    songs_collection = db['songs']
    songs = list(songs_collection.find({}))
    for song in songs:
        song['_id'] = str(song['_id'])  # Convert ObjectId to string for JSON serialization
    return songs

# Function to increment play count of a song
def increment_play_count(song_id):
    db = get_database()
    songs_collection = db['songs']
    song = songs_collection.find_one({"_id": ObjectId(song_id)})

    if song:
        updated_count = song.get('playCount', 0) + 1
        result = songs_collection.update_one(
            {"_id": ObjectId(song_id)},
            {"$set": {"playCount": updated_count}}
        )
        return result.modified_count == 1
    else:
        return None
