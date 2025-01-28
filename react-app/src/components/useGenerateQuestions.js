import { useState, useEffect } from "react";
import useSendDataToFlask from "./useSendDataToFlask";

const useGenerateQuestions = (selectedAnswer, youtubeUrl) => {
  const [questions, setQuestions] = useState([]);
  const { responseMessage, error, sendDataToFlask } = useSendDataToFlask();

  useEffect(() => {
    const timestamped = selectedAnswer === "Throughout";
    sendDataToFlask(youtubeUrl, timestamped);
  }, [selectedAnswer, youtubeUrl, sendDataToFlask]);

  useEffect(() => {
    if (responseMessage) {
      setQuestions(responseMessage);
    }
  }, [responseMessage]);

  if (error) {
    return null;
  }

  return questions.length > 0 ? questions : [];
};

export default useGenerateQuestions;
