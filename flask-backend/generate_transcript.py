import yt_dlp
import os
from openai import OpenAI

def get_absolute_path(file_name):
    file_name = (file_name.split("."))[:-1]
    file_name = '.'.join(file_name) + ".mp3"
    return os.path.abspath(file_name)

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
            file_name = ydl.prepare_filename(ydl.extract_info(youtube_url, download=False))
            return get_absolute_path(file_name)
    except yt_dlp.DownloadError as e:
        print(f"Download error occurred: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    
def transcribe(absolute_path_to_file):
    client = OpenAI()
    audio_file = open(absolute_path_to_file, "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file, 
        response_format="text"
    )
    return transcription

