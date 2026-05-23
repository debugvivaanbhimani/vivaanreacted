import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      
      {/* Left side — logo */}
      <Link to="/" className="text-xl font-bold text-white">
        Interview Tool
      </Link>

      {/* Right side — links */}
      <div className="flex gap-6">
        <Link to="/" className="text-gray-300 hover:text-white">
          Home
        </Link>
        <Link to="/interview" className="text-gray-300 hover:text-white">
          Practice
        </Link>
        <Link to="/results" className="text-gray-300 hover:text-white">
          Results
        </Link>
      </div>

    </nav>
  )
}