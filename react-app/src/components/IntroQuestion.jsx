import { useState } from "react";
import "./IntroQuestion.css";
import RadioAnswer from "./RadioAnswer.jsx";

function IntroQuestion() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      //TODO: Use answer to trigger corresponding Pipeline
      console.log("User selected:", selectedAnswer);
    }
  };

  const answers = [
    { value: "Throughout", label: "Throughout the video" },
    { value: "End", label: "At the end of the video" },
    { value: "Both", label: "Both" },
  ];

  return (
    <div>
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
      <p>Your selection: {selectedAnswer}</p>
    </div>
  );
}

export default IntroQuestion;
