import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function WaitingScreen() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate(`/duel/${code}`);
    }, 5000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [code, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Waiting for opponent to join...
        </h2>
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-gray-200 mx-auto"></div>
        </div>
        <p className="text-gray-600 mb-6">Room Code: <span className="font-mono">{code}</span></p>
      </div>
    </div>
  );
}
