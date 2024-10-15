import subprocess
import os

# video player local, only downloads video without ads currently W.I.P

# To run this project, follow these steps for first time setup:
# 1. docker build -t downloader .
# 3. run python download.py

# todo: 
# direct play support
# stream support
# youtube video name support
# playlist support
# audio only scenario


SAVE_PATH = os.path.join(os.getcwd(), "downloaded-yt-videos")  # location

# Create the folder if it doesn't exist
if not os.path.exists(SAVE_PATH):
    os.makedirs(SAVE_PATH)



# Step 3: List of video URLs to download
video_urls = [
    "https://youtu.be/Yo83M-KOc7k?si=JvhAg5Z1N8d6odxt",
    "https://youtu.be/vZa0Yh6e7dw?si=N-u5kwhOSZ7EDKpz", # pain
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
]

# get URLs
def get_user_urls():
    while True:
        inputs = input("Enter a video URL (or type 'bruh' to finish): ")
        if inputs.lower() == 'bruh':
            break
        elif inputs.startswith("http"):
            video_urls.append(inputs)
        else:
            print("Invalid URL. Please enter a valid URL starting with 'http'.")

# Get URLs from user
get_user_urls()

# Download each video
for url in video_urls:
    try:
        # yt-dlp command with flags to skip ads and download videos in a specific format.
        # The `-P` flag specifies the output path.
        # `--extractor-args youtube:skip=dash` helps to skip certain ads.
        command = [
            "yt-dlp",
            "-P", SAVE_PATH, 
            "--no-playlist", # don't download playlist
            "--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best", # downloads best video and audio separately. # "--format", "best[ext=mp4]/best", #to download audio and video together but less quality
            url # the video url passed
        ]

        # run the command as if a user was executing it
        subprocess.run(command, check=True)

        print(f"Successfully downloaded: {url}")

    except subprocess.CalledProcessError as e:
        print(f"Failed to download: {url}. Error: {e}")

print("Download process completed.")