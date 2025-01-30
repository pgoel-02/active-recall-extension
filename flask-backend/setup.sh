#!/bin/bash

# Create virtual environment
python3 -m venv chromeext

# Activate the virtual environment
source chromeext/bin/activate

# Upgrade pip to the latest version
echo "Upgrading pip..."
pip install --upgrade pip

# Install the required libraries
echo "Installing required packages..."
pip install openai psycopg2-binary yt-dlp pydub flask audioop-lts flask_cors

# Install ffmpeg if not already found, since pydub requires ffmpeg
echo "Checking if ffmpeg is installed..."
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg not found, installing..."
    brew install ffmpeg
else
    echo "ffmpeg is already installed."
fi

# Deactivate the virtual environment
deactivate

echo "Setup complete! Activate your environment using: source chromeext/bin/activate"