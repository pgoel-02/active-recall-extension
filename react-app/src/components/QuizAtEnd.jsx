import React, { useState, useEffect } from "react";
import ListOfQuestions from "./ListOfQuestions";
import useGetAllData from "../hooks/useGetAllData";

/**
 * The QuizAtEnd component displays a list of questions at the end of a video.
 * It listens for video playback events to determine when to show the questions.
 * It uses a custom hook to fetch questions, if no questions are provided as a prop.
 *
 * @param {string} selectedAnswer - The selected answer passed from parent, which should be "End"
 * @param {Array} preloadedQuestions - Preloaded questions to use instead of fetching.
 * @param {number} preloadedVideoLength - Preloaded video length to use instead of fetching.
 * @param {Function} onAnswerChange - Callback function to send selected answer back to parent component.
 * @returns {JSX.Element|null} The rendered component or null if conditions are not met.
 */
function QuizAtEnd({
  selectedAnswer,
  preloadedQuestions = null,
  preloadedVideoLength = 0,
  onAnswerChange,
}) {
  const { questions, hasError, videoLength } = preloadedQuestions
    ? {
        questions: preloadedQuestions,
        hasError: false,
        videoLength: preloadedVideoLength,
      }
    : useGetAllData(selectedAnswer);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    onAnswerChange(selectedAnswer);
  }, [showQuestions]);

  useEffect(() => {
    const handleMessage = (event) => {
      const currentValue = event.data.currentTime;
      if (currentValue && !showQuestions && videoLength !== 0) {
        const isVideoEnded =
          Math.ceil(currentValue) >= Math.ceil(videoLength - 1);

        if (isVideoEnded && !showQuestions) {
          setShowQuestions(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [videoLength, showQuestions]);

  if (hasError || !questions || questions.length === 0 || videoLength === 0.0) {
    return null;
  }

  return showQuestions ? (
    <div>
      <ListOfQuestions questions={questions} />
    </div>
  ) : null;
}

export default QuizAtEnd;
