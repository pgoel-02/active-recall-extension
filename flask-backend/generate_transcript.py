import yt_dlp
import os
from openai import OpenAI

def get_absolute_path(file_name):
    """
    Converts a given file name to its absolute path, ensuring that the file has an '.mp3' extension.

    Args:
    file_name (str): The name of the file, including its extension.

    Returns:
    str: The absolute file path with a '.mp3' extension.

    Example:
    >>> get_absolute_path('example.webm')
    '/absolute/path/to/example.mp3'
    """
    file_name = (file_name.split("."))[:-1]
    file_name = '.'.join(file_name) + ".mp3"
    return os.path.abspath(file_name)

def download_audio(youtube_url):
    """
    Downloads the audio from a given YouTube video URL and converts it to an mp3 file. 

    Args:
    youtube_url (str): The URL of the YouTube video from which to download the audio.

    Returns:
    str: The absolute file path of the downloaded mp3 audio file, or None if an error occurs.

    Exceptions:
    yt_dlp.DownloadError: For any errors that occur during the download process.
    Exception: For any other unexpected errors that may occur.

    Example:
    >>> download_audio('https://www.youtube.com/watch?v=example_video')
    '/absolute/path/to/example_video.mp3'
    """
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
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None
    
def transcribe(absolute_path_to_file):
    """
    Transcribes an audio file to text in English using OpenAI's Whisper model.
    
    Args:
    absolute_path_to_file (str): The absolute path to an mp3 file that will be transcribed. 

    Returns:
    str: The transcription of the audio file in English as a plain text string.
    
    Example:
    >>> transcribe('/absolute/path/to/example.mp3')
    'This is the transcription of this audio file.'
    """
    client = OpenAI()
    with open(absolute_path_to_file, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file, 
            response_format="text"
        )
    return transcription
