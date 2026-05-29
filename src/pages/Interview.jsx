import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

const QUESTIONS = {
  swe: {
    easy:   ["Tell me about yourself.", "What is a variable?", "What is the difference between HTML and CSS?"],
    medium: ["Explain how React useState works.", "What is a REST API?", "What is the difference between == and ===?"],
    hard:   ["Explain system design for a URL shortener.", "What are React hooks and why were they introduced?", "Explain time complexity with an example."],
  },
  product: {
    easy:   ["Tell me about yourself.", "What is a product roadmap?", "How do you prioritise features?"],
    medium: ["How do you define success metrics for a feature?", "Tell me about a product you admire and why.", "How do you handle conflicting stakeholder needs?"],
    hard:   ["How would you design Uber from scratch?", "Walk me through a product decision you made with limited data.", "How do you balance user needs vs business goals?"],
  },
  marketing: {
    easy:   ["Tell me about yourself.", "What is a marketing funnel?", "What is the difference between B2B and B2C?"],
    medium: ["How would you launch a new product?", "What metrics do you track for a campaign?", "Explain SEO in simple terms."],
    hard:   ["How would you grow user acquisition by 10x with a limited budget?", "Walk me through a campaign you'd run for a new app.", "How do you measure brand awareness?"],
  },
  finance: {
    easy:   ["Tell me about yourself.", "What is a balance sheet?", "What is the difference between revenue and profit?"],
    medium: ["Walk me through a DCF analysis.", "What is working capital?", "How do you value a company?"],
    hard:   ["How would you analyse a potential acquisition target?", "Explain the impact of rising interest rates on equity valuation.", "Walk me through a leveraged buyout."],
  },
  design: {
    easy:   ["Tell me about yourself.", "What is the difference between UX and UI?", "What is a wireframe?"],
    medium: ["Walk me through your design process.", "How do you conduct user research?", "What is a design system?"],
    hard:   ["How would you redesign Google Maps?", "How do you balance aesthetics with usability?", "Walk me through a design decision you had to defend."],
  },
  hr: {
    easy:   ["Tell me about yourself.", "What is onboarding?", "Why do you want to work in HR?"],
    medium: ["How do you handle a conflict between two employees?", "What is your approach to performance reviews?", "How do you measure employee engagement?"],
    hard:   ["How would you redesign a company's hiring process?", "How do you handle a toxic high performer?", "Walk me through how you'd build a culture from scratch."],
  },
}

const TIMER_SECONDS = 60

export default function Interview() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const role = searchParams.get("role")
  const difficulty = searchParams.get("difficulty")

  // ── STATE ────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef(null)

  const questions = QUESTIONS[role]?.[difficulty] || []
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length

  // ── CONCEPT: useEffect — runs the countdown timer ────────
  // Every time currentIndex changes (new question), 
  // reset and restart the timer.
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Cleanup — stop the timer when component unmounts
    // or before the effect runs again
    return () => clearInterval(timerRef.current)
  }, [currentIndex])  // ← runs every time question changes

  // ── CONCEPT: useRef — stores timer ID ───────────────────
  // timerRef holds the interval ID so we can clear it.
  // We use useRef not useState because changing it
  // shouldn't trigger a re-render.

  function handleNext() {
    const newAnswers = [...answers, { question: currentQuestion, answer }]
    setAnswers(newAnswers)
    setAnswer("")

    if (currentIndex + 1 >= totalQuestions) {
      clearInterval(timerRef.current)
      navigate("/results", { state: { answers: newAnswers, role, difficulty } })
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const timerColor = timeLeft > 30
    ? "text-green-500"
    : timeLeft > 10
    ? "text-yellow-500"
    : "text-red-500"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-2xl p-8">

        {/* Top row — progress + timer */}
        <div className="flex items-center justify-between mb-8">

          {/* Progress */}
          <div>
            <p className="text-sm text-gray-500 mb-1">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <div className="w-48 h-2 bg-gray-100 rounded-full">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className={`text-4xl font-bold ${timerColor}`}>
            {timeLeft}s
          </div>

        </div>

        {/* Question */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            {role} · {difficulty}
          </p>
          <p className="text-xl font-semibold text-gray-800">
            {currentQuestion}
          </p>
        </div>

        {/* Answer input */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={5}
          className="w-full border border-gray-200 rounded-xl p-4 text-gray-800 text-sm resize-none outline-none focus:border-blue-400 mb-6"
        />

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
        >
          {currentIndex + 1 === totalQuestions ? "Finish Interview →" : "Next Question →"}
        </button>

      </div>
    </div>
  )
}