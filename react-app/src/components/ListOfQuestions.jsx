import { useState } from "react";
import "./Quiz.css";

/**
 * The ListOfQuestions component renders a series of quiz questions with multiple-choice answers.
 * It allows users to select an answer for each question, submit their answers, and navigate through the quiz.
 *
 * @param {Array} questions - The list of questions to be displayed.
 * @returns {JSX.Element} The rendered component.
 */
const ListOfQuestions = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showQuiz, setShowQuiz] = useState(true);

  if (!showQuiz) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const { question, options, correct_answer } = currentQuestion;

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setSubmitted(true);
      setAnswers((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[currentQuestionIndex] = selectedOption;
        return updatedAnswers;
      });
      if (currentQuestionIndex === questions.length - 1) {
        setQuizCompleted(true);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePreviousQuestion = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const getOptionLabelClass = (option) => {
    const baseClass = "option-label";

    if (quizCompleted) {
      const userAnswer = answers[currentQuestionIndex];
      if (option === correct_answer) return `${baseClass} correct`;
      if (option === userAnswer && option !== correct_answer)
        return `${baseClass} incorrect`;
    }

    if (submitted) {
      if (option === correct_answer) return `${baseClass} correct`;
      if (selectedOption === option && option !== correct_answer)
        return `${baseClass} incorrect`;
    }

    return baseClass;
  };

  return (
    <div className="quiz-container">
      <button
        className="close-button"
        onClick={() => setShowQuiz(false)}
        aria-label="Close Quiz"
      >
        ×
      </button>
      <h4 className="quiz-question">{question}</h4>

      <div className="quiz-options">
        {options.map((option, index) => {
          const isReviewed =
            quizCompleted && answers[currentQuestionIndex] === option;

          return (
            <div key={index} className="quiz-option">
              <label className={getOptionLabelClass(option)}>
                <input
                  type="radio"
                  name="quiz-option"
                  value={option}
                  checked={selectedOption === option || isReviewed}
                  onChange={() => handleOptionChange(option)}
                  disabled={submitted || quizCompleted}
                  className="option-input"
                />
                <span>{option}</span>
              </label>
            </div>
          );
        })}
      </div>

      <div className="button-container">
        {quizCompleted && currentQuestionIndex > 0 && (
          <button className="quiz-button" onClick={handlePreviousQuestion}>
            Previous
          </button>
        )}

        {!quizCompleted &&
          (!submitted ? (
            <button
              className="quiz-button"
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit
            </button>
          ) : (
            currentQuestionIndex < questions.length - 1 && (
              <button className="quiz-button" onClick={handleNextQuestion}>
                Next Question
              </button>
            )
          ))}

        {quizCompleted && currentQuestionIndex < questions.length - 1 && (
          <button className="quiz-button" onClick={handleNextQuestion}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ListOfQuestions;
