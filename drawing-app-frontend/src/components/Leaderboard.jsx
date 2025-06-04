// LeftLeaderboard.tsx
import React from "react";

const users = [
  { id: 1, name: "Alice", points: 1500, avatar: "/avatars/alice.png" },
  { id: 2, name: "Bob", points: 1450, avatar: "/avatars/bob.png" },
  { id: 3, name: "Charlie", points: 1400, avatar: "/avatars/charlie.png" },
  { id: 4, name: "David", points: 1350, avatar: "/avatars/david.png" },
  { id: 5, name: "Eve", points: 1300, avatar: "/avatars/eve.png" },
];

const LeftLeaderboard = () => {
  return (
    <div className="flex">
      {/* Leaderboard Sidebar */}
      <aside className="w-full max-w-sm h-screen overflow-y-auto bg-white dark:bg-gray-900 shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">🏆 Leaderboard</h2>
        <ul className="space-y-4">
          {users.map((user, index) => (
            <li
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-xl shadow ${
                index === 0
                  ? "bg-yellow-100 dark:bg-yellow-900"
                  : index === 1
                  ? "bg-gray-200 dark:bg-gray-700"
                  : index === 2
                  ? "bg-orange-100 dark:bg-orange-900"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold w-6 text-gray-700 dark:text-gray-200">
                  {index + 1}
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                />
                <span className="text-gray-800 dark:text-gray-100 font-medium">{user.name}</span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                {user.points} pts
              </span>
            </li>
          ))}
        </ul>
      </aside>

    </div>
  );
};

export default LeftLeaderboard;
