import { useState, useEffect } from "react";
import useGetQuestions from "./useGetQuestions";

function useGetAllData(selectedAnswer) {
  const [videoLength, setVideoLength] = useState(0.0);
  const { questions, hasError } = useGetQuestions(selectedAnswer);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "videoDuration") {
        setVideoLength(event.data.videoDuration);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return {
    questions,
    hasError,
    videoLength,
  };
}

export default useGetAllData;
