import { useNavigate } from "react-router-dom"
import { useState } from "react"

const ROLES = [
  { id: "swe",       label: "Software Engineer",  emoji: "💻" },
  { id: "product",   label: "Product Manager",     emoji: "📋" },
  { id: "marketing", label: "Marketing",           emoji: "📣" },
  { id: "finance",   label: "Finance",             emoji: "📊" },
  { id: "design",    label: "UI/UX Designer",      emoji: "🎨" },
  { id: "hr",        label: "Human Resources",     emoji: "🤝" },
]

const DIFFICULTIES = [
  { id: "easy",   label: "Easy",   desc: "Freshers / Interns" },
  { id: "medium", label: "Medium", desc: "1-2 years of prior experience"           },
  { id: "hard",   label: "Hard",   desc: "Senior roles"                   },
]

export default function Home() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)
  const navigate = useNavigate()

  function handleStart() {
    if (selectedRole && selectedDifficulty) {
      navigate("/interview")
    }
    if(selectedRole && selectedDifficulty){
        navigate(`/interview?role=${selectedRole}&difficulty=${selectedDifficulty}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gray-900 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Ace Your Next Interview
        </h1>
        <p className="text-gray-400 text-xl max-w-xl mx-auto">
          Practice with AI-generated questions tailored to your role and get instant feedback.
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Step 1 — Role */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Step 1 — Choose your role
        </h2>
        <p className="text-gray-500 mb-6">
          Questions will be tailored to this role.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-12">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedRole === role.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:bg-gray-300 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">{role.emoji}</div>
              <div className="font-semibold text-gray-800 text-sm">{role.label}</div>
            </button>
          ))}
        </div>

        {/* Step 2 — Difficulty */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Step 2 — Choose difficulty
        </h2>
        <p className="text-gray-500 mb-6">
          Pick the level that matches your experience.
        </p>
        <div className="flex flex-col gap-3 mb-12">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setSelectedDifficulty(diff.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedDifficulty === diff.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-800">{diff.label}</div>
              <div className="text-gray-500 text-sm">{diff.desc}</div>
            </button>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!selectedRole || !selectedDifficulty}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
            selectedRole && selectedDifficulty
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {selectedRole && selectedDifficulty
            ? "Start Interview →"
            : "Select a role and difficulty to start"
          }
        </button>

      </div>
    </div>
  )
}