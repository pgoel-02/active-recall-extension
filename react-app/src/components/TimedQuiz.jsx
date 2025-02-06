import React, { useState, useEffect } from "react";
import TimedQuestion from "./TimedQuestion";
import useGetAllData from "../hooks/useGetAllData";
import QuizAtEnd from "./QuizAtEnd";
import "./Quiz.css";

/**
 * TimedQuiz component handles displaying timed questions based on video timestamp.
 * It manages the state of questions, answers, and timing to show questions at
 * the correct times and allow users to answer before moving on.
 *
 * @param {string} selectedAnswer - The selected answer passed from parent.
 * @returns {JSX.Element|null} The rendered component or null if conditions are not met.
 */
function TimedQuiz({ selectedAnswer, onAnswerChange }) {
  const hookData = useGetAllData(selectedAnswer);
  const { questions, hasError, videoLength } = hookData;

  // Assigns 'ids' to questions
  if (questions) {
    questions = questions.map((q, index) => ({
      ...q,
      id: `question-${index}`,
    }));
  }

  const [currentTime, setCurrentTime] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [canMoveToNext, setCanMoveToNext] = useState(false);
  const [isQuizHidden, setIsQuizHidden] = useState(false);
  const [lastAnsweredIndex, setLastAnsweredIndex] = useState(-1);
  const [canGenerateAtEnd, setCanGenerateAtEnd] = useState(false);
  const [showQuizAtEnd, setShowQuizAtEnd] = useState(false);

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
      if (activeQuestionIndex === null) {
        const nextQuestionIndex = lastAnsweredIndex + 1;
        if (nextQuestionIndex < questions.length) {
          const roundedTimestamp = roundTimestamp(
            questions[nextQuestionIndex].timestamp
          );
          if (currentTime >= roundedTimestamp) {
            setActiveQuestionIndex(nextQuestionIndex);
            setIsQuizHidden(false);
            setCanGenerateAtEnd(false);
          }
        }
      } else if (answeredQuestions[questions[activeQuestionIndex].id]) {
        const nextIndex = activeQuestionIndex + 1;
        if (nextIndex < questions.length) {
          const roundedNextTimestamp = roundTimestamp(
            questions[nextIndex].timestamp
          );
          if (currentTime >= roundedNextTimestamp) {
            setCanMoveToNext(true);
            setIsQuizHidden(false);
            setCanGenerateAtEnd(false);
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
    lastAnsweredIndex,
  ]);

  /**
   * Handles the submission of an answer for a question.
   * Updates the answeredQuestions state with the selected answer and the LastAnsweredIndex to keep track of the last answered question.
   *
   * @param {string} questionId - The ID of the question.
   * @param {string} selectedOption - The selected answer option.
   */
  const handleAnswerSubmit = (questionId, selectedOption) => {
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
    if (lastAnsweredIndex + 1 < questions.length) {
      setLastAnsweredIndex(lastAnsweredIndex + 1);
    }
  };

  // Checks if all questions have been answered
  const allQuestionsAnswered =
    questions &&
    questions.length > 0 &&
    questions.every((q) => answeredQuestions[q.id]);

  // Effect hook to check whether all questions have been answered and we should generate questions once again at the end of the video
  useEffect(() => {
    if (canGenerateAtEnd && allQuestionsAnswered && selectedAnswer === "Both") {
      setShowQuizAtEnd(true);
      setIsQuizHidden(false);
    }
  }, [canGenerateAtEnd, allQuestionsAnswered, selectedAnswer]);

  // Handles moving to the next question when the "Next" button is clicked.
  const handleNextQuestion = () => {
    const nextIndex = activeQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setActiveQuestionIndex(nextIndex);
      setCanMoveToNext(false);
    }
  };

  // Effect hook to update parent component that component has become null
  useEffect(() => {
    if (
      isQuizHidden ||
      hasError ||
      !questions ||
      questions.length === 0 ||
      videoLength === 0.0
    ) {
      onAnswerChange(selectedAnswer);
    }
  }, [
    isQuizHidden,
    hasError,
    questions,
    videoLength,
    selectedAnswer,
    onAnswerChange,
    canGenerateAtEnd,
  ]);

  if (
    isQuizHidden ||
    hasError ||
    !questions ||
    questions.length === 0 ||
    videoLength === 0.0
  ) {
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

  if (activeQuestionIndex != null) {
    onAnswerChange(selectedAnswer);
  }

  // Handles X button click, which hides the quiz until the next question is available
  const handleClose = () => {
    setIsQuizHidden(true);
    setActiveQuestionIndex(null);
    setCanGenerateAtEnd(true);
  };

  // Checks if the current question has been answered
  const currentQuestionAnswered =
    answeredQuestions[questions[activeQuestionIndex]?.id];

  return (
    <>
      {showQuizAtEnd ? (
        <QuizAtEnd
          selectedAnswer={selectedAnswer}
          preloadedQuestions={questions}
          preloadedVideoLength={videoLength}
          onAnswerChange={onAnswerChange}
        />
      ) : (
        <div className="quiz-container">
          {!hasNextButton && currentQuestionAnswered && (
            <button
              className="close-button"
              onClick={handleClose}
              aria-label="Close Quiz"
            >
              ×
            </button>
          )}
          {/* Render question panel and current question */}
          {activeQuestionIndex !== null && (
            <TimedQuestion
              question={questions[activeQuestionIndex]}
              onSubmit={handleAnswerSubmit}
              isAnswered={answeredQuestions[questions[activeQuestionIndex].id]}
              selectedOption={
                answeredQuestions[questions[activeQuestionIndex].id]
              }
            />
          )}
          {/* Show "Next" button only if the current question has been answered and the next question is ready */}
          {hasNextButton && (
            <button className="quiz-button" onClick={handleNextQuestion}>
              Next
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default TimedQuiz;
