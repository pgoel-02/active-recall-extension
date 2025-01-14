import yt_dlp

def download_audio(youtube_url):
    ydl_opts = {
        'format': 'mp3/bestaudio/best',
        'postprocessors': [{  
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }]
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download(youtube_url)  
    except yt_dlp.DownloadError as e:
        print(f"Download error occurred: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    

        



