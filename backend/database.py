from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

host = 'mongoplayer.bsez7.mongodb.net' 
dbname = 'YTPlayer'
username = os.getenv('MONGO_USERNAME')
password = os.getenv('MONGO_PASSWORD')

def get_database():
    client = MongoClient(f"mongodb+srv://{username}:{password}@{host}/{dbname}?retryWrites=true&w=majority&appName=mongoPlayer")
    return client[dbname] 

if __name__ == '__main__':
    db = get_database()
    print(db)