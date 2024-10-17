import os
import yt_dlp
from collections import defaultdict

play_counts = defaultdict(int)

def delete_song(filepath):
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Deleted song: {filepath}")
        else:
            print(f"Song file not found: {filepath}")
    except Exception as e:
        print(f"Error deleting song: {e}")

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
                    return
            
            info = ydl.extract_info(song_url_or_name, download=False)
            if 'entries' in info:
                entries = info['entries'][:12]
            else:
                entries = [info]
            
            for entry in entries:
                title = entry.get('title', 'Unknown Title')
                filepath = os.path.join(download_folder, f"{title}.webm")
                
                ydl.download([entry['webpage_url']])
                print(f"Download succeeded for: {title}")
                
                play_counts[title] += 1
                
                if play_counts[title] > 3 or keep_song:
                    print(f"Keeping song: {title}")
                else:
                    delete_song(filepath)
        
        except yt_dlp.utils.DownloadError as e:
            print(f"DownloadError: {e}")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    SAVE_PATH = os.path.join(os.getcwd(), "downloaded-songs")
    if not os.path.exists(SAVE_PATH):
        os.makedirs(SAVE_PATH)

    while True:
        song_name_or_url = input("Enter the song name or URL (or type 'exit' to quit): ")
        if song_name_or_url.lower() == 'exit':
            break
        keep = input("Do you want to keep this song permanently? (y/n): ").strip().lower() == 'y'
        download_song(song_name_or_url, SAVE_PATH, keep_song=keep)
