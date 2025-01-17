from openai import OpenAI
client = OpenAI()

def summarize_text(transcript, max_extractions = 15):
    """
    Extracts key points from a given text transcript. The number of points will be between 1 - max_extractions.

    Args:
    transcript (str): The transcription of a video as text.
    max_extractions (int): The maximum number of points that the model can extract from the video. Defaults to 15. 
    
    Returns:
    str: A 

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


