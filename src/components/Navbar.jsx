import { Link, useLocation } from "react-router-dom"

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">IntAI</span>
        </div>
        <span className="text-gray-900 font-bold text-lg">Mock Interviews</span>
      </Link>

      <div className="flex gap-1">
        {[
          { to: "/",          label: "Home"     },
          { to: "/interview", label: "Practice" },
          { to: "/results",   label: "Results"  },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === link.to
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}