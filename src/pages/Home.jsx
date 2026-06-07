import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useInterview } from "../context/useInterview"
import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

const ROLES = [
  {
    id: "swe",
    label: "Software Engineer",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
    color: "from-yellow-500 to-orange-600",
  },
  {
    id: "product",
    label: "Product Manager",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "marketing",
    label: "Marketing",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&q=80",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "finance",
    label: "Finance",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
    color: "from-green-500 to-teal-600",
  },
  {
    id: "design",
    label: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80",
    color: "from-red-500 to-orange-600",
  },
  {
    id: "hr",
    label: "Human Resources",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=80",
    color: "from-blue-500 to-indigo-600",
  },
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
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-24 px-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="relative">
        <div className="inline-block bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-indigo-200 mb-6">
          Interview without the view
        </div>
        <h1 className="text-transparent text-4xl bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          Ace Your Next<br />
          <span className="text-6xl text-white font-extrabold mb-4 leading-tight">
            Interview
          </span>
        </h1>
        <p className="text-indigo-200 text-xl max-w-xl mx-auto">
          Domain-specific questions tailored to your role and resume.
        </p>
      </div>
    </div>

    {/* Main content */}
    <div className="max-w-3xl mx-auto px-6 py-12">

      {/* Step 1 — Role */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Choose the role
      </h2>
      <p className="text-gray-500 mb-6">Questions will be tailored to this role.</p>

      <div className="grid grid-cols-3 gap-4 mb-12">
        {ROLES.map((roleOption) => (
          <button
            key={roleOption.id}
            onClick={() => setRole(roleOption.id)}
            className={`relative overflow-hidden rounded-2xl text-left transition-all transform hover:scale-105 hover:shadow-lg ${
              role === roleOption.id
                ? "ring-4 ring-indigo-500 ring-offset-2 shadow-lg scale-105"
                : "shadow-sm"
            }`}
          >
            <div className="relative h-32 overflow-hidden">
              <img
                src={roleOption.image}
                alt={roleOption.label}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${roleOption.color} opacity-60`} />
              {role === roleOption.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-xs font-bold">✓</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white">
              <p className="font-semibold text-gray-800 text-sm">{roleOption.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Step 2 — Difficulty */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Choose difficulty
      </h2>
      <p className="text-gray-500 mb-6">Choose the level you want to interview for</p>
      <div className="flex flex-col gap-3 mb-12">
        {DIFFICULTIES.map((diffOption) => (
          <button
            key={diffOption.id}
            onClick={() => setDifficulty(diffOption.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              difficulty === diffOption.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="font-semibold text-gray-800">{diffOption.label}</div>
            <div className="text-gray-500 text-sm">{diffOption.desc}</div>
          </button>
        ))}
      </div>

      {/* Step 3 — Resume upload */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Upload your resume
      </h2>
      <p className="text-gray-500 mb-6">
        Optional but recommended, so that questions will be personalised to your experience.
      </p>
      <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all mb-12 ${
        resumeText
          ? "border-green-400 bg-green-50"
          : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50"
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
            ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {canStart ? "Start Interview →" : "Select a role and difficulty to start"}
      </button>

    </div>
  </div>
)
}



/*
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          Ace Your Next<br />
          <span className="text-6xl font-extrabold mb-4 leading-tight">
            Interview
          </span>
        </h1>

        text-6xl font-extrabold mb-4 leading-tight
*/