import { useState } from 'react'
import './IntroQuestion.css'

function IntroQuestion() {
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      //TODO: Use answer to trigger corresponding Pipeline
      console.log('User selected:', selectedOption);
    }
  };
  
  return (
    <>
      <div>
      </div>
    </>
  )
}

export default IntroQuestion