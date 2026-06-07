import * as faceapi from "face-api.js"
import { useInterview } from "../context/useInterview"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom"

/*
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
*/

const TIMER_SECONDS = 120

export default function Interview() {
  const { role, difficulty, resumeText, setAnswers: saveAnswers, setExpressionData } = useInterview()
  const navigate = useNavigate()

  // ── STATE ────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [finished, setFinished] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [questions, setQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const videoRef = useRef(null)
  const expressionLog = useRef([])   // stores expressions without re-rendering
  const trackingRef = useRef(null) 
  const timerRef = useRef(null)

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length



useEffect(() => {
  generateQuestions()
}, [])

async function generateQuestions() {
  setLoadingQuestions(true)

  const resumeContext = resumeText
    ? `The candidate's resume: ${resumeText.slice(0, 2000)}`
    : "No resume provided — use general questions for this role."

  const prompt = `
    You are an expert interviewer.
    Generate exactly 3 interview questions for a ${role} role at ${difficulty} level.
    The questions should be similar to what one would face in a real interview of such type
    and so you may include previously asked questions for such roles available online
    ${resumeContext}
    
    Return ONLY a JSON array of 3 strings, nothing else:
    ["question 1", "question 2", "question 3"]
  `

  try {
    const apiKey = import.meta.env.VITE_GEMINI_KEY
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    )
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = JSON.parse(text)
    setQuestions(parsed)
  } catch (err) {
    console.error("Question generation failed:", err)
    // Fall back to hardcoded questions if AI fails
    setQuestions(QUESTIONS[role]?.[difficulty] || [])
  } finally {
    setLoadingQuestions(false)
  }
}

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


  useEffect(() => {
  async function startFaceTracking() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
      await faceapi.nets.faceExpressionNet.loadFromUri("/models")

      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Sample expressions every 3 seconds
      trackingRef.current = setInterval(async () => {
        if (!videoRef.current) return

        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions()

        if (detection) {
          const expressions = detection.expressions
          const dominant = Object.entries(expressions)
            .sort((a, b) => b[1] - a[1])[0][0]  // get highest scoring expression

          expressionLog.current.push({
            time: Date.now(),
            question: currentIndex + 1,
            dominant,
            scores: expressions,
          })
        }
      }, 3000)

    } catch (err) {
      console.log("Face tracking unavailable:", err)
      // Silently fails — interview still works without camera
    }
  }

  startFaceTracking()

  return () => {
    clearInterval(trackingRef.current)
    // Stop camera when leaving page
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
    }
  }
}, [])

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
    clearInterval(trackingRef.current)          // ← stop tracking
    saveAnswers(newAnswers)
    setExpressionData(expressionLog.current)    // ← save to context
    navigate("/results")
  } else {
    setCurrentIndex(currentIndex + 1)
  }
}

  const timerColor = timeLeft > 30
    ? "text-green-500"
    : timeLeft > 10
    ? "text-yellow-500"
    : "text-red-500"

  

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    alert("Your browser doesn't support voice input. Use Chrome or Safari.")
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = "en-US"
  recognition.continuous = false       // stops after one sentence
  recognition.interimResults = false   // only return final result

  recognition.onstart = () => setIsListening(true)
  recognition.onend = () => setIsListening(false)

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript
    setAnswer((prev) => prev + " " + transcript)  // appends to existing answer
  }

  recognition.onerror = (e) => {
    console.error("Speech error:", e.error)
    setIsListening(false)
  }

  recognition.start()
}  

if (loadingQuestions) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🤖</div>
        <p className="text-gray-600 font-semibold text-lg">
          {resumeText ? "Personalising questions from your resume..." : "Generating questions..."}
        </p>
      </div>
    </div>
  )
}
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
        <div className="relative mb-6">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
            placeholder={isListening ? "Listening... speak now 🎙️" : "Type your answer or use the mic below..."}
          rows={5}
          className={`w-full border rounded-xl p-4 text-gray-800 text-sm resize-none outline-none transition-all ${
            isListening
            ? "border-red-400 bg-red-50"
            : "border-gray-200 focus:border-blue-400"
          }`}
        />
        </div>

          {/* Mic button */}
          <button
            onClick={startListening}
            disabled={isListening}
            className={`w-full py-3 rounded-xl font-bold mb-3 transition-all ${
              isListening
                ? "bg-red-100 text-red-500 border-2 border-red-300 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200"
            }`}
          >
            {isListening ? "🎙️ Listening... speak now" : "🎤 Tap to speak answer"}
          </button>

        {/* Next button */}
        <button
          onClick={handleNext}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
        >
          {currentIndex + 1 === totalQuestions ? "Finish Interview →" : "Next Question →"}
        </button>
         {/* Hidden camera — user can't see it but face-api reads from it */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ display: "none" }}
        />   
      </div>
    </div>
  )
}