import { useState } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import IntroQuestion from "./components/IntroQuestion";
import TimedQuiz from "./components/TimedQuiz";
import QuizAtEnd from "./components/QuizAtEnd";

function App() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerChange = (answer) => {
    setSelectedAnswer(answer);
  };

  return (
    <StrictMode>
      <div>
        {!selectedAnswer ? (
          <IntroQuestion onAnswerChange={handleAnswerChange} />
        ) : selectedAnswer === "End" ? (
          <QuizAtEnd selectedAnswer={selectedAnswer} />
        ) : (
          <TimedQuiz selectedAnswer={selectedAnswer} />
        )}
      </div>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<App />);
