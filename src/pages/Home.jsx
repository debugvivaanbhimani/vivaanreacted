import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useInterview } from "../context/useInterview"
import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

const ROLES = [
  { id: "swe",       label: "Software Engineer", emoji: "💻" },
  { id: "product",   label: "Product Manager",   emoji: "📋" },
  { id: "marketing", label: "Marketing",         emoji: "📣" },
  { id: "finance",   label: "Finance",           emoji: "📊" },
  { id: "design",    label: "UI/UX Designer",    emoji: "🎨" },
  { id: "hr",        label: "Human Resources",   emoji: "🤝" },
]

const DIFFICULTIES = [
  { id: "easy",   label: "Easy",   desc: "Freshers and first internships" },
  { id: "medium", label: "Medium", desc: "1-2 years experience"           },
  { id: "hard",   label: "Hard",   desc: "Senior roles"                   },
]

export default function Home() {
  // ← Read and write to context instead of local state
  const { role, setRole, difficulty, setDifficulty, resumeText, setResumeText } = useInterview()
  
  const [resumeName, setResumeName] = useState("")
  const [extracting, setExtracting] = useState(false)
  const navigate = useNavigate()

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setResumeName(file.name)
    setExtracting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target.result)
      const pdf = await pdfjsLib.getDocument(typedArray).promise
      let fullText = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map((item) => item.str).join(" ") + "\n"
      }
      setResumeText(fullText)   // ← writes to context
      setExtracting(false)
    }
    reader.readAsArrayBuffer(file)
  }

  function handleStart() {
    if (role && difficulty) {
      navigate("/interview")    // ← no more passing data in URL
    }
  }

  const canStart = role && difficulty

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gray-900 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Ace Your Next Interview</h1>
        <p className="text-gray-400 text-xl max-w-xl mx-auto">
          Practice with AI-generated questions tailored to your role and resume.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Step 1 — Role */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Step 1 — Choose your role
        </h2>
        <p className="text-gray-500 mb-6">Questions will be tailored to this role.</p>
        <div className="grid grid-cols-3 gap-4 mb-12">
        {ROLES.map((roleOption) => (
        <button
          key={roleOption.id}
          onClick={() => setRole(roleOption.id)}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            role === roleOption.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="text-3xl mb-2">{roleOption.emoji}</div>
          <div className="font-semibold text-gray-800 text-sm">{roleOption.label}</div>
        </button>
        ))}
        </div>

        {/* Step 2 — Difficulty */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Step 2 — Choose difficulty
        </h2>
        <p className="text-gray-500 mb-6">Pick the level that matches your experience.</p>
        <div className="flex flex-col gap-3 mb-12">
          {DIFFICULTIES.map((diffOption) => (
          <button
            key={diffOption.id}
            onClick={() => setDifficulty(diffOption.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              difficulty === diffOption.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-800">{diffOption.label}</div>
            <div className="text-gray-500 text-sm">{diffOption.desc}</div>
          </button>
        ))}
        </div>

        {/* Step 3 — Resume upload (optional) */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Step 3 — Upload your resume
        </h2>
        <p className="text-gray-500 mb-6">
          Optional but recommended — questions will be personalised to your experience.
        </p>

        <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all mb-12 ${
          resumeText
            ? "border-green-400 bg-green-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
        }`}>
          {extracting ? (
            <p className="text-gray-500">📄 Reading resume...</p>
          ) : resumeText ? (
            <div className="text-center">
              <p className="text-green-600 font-bold text-lg">✅ Resume uploaded</p>
              <p className="text-green-500 text-sm">{resumeName}</p>
              <p className="text-gray-400 text-xs mt-1">Click to replace</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-4xl mb-2">📄</p>
              <p className="text-gray-600 font-semibold">Click to upload your resume</p>
              <p className="text-gray-400 text-sm">PDF only</p>
            </div>
          )}
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleResumeUpload}
          />
        </label>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
            canStart
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {canStart ? "Start Interview →" : "Select a role and difficulty to start"}
        </button>

      </div>
    </div>
  )
}