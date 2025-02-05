import { useState, useEffect } from "react";
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

  // Effect sends a message to the parent window to indicate when the current video should be paused vs. unpaused
  // 'APP_IS_NULL' means that the app is not currently asking/presenting questions, so the video should be unpaused/playing
  // 'APP_IS_NOT_NULL' means that the app is currently asking/presenting questions, so the video should be paused
  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (
      rootElement &&
      (rootElement.children.length === 0 ||
        (rootElement.firstChild &&
          rootElement.firstChild.childElementCount === 0))
    ) {
      window.parent.postMessage({ type: "APP_IS_NULL" }, "*");
    } else {
      window.parent.postMessage({ type: "APP_IS_NOT_NULL" }, "*");
    }
  }, [selectedAnswer]);

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

const root = document.getElementById("root");
const reactRoot = createRoot(root);
reactRoot.render(<App />);
