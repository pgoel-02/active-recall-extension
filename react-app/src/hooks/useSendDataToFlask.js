import { useState } from "react";

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
