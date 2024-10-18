# https://github.com/yt-dlp

# video player local, W.I.P

# To run this project, follow these steps for first time setup:
# 1. docker build -t downloader .
# 3. python download.py

# todo: 
# direct play support
# stream support
# download 2 videos at a once
# playlist support

# done:
# q̶u̶a̶l̶i̶t̶y̶ ̶a̶d̶j̶u̶s̶t̶m̶e̶n̶t̶s̶?̶
# yo̶u̶t̶u̶b̶e̶ ̶v̶i̶d̶e̶o̶ ̶n̶a̶m̶e̶ ̶s̶u̶p̶p̶o̶r̶t̶
# a̶u̶d̶i̶o̶ ̶o̶n̶l̶y̶ ̶s̶c̶e̶n̶a̶r̶i̶o̶


import os
import yt_dlp
import time
import sys
from concurrent.futures import ThreadPoolExecutor

SAVE_PATH = os.path.join(os.getcwd(), "downloaded-yt-videos") # save to current file directory + filename

# Create the folder if it doesn't exist
if not os.path.exists(SAVE_PATH):
    os.makedirs(SAVE_PATH)

# search using yt-dlp, showing 5 video tittle with length to pick from. Can also use youtube api for faster results, youtube api is free but limited too 10,000
def yt_dlp_search(query, max_results=5):
    try:
        print(f"Starting search for query: {query}")  # Debug log
        ydl_opts = {'noplaylist': True, 'timeout': 10}  # Timeout to avoid hanging
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:

            # only ask yt-dlp to search query with max_results amount of video infos, and don't download anything
            search_results = ydl.extract_info(f"ytsearch{max_results}:{query}", download=False)

            # check if search_results has entries
            if 'entries' in search_results and search_results['entries']:
                videos = search_results['entries'][:max_results]
                print(f"Found {len(videos)} videos:")
                for idx, video in enumerate(videos):
                    title = video.get('title', 'Unknown Title') # ask for the tittle name from search_results
                    duration = video.get('duration', 0) # ask for the video duration from search_results
                    minutes, seconds = divmod(duration, 60) # convert duration to minutes and seconds
                    print(f"{idx + 1}. {title} - {minutes}m {seconds}s") # first 5 results of query search by name
                return videos
            else:
                print("No search results found.")
                return []
    except yt_dlp.utils.DownloadError as e:
        print(f"DownloadError during search: {e}")  # Debug log for download error
        return []
    except Exception as e:
        print(f"Exception during search: {e}")  # Debug log for general exceptions
        return []

def get_video_urls():
    video_metadata = [] # empty list for video urls
    max_retries = 5
    retry_count = 0
    while retry_count < max_retries:
        print(f"Retry attempt: {retry_count+1}/{max_retries}")  # Debug log for retry attempts
        user_input = input("Enter a video URL, search keyword, or type 'done' to finish: ")
        if user_input.lower() == 'done':
            break
        elif user_input.startswith("http"):
            # Check if the URL has already been added
            if not any(video['webpage_url'] == user_input for video in video_metadata):
                video_metadata.append({'webpage_url': user_input, 'title': 'Direct URL'})
                print(f"Added URL: {user_input}")  # Debug log for added URL
                retry_count = 0  # Reset retry count after successful input
            else:
                print("URL already added. Skipping duplicate.")
        elif user_input:
            # Perform a search for the provided keyword
            videos = yt_dlp_search(user_input)
            if videos:
                choice = input("Enter the number of the video you want to add (1-5, or 'cancel' to skip): ")
                if choice.lower() == 'cancel':
                    print("Cancelled selection.")
                else:
                    try:
                        choice_idx = int(choice) - 1 # array index
                        # Validate choice index
                        if 0 <= choice_idx < len(videos): # if withiin video amount
                            video = videos[choice_idx] # video = picked video

                            # Check if the URL has already been added
                            if not any(v['webpage_url'] == video['webpage_url'] for v in video_metadata):
                                video_metadata.append({'webpage_url': video['webpage_url'], 'title': video.get('title', 'Unknown Title')}) # add to video_metadata
                                print(f"Added video: {video.get('title', 'Unknown Title')} ({video['webpage_url']})")
                                retry_count = 0  # Reset retry count after successful input
                            else:
                                print("URL already added. Skipping duplicate.")
                        else:
                            print("Invalid choice. Please try again.")
                    except ValueError:
                        print("Invalid input. Please enter a number between 1 and 5, or 'cancel'.")
        else:
            print("Invalid input. Please enter a valid URL or keyword.")
        retry_count += 1
        if retry_count >= max_retries:
            print("Maximum retries reached. Exiting input loop.")
    
    print(f"Final video list: {video_metadata}")  # Debug log for final video list
    return video_metadata

def download_video(video, format_choice, download_folder):
    print(f"Starting download for: {video['title']} with format: {format_choice}")  # Debug log for starting download
    ydl_opts = {
        'format': format_choice,
        'noplaylist': True,
        'outtmpl': os.path.join(download_folder, '%(title)s.%(ext)s'),
        'progress_hooks': [download_progress_hook],
        'timeout': 10  # Timeout to avoid hanging downloads
    }

    # Specify output format for videos (if not audio-only)
    if format_choice not in ['bestaudio', 'bestaudio[ext=m4a]']:
        ydl_opts['merge_output_format'] = 'mp4'

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        retry_attempts = 3
        while retry_attempts > 0:
            try:
                ydl.download([video['webpage_url']])
                print(f"Download succeeded for: {video['title']}")  # Debug log for successful download
                break
            except yt_dlp.utils.DownloadError as e:
                retry_attempts -= 1
                print(f"DownloadError for {video['title']}, retries left: {retry_attempts}, error: {e}")  # Debug log for download error
                time.sleep(1)  # Brief delay before retrying
            except Exception as e:
                retry_attempts -= 1
                print(f"Exception for {video['title']}, retries left: {retry_attempts}, error: {e}")  # Debug log for general exceptions
                time.sleep(1)  # Brief delay before retrying
        if retry_attempts == 0:
            print(f"All retry attempts failed for {video['title']}. Skipping download.")

def download_videos(video_metadata, download_folder):
    button_pressed = True  # Placeholder for button activation logic in website
    download_tasks = []
    
    for video in video_metadata:
        if button_pressed:
            # Ask user for download format
            audio_only = input(f"Do you want to download video+audio or audio only for '{video['title']}'? (v/a): ").strip().lower()
            if audio_only == 'a':
                format_choice = 'bestaudio'
            else:
                # Provide different quality options for video downloads
                valid_formats = {
                    'hd': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]',
                    'highest': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]',
                    'fast': 'best',
                    'fastest': 'worst'
                }
                format_choice = input("Enter desired video format ('hd' for 1080p, 'highest' for the best quality available, 'fast' for mid-low quality, 'fastest' for lowest quality): ").lower()
                format_choice = valid_formats.get(format_choice, 'best')
        else:
            format_choice = 'bestaudio'
        
        download_tasks.append((video, format_choice, download_folder))
    
    # Use ThreadPoolExecutor to download videos concurrently
    with ThreadPoolExecutor() as executor:
        executor.map(lambda args: download_video(*args), download_tasks)

def download_progress_hook(d):
    if d['status'] == 'downloading':
        progress = d['_percent_str'].strip()
        sys.stdout.write(f"\rDownloading: {progress}")  # Update download progress in real time
        sys.stdout.flush()
    elif d['status'] == 'finished':
        sys.stdout.write("\nDownload complete\n")  # Notify when download is complete
        sys.stdout.flush()

if __name__ == "__main__":
    print("Starting program...")  # Debug log for program start
    video_metadata = get_video_urls()
    if video_metadata:
        print("Starting download process...")  # Debug log for download process start
        download_videos(video_metadata, SAVE_PATH)
        print("Download process completed.")
    else:
        print("No videos to download.")
