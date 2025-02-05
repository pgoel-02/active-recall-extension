import React, { useState, useEffect } from "react";
import TimedQuestion from "./TimedQuestion";
import "./TimedQuiz.css";
import useGetAllData from "../hooks/useGetAllData";
import QuizAtEnd from "./QuizAtEnd";

/**
 * TimedQuiz component handles displaying timed questions based on video timestamp.
 * It manages the state of questions, answers, and timing to show questions at
 * the correct times and allow users to answer before moving on.
 *
 * @param {string} selectedAnswer - The selected answer passed from parent.
 * @returns {JSX.Element|null} The rendered component or null if conditions are not met.
 */
function TimedQuiz({ selectedAnswer }) {
  // Fetching data from custom hook
  const hookData = useGetAllData(selectedAnswer);
  const { questions, hasError, videoLength } = hookData;

  // State variables for current time, active question index, answered questions,
  // and whether the "next" button is enabled
  const [currentTime, setCurrentTime] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [canMoveToNext, setCanMoveToNext] = useState(false);

  /**
   * Rounds a timestamp to the nearest multiple of 5 seconds (for short videos)
   * or 1 minute (for longer videos).
   * Ensures the timestamp does not exceed the video length.
   *
   * @param {number} timestamp - The timestamp to round.
   * @returns {number} - The rounded timestamp.
   */
  const roundTimestamp = (timestamp) => {
    if (videoLength < 180) {
      if (timestamp % 5 === 0) {
        return Math.min(
          Math.ceil(timestamp / 5) * 5 + 5,
          Math.max(0, videoLength - 1)
        );
      }
      return Math.min(
        Math.ceil(timestamp / 5) * 5,
        Math.max(0, videoLength - 1)
      );
    } else {
      if (timestamp % 60 === 0) {
        return Math.min(
          Math.ceil(timestamp / 60) * 60 + 60,
          Math.max(0, videoLength - 1)
        );
      }
      return Math.min(
        Math.ceil(timestamp / 60) * 60,
        Math.max(0, videoLength - 1)
      );
    }
  };

  // Effect hook to listen for currentTime updates from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && typeof event.data.currentTime !== "undefined") {
        const newTime = Math.ceil(event.data.currentTime);
        setCurrentTime(newTime);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  /**
   * Effect hook to check when the next question should be shown.
   * It checks if the current time has passed the rounded timestamp for the next question.
   */
  useEffect(() => {
    if (questions && questions.length > 0 && currentTime > 0) {
      // If no active question, find the first question whose timestamp has passed
      if (activeQuestionIndex === null) {
        const firstAvailableIndex = questions.findIndex((q) => {
          const roundedTimestamp = roundTimestamp(q.timestamp);
          return currentTime >= roundedTimestamp;
        });

        if (firstAvailableIndex !== -1) {
          setActiveQuestionIndex(firstAvailableIndex);
        }
      } else if (answeredQuestions[questions[activeQuestionIndex].id]) {
        // After answering the current question, check if next question is ready
        const nextIndex = activeQuestionIndex + 1;
        if (nextIndex < questions.length) {
          const roundedNextTimestamp = roundTimestamp(
            questions[nextIndex].timestamp
          );
          if (currentTime >= roundedNextTimestamp) {
            setCanMoveToNext(true);
          }
        }
      }
    }
  }, [
    currentTime,
    questions,
    activeQuestionIndex,
    answeredQuestions,
    videoLength,
  ]);

  /**
   * Handles the submission of an answer for a question.
   * Updates the answeredQuestions state with the selected answer.
   *
   * @param {string} questionId - The ID of the question.
   * @param {string} selectedOption - The selected answer option.
   */
  const handleAnswerSubmit = (questionId, selectedOption) => {
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const allQuestionsAnswered =
    questions &&
    questions.length > 0 &&
    questions.every((q) => answeredQuestions[q.id]);

  if (allQuestionsAnswered && selectedAnswer === "Both") {
    return (
      <QuizAtEnd
        selectedAnswer={selectedAnswer}
        preloadedQuestions={questions}
        preloadedVideoLength={videoLength}
      />
    );
  }

  /**
   * Handles moving to the next question when the "Next" button is clicked.
   */
  const handleNextQuestion = () => {
    const nextIndex = activeQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setActiveQuestionIndex(nextIndex);
      setCanMoveToNext(false);
    }
  };

  if (hasError || !questions || questions.length === 0 || videoLength === 0.0) {
    return null;
  }

  /**
   * Determines if the "Next" button should be shown.
   * The button will only appear if the current question has been answered,
   * there are multiple questions, and the user can move to the next question.
   */
  const hasNextButton =
    questions.length > 1 &&
    answeredQuestions[questions[activeQuestionIndex]?.id] &&
    canMoveToNext;

  return (
    <div className="quiz-container">
      {/* Render question panel and current question */}
      {activeQuestionIndex !== null && (
        <TimedQuestion
          question={questions[activeQuestionIndex]}
          onSubmit={handleAnswerSubmit}
          isAnswered={answeredQuestions[questions[activeQuestionIndex].id]}
          selectedOption={answeredQuestions[questions[activeQuestionIndex].id]}
        />
      )}

      {/* Show "Next" button only if the current question has been answered and the next question is ready */}
      {hasNextButton && <button onClick={handleNextQuestion}>Next</button>}
    </div>
  );
}

export default TimedQuiz;
