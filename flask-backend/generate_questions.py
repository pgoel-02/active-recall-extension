import re
import json
from openai import OpenAI
client = OpenAI()

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
            {"role": "developer", "content": "You are an experienced educator. Your task is to carefully review text transcripts of educational videos or lectures and extract the most important facts, points, or takeaways. Focus on what students need to learn or remember for better understanding and retention."},
            {"role": "user", "content": f"Here is a transcript from a video.:\n\n{transcript}\n\n Please extract the most important points from the transcript and return them as a Python list, without any additional text. Please return at least one point and at most {max_extractions} points."}
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

    Parameters:
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


def generate_question(main_point):
    """
    Generates a multiple-choice question from a given main point using GPT-4o.
    
    Args:
    main_point (str): The main point to generate the question from.
    
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
    "{main_point}"

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


def create_questions_from_main_points(main_points):
    """
    Generates questions for a list of main points.
    
    Args:
    main_points (list of str): A list of main points to generate questions from.
    
    Returns:
    list: A list of JSON objects, each containing a question, options, and correct answer.
    """
    questions = []
    for point in main_points:
        try:
            question_data = format_as_dict(generate_question(point))
            question_data = json.dumps(question_data,indent = 4)
            questions.append(question_data)
        except Exception as e:
            print(f"Error generating question for point: {point}\n{e}")
    return questions

def get_questions(transcript):
    """
    Retrieves educational multiple-choice questions generated from a given text transcript. 

    Args:
    transcript (str): The transcription of a video.
    
    Returns:
    list: A list of JSON objects, each containing a question, options, and correct answer.
    """
    main_points = format_as_list(summarize_text(transcript))
    questions = create_questions_from_main_points(main_points)
    return questions
