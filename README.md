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
- **React, JavaScript, HTML, CSS:** User interface for the Chrome extension, with React set up using Vite for faster development.
- **PostMessage API:** Manages communication between YouTube iframe and extension logic.

## 🌱 Future Opportunities  
- **Non-English Video Processing:** Enable transcription of videos in multiple languages and allow users to select their preferred language for question generation.
- **Advanced Question Customization:** Offer users control over question difficulty and types (e.g., multiple choice, short answer).  
- **Enhanced User Analytics:** Provide insights into user engagement, retention rates, and progress over time.  
- **Improved Performance:** Optimize backend processing for faster video processing.  
- **User Profiles & History:** Save user preferences and question-answer history for a personalized experience.  
- **Chrome Web Store Release:** Publish Retain to the Chrome Web Store, bringing the educational tool to users.

## Local Installation Steps
At the moment, Retain is not available on the Chrome Web Store for users. However, if you are interested in using the developer version of this extension, here are the installation steps. Please note that at this moment, this extension has only been tested on **macOS.** 

## Prerequisites
1. [Chrome](https://www.google.com/chrome/)
2. [OpenAI Developer Account](https://platform.openai.com/docs/overview) with at least **$1** in balance.
3. [Node.JS and npm](https://nodejs.org/en/download) 
4. [Python 3](https://www.python.org/downloads/) for the backend

## Setting up
### 1) Clone the GitHub Repository
Clone the repository to your local machine:

```bash
git clone https://github.com/pgoel-02/active-recall-extension.git
```
### 2) Flask Backend Setup
1. Navigate to the backend directory:

   ```bash
   cd flask-backend
   ```
2. Make the setup.sh script executable (if it's not already).
    ```bash
   chmod +x setup.sh
   ```
3. Run the setup script. This setup script will create a virtual environment called **chromeext** and download all needed Python dependencies. 
   ```bash
   ./setup.sh
   ```
3. Create a .env file in the flask-backend directory (or update an existing .env file) and add the following line (replace your-openai-key with your actual API key):
   ```bash
   OPENAI_API_KEY=your-openai-key
   ```
### 3) React Frontend Setup
1. Assuming you are currently in the flask-backend directory, navigate to the frontend directory:
   ```bash
   cd ../react-app
   ```
2. Install all necessary node modules to run the React App:
   ```bash
   npm install
   ```
### 4) Load extension in Chrome. 
1. Go to the Extensions page by entering chrome://extensions in a new tab.
2. Enable **Developer Mode** (top right of the screen). 
3. Click on **"Load unpacked"** and upload the directory containing the extension.


## Running the extension
You only need to complete the previous setup steps once. After setup has been complete, follow these steps each time you want to run the extension:
1. Start the Backend Service. From the **flask-backend** directory, run the following commands to activate the virtual environment and run the service:
  ```bash
   source chromeext/bin/activate
   ```
  ```bash
    flask run
   ```
2. Start the Frontend. Keep the backend service running, then open a split terminal and run the following command in the **react-app** directory:
  ```bash
   npm run dev
   ```
3. Open a YouTube video that you’d like to receive questions for, and the extension should activate.
