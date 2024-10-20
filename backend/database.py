from pymongo import MongoClient
from dotenv import load_dotenv
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

if __name__ == '__main__':
    try:
        db = get_database()
        print("Database connection successful:", db)
    except ConnectionError as e:
        print(e)
