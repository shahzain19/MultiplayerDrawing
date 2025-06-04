import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Result() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    // Decide winner randomly on load
    const randomWinner = Math.random() < 0.5 ? "Player 1" : "Player 2";
    setWinner(randomWinner);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-black text-black mb-4 whitespace-nowrap pr-5 text-center">
        Result Page
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Room Code: <span className="font-mono font-bold">{code}</span>
      </p>

      {winner && (
        <p className="text-3xl font-bold text-green-700">
          🎉 Winner: {winner} 🎉
        </p>
      )}

      <button
        onClick={() => navigate(`/`)}
        className="mt-10 bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition shadow-lg"
      >
        Go Back
      </button>
    </div>
  );
}
