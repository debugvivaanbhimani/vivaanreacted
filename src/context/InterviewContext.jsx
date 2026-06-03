import { createContext, useState } from "react"

export const InterviewContext = createContext()

export function InterviewProvider({ children }) {
  const [role, setRole]                   = useState(null)
  const [difficulty, setDifficulty]       = useState(null)
  const [resumeText, setResumeText]       = useState("")
  const [answers, setAnswers]             = useState([])
  const [expressionData, setExpressionData] = useState([])  // ← new

  return (
    <InterviewContext.Provider value={{
      role,            setRole,
      difficulty,      setDifficulty,
      resumeText,      setResumeText,
      answers,         setAnswers,
      expressionData,  setExpressionData,  // ← new
    }}>
      {children}
    </InterviewContext.Provider>
  )
}