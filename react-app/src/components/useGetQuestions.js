import { useEffect, useState } from "react";
import useGenerateQuestions from "./useGenerateQuestions";

const useGetQuestions = (selectedAnswer) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const { questions, hasError, isLoading } = useGenerateQuestions(
    selectedAnswer,
    videoUrl
  );

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data) {
        setVideoUrl(event.data);
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
    isLoading,
    videoUrl,
  };
};

export default useGetQuestions;
