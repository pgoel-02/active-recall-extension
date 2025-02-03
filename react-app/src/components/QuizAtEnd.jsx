import React, { useState, useEffect } from "react";
import ListOfQuestions from "./ListOfQuestions";
import useGetAllData from "../hooks/useGetAllData";

function QuizAtEnd({ selectedAnswer }) {
  const { questions, hasError, videoLength } = useGetAllData(selectedAnswer);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      const currentValue = event.data.currentTime;

      if (currentValue && !showQuestions & (videoLength != 0)) {
        const isVideoEnded = Math.ceil(currentValue) >= Math.ceil(videoLength);

        if (isVideoEnded) {
          setShowQuestions(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [videoLength]);

  if (hasError || questions.length === 0 || videoLength === 0.0) {
    return null;
  }

  return showQuestions ? (
    <div>
      <ListOfQuestions questions={questions} />
    </div>
  ) : null;
}

export default QuizAtEnd;
