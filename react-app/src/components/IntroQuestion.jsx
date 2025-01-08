import { useState } from 'react'
import './IntroQuestion.css'

function IntroQuestion() {
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  return (
    <>
      <div>
      </div>
    </>
  )
}

export default IntroQuestion

