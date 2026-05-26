import { useSearchParams } from "react-router-dom"

export default function Interview() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get("role")
  const difficulty = searchParams.get("difficulty")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200 text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Interview Starting
        </h1>
        <p className="text-gray-500 mb-2">
          Role: <span className="font-semibold text-gray-800">{role}</span>
        </p>
        <p className="text-gray-500">
          Difficulty: <span className="font-semibold text-gray-800">{difficulty}</span>
        </p>
      </div>
    </div>
  )
}