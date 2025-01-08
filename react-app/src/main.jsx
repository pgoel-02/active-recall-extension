import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IntroQuestion from './components/IntroQuestion.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IntroQuestion />
  </StrictMode>,
)
