import { useEffect, useState } from "react";
import useGenerateQuestions from "./useGenerateQuestions";

/** Custom hook that further calls useGenerateQuestions after receiving the video URL from the iframe.
 *
 * @param {string} selectedAnswer - "Throughout", "End", or "Both", defining when questions are prompted.
 * @return {object} - An object containing questions, error state, loading state, and video URL.
 */
const useGetQuestions = (selectedAnswer) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const { questions, hasError, isLoading } = useGenerateQuestions(
    selectedAnswer,
    videoUrl
  );

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "videoUrl") {
        setVideoUrl(event.data.videoUrl);
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
