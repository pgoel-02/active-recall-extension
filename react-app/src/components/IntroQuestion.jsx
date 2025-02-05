import { useState } from "react";
import "./IntroQuestion.css";

/**
 * The IntroQuestion component renders a prompt asking the user when they would like to be asked questions about the video.
 * It provides three options: Throughout the video, At the end of the video, and Both.
 * The component manages the state of the selected answer and handles the submission of the answer, using a callback function to notify the parent component of the selected answer.
 *
 * @param {Function} onAnswerChange - Callback function to send selected answer back to parent component.
 * @returns {JSX.Element|null} The rendered component or null after the question is answered.
 */
function IntroQuestion({ onAnswerChange }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      setIsVisible(false);
      onAnswerChange(selectedAnswer);
    }
  };

  const answers = [
    { value: "Throughout", label: "Throughout the video" },
    { value: "End", label: "At the end of the video" },
    { value: "Both", label: "Both" },
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <div className="prompt">
      <h1>When would you like Retain to ask you questions about the video?</h1>
      {answers.map((answer) => (
        <div key={answer.value}>
          <label>
            <input
              type="radio"
              value={answer.value}
              name="initialPrompt"
              onChange={handleAnswerChange}
              checked={selectedAnswer === answer.value}
            />
            {answer.label}
          </label>
          <br />
        </div>
      ))}

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={!selectedAnswer}
      >
        Submit
      </button>
    </div>
  );
}

export default IntroQuestion;
