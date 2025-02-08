import { useState, useEffect, useCallback } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import IntroQuestion from "./components/IntroQuestion";
import TimedQuiz from "./components/TimedQuiz";
import QuizAtEnd from "./components/QuizAtEnd";

function postMessageBasedOnAnswerChange() {
  const rootElement = document.getElementById("root");
  const quizContainer = document.querySelector(".quiz-container");

  if (
    rootElement &&
    (rootElement.children.length === 0 ||
      (rootElement.firstChild &&
        rootElement.firstChild.childElementCount === 0) ||
      (quizContainer && quizContainer.childElementCount === 0))
  ) {
    window.parent.postMessage({ type: "APP_IS_NULL" }, "*");
  } else {
    window.parent.postMessage({ type: "APP_IS_NOT_NULL" }, "*");
  }
}

function App() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerChange = useCallback((answer) => {
    postMessageBasedOnAnswerChange();
    setSelectedAnswer(answer);
  }, []);

  useEffect(() => {
    postMessageBasedOnAnswerChange();
  }, []);

  return (
    <StrictMode>
      <div>
        {!selectedAnswer ? (
          <IntroQuestion onAnswerChange={handleAnswerChange} />
        ) : selectedAnswer === "End" ? (
          <QuizAtEnd
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleAnswerChange}
          />
        ) : (
          <TimedQuiz
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleAnswerChange}
          />
        )}
      </div>
    </StrictMode>
  );
}

const root = document.getElementById("root");
const reactRoot = createRoot(root);
reactRoot.render(<App />);
