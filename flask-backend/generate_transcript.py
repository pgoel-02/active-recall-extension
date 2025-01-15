import yt_dlp
import os
from openai import OpenAI

def get_absolute_path(file_name):
    """
    Converts a given file name to its absolute path, ensuring that the file has an '.mp3' extension.

    Args:
    file_name (str): The name of the file, including its extension.

    Returns:
    str: The absolute file path with a '.mp3' extension, or None if an error occurred.

    Example:
    >>> get_absolute_path('example_video.webm')
    '/absolute/path/to/example_video.mp3'
    """
    try:
        if not file_name:
            raise ValueError("The file name must not be an empty string.")
        if '.' not in file_name:
            raise ValueError("The file name must include its extension.")

        file_name = (file_name.split("."))[:-1]
        file_name = '.'.join(file_name) + ".mp3"
        return os.path.abspath(file_name)
    except ValueError as e:
        print(f"Error: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None
        

def download_audio(youtube_url):
    """
    Downloads the audio from a given YouTube video URL and converts it to an mp3 file. 

    Args:
    youtube_url (str): The URL of the YouTube video from which to download the audio.

    Returns:
    str: The absolute file path of the downloaded mp3 audio file, or None if an error occurred.

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

def check_file_size(absolute_path_to_file, threshold=25):
    """
    Checks if the file size is less than a threshold, given in MB

    Args:
    absolute_path_to_file (str): The absolute path to the file. 
    threshold (int): The maximum allowed file size in MB (exclusive). Defaults to 25 MB.

    Returns:
    bool: True if the file size is within the limit, False if the file is above the limit, and None if an error occurred.

    Example:
    >>> check_file_size('/absolute/path/to/example_video.mp3')
    True
    """
    try:
        file_size_bytes = os.path.getsize(absolute_path_to_file)
        return file_size_bytes < (threshold * 1024 * 1024)
    except FileNotFoundError:
        print(f"File not found: {absolute_path_to_file}")
        return None
    except PermissionError:
        print(f"Permission denied: {absolute_path_to_file}")
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
    str: The transcription of the audio file in English as a plain text string, or None if an error occurred.
    
    Example:
    >>> transcribe('/absolute/path/to/example_video.mp3')
    'This is the transcription of the audio file.'
    """
    client = OpenAI()
    try:
        with open(absolute_path_to_file, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file, 
                response_format="text"
            )
        return transcription
    except FileNotFoundError:
        print(f"File not found: {absolute_path_to_file}")
        return None
    except PermissionError:
        print(f"Permission denied: {absolute_path_to_file}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None


def delete_file(absolute_path_to_file):
    """
    Deletes a file at the specified file path.
    
    Args:
    absolute_path_to_file (str): The absolute path to the file that will be deleted.

    Returns:
    bool: True if the file was successfully deleted, False if an error occurred.
    
    Example:
    >>> delete_file('/absolute/path/to/example_video.mp3')
    True
    """
    try:
        os.remove(absolute_path_to_file)
        return True
    except FileNotFoundError:
        print(f"File not found: {absolute_path_to_file}")
        return False
    except PermissionError:
        print(f"Permission denied: {absolute_path_to_file}")
        return False
    except Exception as e:
        print(f"Error deleting file {absolute_path_to_file}: {e}")
        return False
