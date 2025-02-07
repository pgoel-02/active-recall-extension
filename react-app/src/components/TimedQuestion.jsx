import { useState } from "react";
import "./Quiz.css";

/**
 * TimedQuestion component represents a single quiz question with options.
 * It allows the user to select an answer, submit it, and displays whether
 * the selected answer is correct or incorrect once the question is answered.
 *
 * @param {Object} question - The question object containing the question text, options, and correct answer.
 * @param {Function} onSubmit - Callback function that is called when the answer is submitted.
 * @param {boolean} isAnswered - Flag indicating if the question has been answered.
 * @param {string} selectedOption - The option that has been selected by the user (if any).
 */
const TimedQuestion = ({ question, onSubmit, isAnswered, selectedOption }) => {
  // Local state to track the selected option before the answer is submitted
  const [localSelectedOption, setLocalSelectedOption] = useState(null);

  // Destructuring the question object to get question details
  const { id, question: questionText, options, correct_answer } = question;

  /**
   * Handles the submission of the selected answer.
   * It calls the `onSubmit` function passed from the parent component
   * with the question id and the selected option.
   */
  const handleSubmit = () => {
    if (localSelectedOption) {
      onSubmit(id, localSelectedOption);
    }
  };

  /**
   * Returns the CSS class for an option label based on whether the question
   * is answered, and if the selected option is correct or incorrect.
   *
   * @param {string} option - The option label to check.
   * @returns {string} - The CSS class for the option label.
   */
  const getOptionLabelClass = (option) => {
    const baseClass = "option-label";
    if (isAnswered) {
      if (option === correct_answer) return `${baseClass} correct`;
      if (selectedOption === option && option !== correct_answer)
        return `${baseClass} incorrect`;
    }
    return baseClass;
  };

  return (
    <>
      <h4 className="quiz-question">{questionText}</h4>
      <div className="quiz-options">
        {options.map((option, index) => (
          <div key={index} className="quiz-option">
            <label className={getOptionLabelClass(option)}>
              <input
                type="radio"
                name="quiz-option"
                value={option}
                checked={
                  // Check if the option is selected either by the user or as per the parent component
                  (isAnswered && selectedOption === option) ||
                  (!isAnswered && localSelectedOption === option)
                }
                onChange={() => setLocalSelectedOption(option)}
                disabled={isAnswered}
                className="option-input"
              />
              <span>{option}</span>
            </label>
          </div>
        ))}
      </div>

      {/* Display submit button if the question hasn't been answered yet. */}
      {!isAnswered && (
        <div className="button-container">
          <button
            className="quiz-button"
            onClick={handleSubmit}
            disabled={!localSelectedOption}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
};

export default TimedQuestion;
