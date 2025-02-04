import { useState, useEffect } from "react";
import useGetQuestions from "./useGetQuestions";

/**
 * Custom hook to get all data relevant to presenting questions to users, including video length and questions.
 *
 * @param {string} selectedAnswer - "Throughout", "End", or "Both", defining when questions are prompted.
 * @return {object} - An object containing questions, error state, and video length.
 */
function useGetAllData(selectedAnswer) {
  const [videoLength, setVideoLength] = useState(0.0);
  const { questions, hasError } = useGetQuestions(selectedAnswer);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "videoDuration") {
        setVideoLength(event.data.videoDuration);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return {
    questions,
    hasError,
    videoLength,
  };
}

export default useGetAllData;
