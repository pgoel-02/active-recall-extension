import { useState, useEffect } from "react";
import "./IntroQuestion.css";
import RadioAnswer from "./RadioAnswer.jsx";

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
          <RadioAnswer
            value={answer.value}
            label={answer.label}
            name="initialPrompt"
            onChange={handleAnswerChange}
            checked={selectedAnswer === answer.value}
          />
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
