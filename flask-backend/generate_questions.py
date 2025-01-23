import re
import os
from openai import OpenAI
client = OpenAI()

def load_prompt(file_name):
    """
    Loads a prompt, stored in a txt file, from the prompts directory.

    Args:
    file_name (str): The name of the txt file with the prompt.
    
    Returns: 
    str: The prompt.
    """

    file_path = os.path.join(os.path.dirname(__file__), "prompts", file_name)
    with open(file_path, "r") as file:
        return file.read()

def split_transcript(transcript, max_chunk_size=100_000):
    """
    Splits a long transcript into chunks of a specified maximum size.

    Args:
    transcript (str): The long transcript to be split.
    max_chunk_size (int): The maximum size of each chunk in characters. Defaults to 100,000.

    Returns:
    list of str: A list of transcript chunks, each no longer than max_chunk_size characters.
    """
    chunks = []
    starting_index = 0
    transcript_length = len(transcript)

    while starting_index < transcript_length:
        ending_index = starting_index + max_chunk_size
        
        if ending_index > transcript_length: ending_index = transcript_length
        
        if ending_index != transcript_length and transcript[ending_index-1] != '.':
            period_index = transcript.find('.', ending_index)
            ending_index = period_index + 1
        
        chunks.append(transcript[starting_index:ending_index])
        starting_index = ending_index
    return chunks

def summarize_text(transcript, max_extractions = 15):
    """
    Extracts key points from a given text transcript using GPT-4o. The number of points will be between 1 - max_extractions.

    Args:
    transcript (str): The transcription of a video as text.
    max_extractions (int): The maximum number of points that the model can extract from the video. Defaults to 15. 
    
    Returns:
    str: A string containing a Python-style list of key points extracted. 

    Example:
    >>> summarize_text('This is our transcript...')
    '['Key Point 1', 'Key Point 2']'
    """

    prompt = load_prompt("summarize.txt")
    prompt = prompt.format(max_extractions=max_extractions, transcript=transcript)

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": "You are an experienced educator."},
            {"role": "user", "content": prompt}
        ]
    )
    return completion.choices[0].message.content


def summarize_text_with_timestamps(transcript, max_extractions = 15):
    """
    Extracts key points from a timestamped video transcript using GPT-4o. 
    Each key point is mapped to the corresponding timestamp from the transcription segment, indicating when the information has been fully introduced in the video. 

    Args:
    transcript (list of str): A list of JSON-formatted strings, each representing a transcription segment with timestamps. Each string has the following structure:
    {
        "start": "Starting time in seconds",
        "end": "Ending time in seconds",
        "text": "Transcribed text"
    }
    max_extractions (int): The maximum number of points that the model can extract from the video. Defaults to 15. 

    Returns:
    str: A string containing a Python-style list of key points extracted, with associated timestamps. 
    Each item in the list is a JSON object that stores a key point and its associated timestamp.
    """

    transcript = "\n".join(transcript)

    prompt = load_prompt("summarize_with_timestamps.txt")
    prompt = prompt.format(max_extractions=max_extractions, transcript=transcript)

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": "You are an experienced educator."},
            {"role": "user", "content": prompt}
        ]
    )
    return completion.choices[0].message.content

def format_as_list(key_points):
    """
    Uses regular expressions to extract a Python list from a string that contains additional text or comments. 

    Parameters:
    key_points (str): A string that contains a Python-style list, potentially with additional text or comments.

    Returns:
    list: The extracted Python list.

    Example:
    >>> example_string = "Some text before the list: [1, 2, 3, 'a', 'b', 'c'] and after."
    >>> format_as_list(example_string)
    [1, 2, 3, 'a', 'b', 'c']
    """

    key_points = re.search(r'\[.*\]', key_points, re.DOTALL)
    key_points = key_points.group(0)
    return eval(key_points)

def format_as_dict(key_points):
    """
    Uses regular expressions to extract a Python dictionary from a string that contains additional text or comments. 

    Args:
    key_points (str): A string that contains a Python-style dictionary, potentially with additional text or comments.

    Returns: 
    dict: The extracted Python dictionary.

    Example:
    >>> example_dict = "Some text before the dictionary: {"key1":"value", "key2", "value"} and after."
    >>> format_as_dict(example_dict)
    {"key1":"value", "key2", "value"}
    """

    key_points = re.search(r'\{.*\}', key_points, re.DOTALL)
    key_points = key_points.group(0)
    return eval(key_points)


def generate_question(key_point):
    """
    Generates a multiple-choice question from a given key point using GPT-4o.
    
    Args:
    key_point (str): The key point to generate the question from.
    
    Returns:
    str: A string containing a Python-style dictionary with the question, correct answer, and distractors.

    Example:
    >>> generate_question_with_gpt4('The four pillars of OOP are abstraction, polymorphism, inheritance, and encapsulation.')
    ```python
    {
        question: "Which of the following is not one of the four pillars of Object-Oriented Programming (OOP)?",
        options: [
            "Abstraction", 
            "Encapsulation", 
            "Polymorphism", 
            "Concurrency"
        ],
        correct_answer: "Concurrency"
    }
    ```
    """

    prompt = load_prompt("generate_question.txt")
    prompt = prompt.format(key_point=key_point)

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an experienced educator generating educational questions."},
            {"role": "user", "content": prompt}
        ]
    )
    return completion.choices[0].message.content


def create_questions_from_points(key_points, timestamped):
    """
    Generates questions for a list of key points.
    
    Args:
    timestamped (bool): True if key points are given timestamps, False if not.
    if timestamped == True:
        key_points (list of str): A list of key points to generate questions from.
    if timestamped == False:
        key_points (list of dict): A list of dictionaries, with each dictionary storing a key point and its associated timestamp.
    
    Returns:
    list: A list of dictionaries, with each dictionary containing a question, options, and correct answer. If timestamped == True, each dictionary will also contain the timestamp.
    """

    questions = []
    for point in key_points:
        try:
            question_data = format_as_dict(generate_question(point['key_point'] if timestamped else point))
            if timestamped: question_data['timestamp'] = point['timestamp']
            questions.append(question_data)
        except Exception as e:
            print(f"Error generating question for point: {point}\n{e}")
    return questions


def get_questions(transcript, timestamped):
    """
    Retrieves educational multiple-choice questions generated from a transcript.

    Args:
    timestamped (bool): True if key points are given timestamps, False if not.
    if timestamped == True:
        transcript (list of str): A list of JSON-formatted strings, each representing a transcription segment with timestamps. 
        Each string has the following structure:
        {
        "start": "Starting time in seconds",
        "end": "Ending time in seconds",
        "text": "Transcribed text"
        }
    if timestamped == False:
        transcript (str): The text transcription of a video.
    
    Returns:
    list: A list of dictionaries, each containing a question, options, and correct answer. If timestamped == True, each dictionary will also contain the timestamp.
    """
    chunks = [transcript]
    if len(transcript) > 100000: 
        chunks = split_transcript(transcript)
    
    questions = []
    for chunk in chunks:
        key_points = summarize_text_with_timestamps(chunk) if timestamped else summarize_text(chunk)
        key_points = format_as_list(key_points)
        questions.append(create_questions_from_points(key_points, timestamped))
    
    questions = [question for sublist in questions for question in sublist]
    return questions
