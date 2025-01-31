import { useState, useEffect, useRef } from "react";
import useSendDataToFlask from "./useSendDataToFlask";

const useGenerateQuestions = (selectedAnswer, youtubeUrl) => {
  const [questions, setQuestions] = useState([]);
  const [hasError, setHasError] = useState(false);
  const { responseMessage, error, sendDataToFlask } = useSendDataToFlask();

  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (selectedAnswer && youtubeUrl && !hasCalledAPI.current) {
      const timestamped = selectedAnswer === "Throughout";
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
