import os
import psycopg2
import yt_dlp
import json
from openai import OpenAI
from pydub import AudioSegment

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

def check_file_size(absolute_path_to_file, threshold = 25):
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


def split_audio(absolute_path_to_file, chunk_duration_ms = 24*60*1000, overlap_duration_ms = 30*1000):
    """
    Splits an audio file into chunks with specified duration and overlap. 

    Args:
    absolute_path_to_file (str): Path to the input audio file.
    chunk_duration_ms (int): Duration of each chunk in milliseconds. Defaults to 24 minutes.
    overlap_duration_ms (int): Duration of overlap between chunks in milliseconds. Defaults to 30 seconds.

    Returns:
    List of absolute paths to the saved chunk files.

    Example:
    >>> split_audio('/absolute/path/to/example_video.mp3')
    ['/absolute/path/to/chunk_1.mp3', '/absolute/path/to/chunk_2.mp3', '/absolute/path/to/chunk_3.mp3']
    """
    audio = AudioSegment.from_mp3(absolute_path_to_file)
    video_length_ms = len(audio)
    num_chunks = video_length_ms // chunk_duration_ms + (1 if video_length_ms % chunk_duration_ms else 0)
    
    output_files = []
    for i in range(num_chunks):
        start_time = i * (chunk_duration_ms - overlap_duration_ms)
        end_time = start_time + chunk_duration_ms if start_time + chunk_duration_ms <= video_length_ms else video_length_ms
        chunk = audio[start_time:end_time]
        
        output_file = f"chunk_{i+1}.mp3"
        chunk.export(output_file, format="mp3")
        output_files.append(get_absolute_path(output_file))
    
    return output_files


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


def transcribe_multiple(list_of_paths):
    """
    Transcribes multiple audio files and returns the concatenated transcriptions.
    
    Args:
    list_of_paths (list of str): A list of absolute file paths to audio files to be transcribed.

    Returns:
    str: A concatenated string containing the transcriptions of all valid audio files, separated by newlines. 
    An empty string is returned if no valid transcriptions are found.
    
    Example:
    >>> transcribe_multiple(['/absolute/path/to/chunk_1.mp3', '/absolute/path/to/chunk_2.mp3'])
    'Transcription of file1. Transcription of file2'
    """
    transcription = ""
    
    for path in list_of_paths:
        transcribed_text = transcribe(path)
        if transcribed_text:
            transcription += transcribed_text + " "

    return transcription if transcription != "" else None


def format_timestamps(transcription):
    """
    Extracts transcribed text, start times, and end times from a list of verbose JSON transcription objects. 
    
    Args:
    transcription (list of verbose JSON transcription objects): A list of transcribed segments from the Whisper model

    Returns:
    list of str: A list of JSON-formatted strings, each representing a transcription segment with the following structure:
    {
        "start": "Starting time in seconds",
        "end": "Ending time in seconds",
        "text": "Transcribed text"
    }
    """
    result = []
    for item in transcription:
        data = {"start": item.start, "end": item.end, "text": item.text}
        json_object = json.dumps(data, indent=4)
        result.append(json_object)
    return result


def transcribe_with_timestamps(absolute_path_to_file):
    """
    Transcribes an audio file to text with corresponding timestamps at the segment level in English using OpenAI's Whisper model. 
    Each segment is returned as a transcription object defined by OpenAI, representing a verbose json transcription response from the model.
    
    Args:
    absolute_path_to_file (str): The absolute path to an mp3 file that will be transcribed. 

    Returns:
    List of Verbose JSON transcription objects: A list of transcribed segments.
    """
    client = OpenAI()
    with open(absolute_path_to_file, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file, 
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )
        return transcription.segments  


def transcribe_multiple_audio_with_timestamps(list_of_paths):
    """
    Transcribes multiple audio files and returns the concatenated transcriptions with timestamps. 
    
    Args:
    list_of_paths (list of str): A list of absolute file paths to audio files to be transcribed.

    Returns:
    List of str: A list of JSON-formatted strings, each representing a transcription segment. 
    An empty list is returned if no valid transcriptions are found. Each string has the following structure:
        {
        "start": "Starting time in seconds",
        "end": "Ending time in seconds",
        "text": "Transcribed text"
    }
    """
    transcription = []
    
    for path in list_of_paths:
        transcribed_text = transcribe_with_timestamps(path)
        if transcribed_text:
            transcription.append(format_timestamps(transcribed_text))
    
    transcription = [json_string for sublist in transcription for json_string in sublist]
    return transcription if len(transcription) > 0 else None


def delete_file(absolute_path_to_file):
    """
    Deletes a file at the specified file path.
    
    Args:
    absolute_path_to_file (str): The absolute path to the file that will be deleted.
    """
    try:
        os.remove(absolute_path_to_file)
    except FileNotFoundError:
        print(f"File not found: {absolute_path_to_file}")
    except PermissionError:
        print(f"Permission denied: {absolute_path_to_file}")
    except Exception as e:
        print(f"Error deleting file {absolute_path_to_file}: {e}")


def get_db_connection(db):
    """
    Establishes and returns a connection to the PostgreSQL database.

    Args:
    db (str): The name of the PostgreSQL database.
    """
    user = os.getenv("PGUSER")
    return psycopg2.connect(
        dbname=db,  
        user=user,              
        host="localhost",             
        port="5432"                    
    )


def process_video_transcription(youtube_video_url, before):
    """
    Downloads a YouTube video's audio and returns a transcription of this audio file, with or without timestamps depending on the value of 'before'.
    
    Directly transcribes the audio if the file size is below the default threshold of 25 MB (which is the limit for Whisper).
    Splits the audio into smaller chunks, transcribes each chunk, and returns a concatenation of these transcriptions if the file size is above the default threshold. 

    Deletes any audio files downloaded after creating transcription. 

    Args:
    youtube_video_url (str): The URL of the YouTube video to be processed.
    before (bool): True indicates that we should present questions at the end of the video, while False represents questions throughout or both. 

    Returns:
    if before is True: 
        str: The transcription of the video without timestamps, or None if a transcription could not be made. 
    if before is False: 
        List of str: A list of JSON-formatted strings, each representing a transcription segment with timestamps. 
    """
    path = download_audio(youtube_video_url)
    if not path: return None

    file_size = check_file_size(path)
    if file_size == None: return None

    if file_size:
        transcription = transcribe(path) if before else format_timestamps(transcribe_with_timestamps(path))
    else:
        audio_file_chunks = split_audio(path)
        transcription = transcribe_multiple(audio_file_chunks) if before else transcribe_multiple_audio_with_timestamps(audio_file_chunks)
        for chunk in audio_file_chunks:
            delete_file(chunk)
    delete_file(path)
    return transcription


def get_transcript(youtube_video_id, youtube_video_url, before):
    """
    Retrieves the transcript for a given YouTube video ID. 

    If the transcript exists in the PostgreSQL 'youtube_transcripts' database, it is fetched and returned. 
    If not, the function processes the video to generate a transcript, stores it in the database, and then returns the newly generated transcript.

    Args:
    youtube_video_id (str): The unique identifier of the YouTube video.
    youtube_video_url (str): The URL of the YouTube video.
    before (bool): A value of True indicates that we should present questions at the end of the video, while False represents questions throughout or both. 

    Returns:
    str or None: The transcript of the video if successful. If an exception occurs, it logs the error message and returns None.

    Example:
    >>> get_transcript('example_video', 'https://www.youtube.com/watch?v=example_video')
    'This is the transcription of the given video.'
    """
    connection = get_db_connection("youtube_transcripts")
    cursor = connection.cursor()
    
    try:
        column = "transcript" if before else "timed_transcript"
        cursor.execute(f"SELECT {column} FROM videos WHERE youtube_video_id = %s", (youtube_video_id,))
        transcript = cursor.fetchone()
        if transcript:
            return transcript[0] 
        else:
            transcript = process_video_transcription(youtube_video_url)
            cursor.execute("INSERT INTO videos (youtube_video_id, transcript) VALUES (%s, %s)", 
                           (youtube_video_id, transcript))
            connection.commit() 
            return transcript
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

