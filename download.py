# https://github.com/yt-dlp

# video player local, W.I.P

# To run this project, follow these steps for first time setup:
# 1. docker build -t downloader .
# 3. python download.py

# todo: 
# direct play support
# stream support
# playlist support (split url on "&" and see if its "list", maybe store lists as well?)
# e.g. https://www.youtube.com/watch?v=cW8VLC9nnTo&list=PLxA687tYuMWhkqYjvAGtW_heiEL4Hk_Lx&start_radio=1
# to ["https://www.youtube.com/watch?", "cW8VLC9nnTo", "list=PLxA687tYuMWhkqYjvAGtW_heiEL4Hk_Lx", "start_radio=1"]

# done:
# q̶u̶a̶l̶i̶t̶y̶ ̶a̶d̶j̶u̶s̶t̶m̶e̶n̶t̶s̶?̶
# yo̶u̶t̶u̶b̶e̶ ̶v̶i̶d̶e̶o̶ ̶n̶a̶m̶e̶ ̶s̶u̶p̶p̶o̶r̶t̶
# a̶u̶d̶i̶o̶ ̶o̶n̶l̶y̶ ̶s̶c̶e̶n̶a̶r̶i̶o̶


import os
import yt_dlp
import time
import sys

SAVE_PATH = os.path.join(os.getcwd(), "downloaded-yt-videos")  # Location for storing downloaded videos

# Create the folder if it doesn't exist
if not os.path.exists(SAVE_PATH):
    os.makedirs(SAVE_PATH)  # Create directory if it doesn't already exist

# Step 1: Search videos using yt-dlp
def yt_dlp_search(query, max_results=5):
    """
    Search YouTube using yt-dlp and return a list of video details.
    """
    try:
        # yt-dlp options for searching
        ydl_opts = {'noplaylist': True, 'quiet': True}  # Added 'quiet' to suppress detailed output and speed up results
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Search for videos on YouTube using the specified query
            search_results = ydl.extract_info(f"ytsearch{max_results}:{query}", download=False)

            if 'entries' in search_results and search_results['entries']:
                videos = search_results['entries'][:max_results]  # Limit to the requested number of results
                print(f"Found {len(videos)} videos:")
                
                # Display video title and duration for each video
                for idx, video in enumerate(videos):
                    title = video.get('title', 'Unknown Title')
                    duration = video.get('duration', 0)
                    minutes, seconds = divmod(duration, 60)
                    print(f"{idx + 1}. {title} - {minutes}m {seconds}s")
                return videos
            else:
                print("No search results found.")
                return []
    except yt_dlp.utils.DownloadError as e:
        print(f"An error occurred during search: {e}")
        return []
    except Exception as e:
        print(f"A network or API error occurred during search: {e}")
        return []

# Step 2: Get URLs from the user or search by keyword

def get_video_urls():
    """
    Get video URLs from user input or search YouTube by keywords.
    """
    video_metadata = []
    max_retries = 5
    retry_count = 0
    while retry_count < max_retries:
        user_input = input("Enter a video URL, search keyword, or type 'done' to finish: ")
        
        if user_input.lower() == 'done':
            break
        elif user_input.startswith("http"):
            # Add video URL directly if it's a valid URL and not already in the list
            if not any(video['webpage_url'] == user_input for video in video_metadata):
                video_metadata.append({'webpage_url': user_input, 'title': 'Direct URL'})
                retry_count = 0  # Reset retry count on valid input
            else:
                print("URL already added. Skipping duplicate.")
                retry_count = 0  # Reset retry count on valid input
        elif user_input:
            # Perform a search and allow user to pick one of the videos
            videos = yt_dlp_search(user_input)
            if videos:
                choice = input("Enter the number of the video you want to add (1-5, or 'cancel' to skip): ")
                try:
                    choice_idx = int(choice) - 1  # Convert user choice to zero-based index
                    if 0 <= choice_idx < len(videos):
                        video = videos[choice_idx]
                        # Add the chosen video to the metadata list if not already added
                        if not any(v['webpage_url'] == video['webpage_url'] for v in video_metadata):
                            video_metadata.append({'webpage_url': video['webpage_url'], 'title': video.get('title', 'Unknown Title')})
                            print(f"Added video: {video.get('title', 'Unknown Title')} ({video['webpage_url']})")
                            retry_count = 0  # Reset retry count on valid input
                        else:
                            print("URL already added. Skipping duplicate.")
                            retry_count = 0  # Reset retry count on valid input
                    elif choice.lower() == 'cancel':
                        print("Cancelled selection.")
                        retry_count = 0  # Reset retry count on valid input
                    else:
                        print("Invalid choice. Please try again.")
                except ValueError:
                    # Handle invalid input that isn't a valid number or 'cancel'
                    if choice.lower() == 'cancel':
                        print("Cancelled selection.")
                        retry_count = 0  # Reset retry count on valid input
                    else:
                        print("Invalid input. Please enter a number between 1 and 5, or 'cancel'.")
        else:
            print("Invalid input. Please enter a valid URL or keyword.")
        retry_count += 1
        if retry_count >= max_retries:
            print("Maximum retries reached. Exiting input loop.")
    
    return video_metadata

# Step 3: Download videos using yt-dlp

def download_videos(video_metadata, download_folder):
    """
    Download videos from the provided list of metadata using yt-dlp.
    """
    # video or audio quality selection
    audio_only = input("Do you want to download video+audio or audio only? (v/a): ").strip().lower()
    
    if audio_only == 'a':
        format_choice = 'bestaudio'  # Default to best audio format, done in 1-2 sec in most cases of <3 min songs
    else:
        # Ask user for preferred video quality
        valid_formats = {
            'fast': 'best', # mid quality / default
            'hd': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]', # highest quality
            'fastest': 'worst' # lowest quality
        }
        format_choice = input("Enter desired video format ('hd' for absolute highest quality, 'fast' for mid-low quality, 'fastest' for lowest quality): ").lower()
        
        if format_choice in valid_formats:
            format_choice = valid_formats[format_choice]
        else:
            print("Invalid format choice. Using default format 'best'.")
            format_choice = 'best'
    
    # Ask user for delay between downloads and validate the input
    while True:
        delay_input = input("Enter delay between downloads in seconds (default is 2 seconds): ")
        if delay_input.strip() == "":
            delay_between_downloads = 2  # Defaulted delay
            break
        try:
            delay_between_downloads = int(delay_input)  # User-specified delay
            break
        except ValueError:
            print("Invalid input. Please enter a valid integer for the delay.")
    
    # yt-dlp options for downloading and merging video + audio
    ydl_opts = {
        'format': format_choice,
        'noplaylist': True,
        'outtmpl': os.path.join(download_folder, '%(title)s.%(ext)s'),  # Specify output template for downloaded files
        'progress_hooks': [download_progress_hook]  # Hook for progress tracking
    }

    # Remove 'merge_output_format' if the user selects audio-only formats to avoid unnecessary mp4 merge requirement
    if format_choice not in ['bestaudio', 'bestaudio[ext=m4a]']:
        ydl_opts['merge_output_format'] = 'mp4'

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for video in video_metadata:
            retry_attempts = 3
            while retry_attempts > 0:
                try:
                    # Attempt to download the video using yt-dlp
                    ydl.download([video['webpage_url']])
                    time.sleep(delay_between_downloads)  # Configurable delay between downloads to avoid getting blocked
                    break
                except yt_dlp.utils.DownloadError as e:
                    retry_attempts -= 1  # Decrement retry attempts on failure
                    print(f"Failed to download: {video['webpage_url']}. Error: {e}. Retries left: {retry_attempts}")
                except Exception as e:
                    retry_attempts -= 1  # Decrement retry attempts on unexpected error
                    print(f"An unexpected error occurred while downloading {video['webpage_url']}: {e}. Retries left: {retry_attempts}")
            if retry_attempts == 0:
                print(f"All retry attempts failed for {video['title']}. Skipping download.")

def download_progress_hook(d):
    if d['status'] == 'downloading':
        progress = d['_percent_str'].strip()
        sys.stdout.write(f"\rDownloading: {progress}")
        sys.stdout.flush()
    elif d['status'] == 'finished':
        sys.stdout.write("\nDownload complete\n")
        sys.stdout.flush()

if __name__ == "__main__":
    # Step 1: Get video URLs from user
    video_metadata = get_video_urls()

    # Step 2: Download the selected videos
    if video_metadata:
        download_videos(video_metadata, SAVE_PATH)
        print("Download process completed.")
    else:
        print("No videos to download.")
