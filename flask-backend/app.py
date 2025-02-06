from flask import Flask, request, jsonify
from generate_transcript import get_transcript 
from generate_questions import get_questions 
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate_questions', methods=['POST', 'OPTIONS'])
def generate_questions():
    """
    Generates educational questions from a youtube video. 

    Endpoint expects a JSON payload with:
    - `video_url`: The URL of the YouTube video (required).
    - `timestamped`: A boolean indicating whether the questions returned should include timestamps, corresponding to when the video covers the topic (required). 
                     True indicates that timestamps should be included, and False indicates no timestamps. 

    Returns:
    - A JSON response with the list of questions extracted from the video, or an error message.
    - Status code 200 for success, 400 for missing URL or missing value for 'timestamped', and 500 for other exceptions. 
    
    Each question is represented as a dictionary with the structure:
    - `correct_answer` (str): The correct answer for the question.
    - `options` (list of str): A list of possible answer options, including the correct one.
    - `question` (str): The actual question being asked.
    If timestamped == True, each dictionary will also include:
    - `timestamp` (float): The time in seconds corresponding to when the topic in a given question is covered in the youtube video.
    """
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173') 
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    data = request.json
    video_url = data.get('video_url')
    timestamped = data.get('timestamped')

    if not video_url:
        return jsonify({"error": "YouTube URL is required"}), 400
    if timestamped is None:  
        return jsonify({"error": "Flag indicating if questions should have timestamps (timestamped) is required"}), 400

    try:
        transcript = get_transcript(video_url, timestamped)
        questions = get_questions(transcript, timestamped)
        return jsonify(questions)  
    except Exception as e:
        return jsonify({"error": str(e)}), 500








