import { useState } from "react";

const AccessFlaskAPI = () => {
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendDataToFlask = async (videoUrl, timestamped) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return { responseMessage, error, loading, sendDataToFlask };
};

export default AccessFlaskAPI;
