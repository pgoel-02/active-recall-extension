import { useState, useEffect, useRef } from "react";
import useSendDataToFlask from "./useSendDataToFlask";

/**
 * Hook to generate questions based on the selected answer and YouTube URL by calling the Flask API. Ensures that flask API is only called once by using a ref.
 *
 * @param {string} selectedAnswer - "Throughout", "End", or "Both", defining when questions are prompted.
 * @param {string} youtubeUrl - The YouTube video URL to generate questions from.
 * @returns {object} - Contains generated questions, error state, and loading state.
 * Each question includes: `question`, `options`, `correct_answer`, and optionally `timestamp`.
 * Questions will have a `timestamp` if the selected answer is "Throughout" or "Both".
 */
const useGenerateQuestions = (selectedAnswer, youtubeUrl) => {
  const [questions, setQuestions] = useState([]);
  const [hasError, setHasError] = useState(false);
  const { responseMessage, error, sendDataToFlask } = useSendDataToFlask();

  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (selectedAnswer && youtubeUrl && !hasCalledAPI.current) {
      const timestamped =
        selectedAnswer === "Throughout" || selectedAnswer === "Both";
      sendDataToFlask(youtubeUrl, timestamped);

      hasCalledAPI.current = true;
    }
  }, [selectedAnswer, youtubeUrl, sendDataToFlask]);

  useEffect(() => {
    if (error) {
      setHasError(true);
    }
  }, [error]);

  useEffect(() => {
    if (responseMessage) {
      setQuestions(responseMessage);
    }
  }, [responseMessage]);

  return {
    questions: questions,
    hasError: hasError,
    isLoading: !hasError && questions.length === 0,
  };
};

export default useGenerateQuestions;
