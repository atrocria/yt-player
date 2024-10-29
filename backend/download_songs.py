import os
import yt_dlp
import sys
# from pymongo import MongoClient
# import database

# db = database.get_db()
# songs_collection = db['songs']

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# def delete_song(filepath):
#     if os.path.exists(filepath):
#         try:
#             os.remove(filepath)
#             print(f"Deleted song: {filepath}")
#         except Exception as e:
#             print(f"Error deleting song: {e}")
#     else:
#         print(f"Song file not found: {filepath}")

def download_song(song_url_or_name, download_folder, keep_song=False):
    print(f"Starting download for: {song_url_or_name}")

    ydl_opts = {
        'format': 'bestaudio[ext=webm]',
        'noplaylist': False,
        'outtmpl': os.path.join(download_folder, '%(title)s.%(ext)s'),
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            if not song_url_or_name.startswith("http"):
                print(f"Searching for song: {song_url_or_name}")
                search_results = ydl.extract_info(f"ytsearch:{song_url_or_name}", download=False)
                if 'entries' in search_results and search_results['entries']:
                    song_url_or_name = search_results['entries'][0]['webpage_url']
                else:
                    print("No results found for the search query.")
                    return None

            info = ydl.extract_info(song_url_or_name, download=True)
            entry = info['entries'][0] if 'entries' in info else info

            title = entry.get('title', 'Unknown Title')
            file_ext = entry.get('ext', 'webm')
            filename = f"{title}.{file_ext}"

            print(f"Download succeeded for: {title}")

            # Update song metadata in the MongoDB database or change count if it already exists
            # # Insert song metadata into the MongoDB database
            # song = {
            #     'title': title,
            #     'playCount': 0
            # }
            # songs_collection.insert_one(song)
            # print(f'Song "{title}" added to the database.')
            with open(os.path.join(download_folder, "index"), "a+", encoding='utf-8') as f:
                f.write(f"{filename}\n")
            return filename

        except yt_dlp.utils.DownloadError as e:
            print(f"DownloadError: {e}")
            return None
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python download_songs.py <song_name_or_url> <download_folder>")
        sys.exit(1)

    song_name_or_url = sys.argv[1]
    download_folder = sys.argv[2]

    if not os.path.exists(download_folder):
        os.makedirs(download_folder)

    download_song(song_name_or_url, download_folder, keep_song=True)