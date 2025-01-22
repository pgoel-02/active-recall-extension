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
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": "You are an experienced educator."},
            {"role": "user", "content": f"Your task is to carefully review text transcripts of educational videos or lectures and extract the most important facts, points, or takeaways. Focus on what students need to learn or remember for better understanding and retention. Here is a transcript from a video.:\n\n{transcript}\n\n Please extract the most important points from the transcript and return them as a Python list, without any additional text. Please return at least one point and at most {max_extractions} points."}
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

    transcript_text = "\n".join(transcript)

    prompt = f"""
    Your task is to carefully review text transcripts of educational videos or lectures and extract the most important facts, points, or takeaways. 
    Focus on what students need to learn or remember for better understanding and retention.
    Each key point must be aligned with the timestamp indicating when the concept has been fully introduced.

    Please return at least one point and at most {max_extractions} points.

    The input is a JSON-formatted list of segments, where each segment includes:
    - `start`: The start time of the segment (in seconds).
    - `end`: The end time of the segment (in seconds).
    - `text`: The spoken content of that segment.

    Your output should be a list, where each entry is a JSON object with the following format:
    - "key_point" (string): The key idea or concept.
    - "timestamp" (float): The time at which the key point was mentioned in the video, in seconds.

    When generating the timestamp for a key point, use the `end` timestamp of the corresponding segment, indicating when the concept is fully introduced.

    For example:
    [
        {{"key_point": "Polymorphism lets the same method name work differently for different objects in OOP.", "timestamp": 134.60000610351562}},
        {{"key_point": "Encapsulation is a key principle of OOP.", "timestamp": 192.72000122070312}}
    ]

    Now, please extract the key points from the provided transcript and format your output accordingly.

    Here is the transcript:
    {transcript_text}
    """

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

    prompt = f"""
    Generate a multiple-choice question based on the following point:
    "{key_point}"

    The question should include:
    1. A clear question.
    2. Four options, where one is the correct answer and the other three are believable distractors. Please keep options concise.
    3. Indicate which option is correct. The correct option should be based on the given point. 
    4. Please do not assign numbers or letters to each option. 

    Return the result in a Python dictionary with the following key-value pairs: 
    question: "Your question text here",
    options: ["Option A", "Option B", "Option C", "Option D"], 
    correct_answer: "Option A"
    """

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
    key_points = format_as_list(summarize_text_with_timestamps(transcript)) if timestamped else format_as_list(summarize_text(transcript))
    questions = create_questions_from_points(key_points, timestamped)
    return questions
