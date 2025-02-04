# Welcome to Retain!  
A Chrome Extension that supports **active recall** for YouTube videos through intelligent question generation.  

## 📝 Overview  
Retain transforms YouTube into an interactive learning experience, helping users actively engage and better **retain** key information from videos. The extension leverages AI models to transcribe videos and craft meaningful questions about a given video's content, enhancing comprehension and long-term memory.  

## ⭐ Key Features  
- **Real-time Question Generation:** Generate questions directly from YouTube videos to enhance memory retention.  
- **Flexible Question Timing:** Choose to generate questions throughout the video, at the end, or both, for complete control over your learning experience.
- **AI-Powered Transcriptions:** Automatic transcription of English content using OpenAI's Whisper.  
- **Efficient Storage with Caching:** Store transcriptions in a PostgreSQL database to minimize repeated processing.  
- **Cross-Origin Messaging:** Seamless communication between the browser extension and backend services.  

## 🛠️ Tech Stack  

### **Backend:**  
- **Python / Flask:** API service for processing video transcriptions and generating questions.  
- **OpenAI Whisper:** Automatic transcription of YouTube videos into English text.  
- **OpenAI GPT-4:** Intelligent question generation based on transcriptions.  
- **PostgreSQL:** Database to store processed video data for faster performance.  

### **Frontend:**  
- **React, JavaScript, HTML, CSS:** Chrome extension interface for user interactions.  
- **PostMessage API:** Manages communication between YouTube iframe and extension logic.  

## 🌱 Future Opportunities  
- **Non-English Video Processing:** Enable transcription of videos in multiple languages and allow users to select their preferred language for question generation.  
- **Advanced Question Customization:** Offer users control over question difficulty and types (e.g., multiple choice, short answer).  
- **Enhanced User Analytics:** Provide insights into user engagement, retention rates, and progress over time.  
- **Improved Performance:** Optimize backend processing for faster video processing.  
- **User Profiles & History:** Save user preferences and question-answer history for a personalized experience.  
- **Chrome Web Store Release:** Publish Retain to the Chrome Web Store, bringing the educational tool to users.  
