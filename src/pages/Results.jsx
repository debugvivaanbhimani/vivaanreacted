import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, role, difficulty } = location.state || {};

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    if (answers) {
      getFeedback();
    }
  }, []);

  async function getFeedback() {
    setLoading(true);
    setError(null); // Reset error state before fetching

    const answersText = answers
      .map(
        (item, i) =>
          `Question ${i + 1}: ${item.question}\nAnswer: ${
            item.answer || "No answer given"
          }`
      )
      .join("\n\n");

    const prompt = `
      You are an expert interview coach. 
      The candidate interviewed for a ${role} role at ${difficulty} level.
      
      Here are their answers:
      ${answersText}
      
      Give feedback in this exact JSON format and nothing else:
      {
        "overallScore": <number from 0 to 100>,
        "overallComment": "<2-3 sentence overall summary>",
        "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
        "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
        "questionFeedback": [
          { "score": <0-10>, "feedback": "<one sentence feedback>" },
          { "score": <0-10>, "feedback": "<one sentence feedback>" },
          { "score": <0-10>, "feedback": "<one sentence feedback>" }
        ]
      }
    `;

    try {
      // Use standard Vite env variable for your project, with a fallback for preview environments
      const apiKey = import.meta.env?.VITE_GEMINI_KEY || "";
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              // This forces Gemini to return standard JSON without markdown wrapping
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extracting the text from Gemini's response structure
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error("No text returned from API");
      }

      // Cleanup logic just in case the model ignores the mimeType config
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      
      setFeedback(parsed);
    } catch (err) {
      console.error("API error:", err);
      setError("We encountered an issue analyzing your answers. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!answers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No interview data found.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Interview Complete
          </h1>
          <p className="text-gray-500">
            {role} · {difficulty} · {answers.length} questions answered
          </p>
        </div>

        {/* AI Loading State */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-8 shadow-sm">
            <div className="text-3xl mb-3 animate-pulse">🤖</div>
            <p className="text-gray-500 font-medium">
              AI is analyzing your answers...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8 shadow-sm">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button 
              onClick={getFeedback}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        )}

        {/* AI Feedback Results */}
        {feedback && !loading && !error && (
          <div className="flex flex-col gap-6 mb-10">
            {/* Overall score */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Overall Score</h2>
                <span
                  className={`text-3xl font-bold ${
                    feedback.overallScore >= 70
                      ? "text-green-500"
                      : feedback.overallScore >= 40
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {feedback.overallScore}/100
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feedback.overallComment}
              </p>
            </div>

            {/* Strengths and improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-green-800 mb-3">✅ Strengths</h3>
                <ul className="flex flex-col gap-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-green-700 text-sm">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-orange-800 mb-3">📈 Improve</h3>
                <ul className="flex flex-col gap-2">
                  {feedback.improvements.map((imp, i) => (
                    <li key={i} className="text-orange-700 text-sm">
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Per question feedback */}
            <div className="flex flex-col gap-4">
              {answers.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                      Question {index + 1}
                    </p>
                    {feedback.questionFeedback[index] && (
                      <span
                        className={`text-sm font-bold ${
                          feedback.questionFeedback[index].score >= 7
                            ? "text-green-500"
                            : feedback.questionFeedback[index].score >= 4
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {feedback.questionFeedback[index].score}/10
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 mb-4">
                    {item.question}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                      Your answer
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item.answer || "No answer given"}
                    </p>
                  </div>
                  {feedback.questionFeedback[index] && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs text-blue-500 mb-2 font-medium uppercase">
                        AI Feedback
                      </p>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {feedback.questionFeedback[index].feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            New Interview
          </button>
        </div>
      </div>
    </div>
  );
}