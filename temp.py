import yt_dlp
import subprocess
import os

play_count = {}

# collapsible
def play_youtube_video(url):
    """Downloads, streams, and manages play counts of YouTube videos."""

    # split the video link: https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=related, starting from v=; split into [https://www.youtube.com/watch?, dQw4w9WgXcQ, feature=related], then pick the id
    video_id = url.split("v=")[-1].split("&")[0]  # 'abc123'
    video_filename = f"downloaded_{video_id}.mp4"

    # Define options for downloading the video using yt-dlp.
    # The 'format' specifies the best video and audio formats available.
    # The 'outtmpl' sets the output filename format to include the video ID.
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': video_filename,
    }

    # Download the video using yt-dlp
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # If the video is not in the dictionary, initialize its play count to 0.
    if video_filename not in play_count:
        play_count[video_filename] = 0

    # Increment the play count for the video
    play_count[video_filename] += 1

    # Use ffmpeg to extract and play the audio from the downloaded video.
    # The '-vn' flag ensures that the video stream is ignored, and only audio is processed.
    command = ['ffmpeg', '-i', video_filename, '-vn', '-f', 'wav', '-']
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        while True:
            # Read audio data from ffmpeg's output in chunks of 1024 bytes.
            data = process.stdout.read(1024)
            if not data:
                break
            # Process the audio data here, e.g., play it using a library or pass it to an audio player.

        # Wait for the ffmpeg process to complete
        process.wait()
    except FileNotFoundError:
        # Handle the case where ffmpeg is not found in the system
        print("FFmpeg not found. Install it or use a suitable audio player.")
    finally:
        # Remove the downloaded video file if it has been played less than or equal to 5 times.
        # If the play count exceeds 5, keep the video file for future use.
        if play_count[video_filename] <= 5:
            try:
                os.remove(video_filename)
                # file deleted, testing purposes, delete print
                print(f"Deleted {video_filename}, testing purposes, delete print line 60")
            except FileNotFoundError:
                # file was already removed or not found
                pass
        else:
            print(f"You're listening too much to {video_filename}. Saving to database.")

# Example usage
print("only support one url at a time")
youtube_url = input("Enter YouTube video URL(e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ): ")
play_youtube_video(youtube_url) 