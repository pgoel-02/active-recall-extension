import { useState } from "react";

/** Custom hook to send data to a Flask API, which does video transcription and question generation.
 *
 * @returns {object} - An object containing the response message, error state, and a function to send data to the Flask API.
 * The response message should be a list of questions, each with a `question`, `options`, and `correct_answer`, and optionally a `timestamp`.
 */
const useSendDataToFlask = () => {
  const [responseMessage, setResponseMessage] = useState(null);
  const [error, setError] = useState(null);

  const sendDataToFlask = async (videoUrl, timestamped) => {
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/generate_questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          timestamped: timestamped,
        }),
      });

      const data = await response.json();
      setResponseMessage(data);
    } catch (err) {
      console.error("Error:", err);
      setError("Error communicating with Flask API.");
    }
  };

  return { responseMessage, error, sendDataToFlask };
};

export default useSendDataToFlask;
