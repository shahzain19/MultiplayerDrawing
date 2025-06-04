import React from "react";

const achievements = [
  {
    id: "start",
    title: "Getting Started",
    description: "Complete the tutorial.",
    icon: "🪓",
    unlocked: true,
    x: 200,
    y: 50,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Discover 10 new locations.",
    icon: "🗺️",
    unlocked: true,
    x: 400,
    y: 130,
    parents: ["start"],
  },
  {
    id: "monster_slayer",
    title: "Monster Slayer",
    description: "Defeat 100 monsters.",
    icon: "⚔️",
    unlocked: true,
    x: 200,
    y: 210,
    parents: ["start"],
  },
  {
    id: "builder",
    title: "Builder",
    description: "Build 50 structures.",
    icon: "🧱",
    unlocked: true,
    x: 70,
    y: 290,
    parents: ["monster_slayer"],
  },
  {
    id: "miner",
    title: "Miner",
    description: "Mine 1000 blocks.",
    icon: "⛏️",
    unlocked: true,
    x: 350,
    y: 310,
    parents: ["explorer", "monster_slayer"],
  },
  {
    id: "enchanter",
    title: "Enchanter",
    description: "Enchant your first item.",
    icon: "✨",
    unlocked: true,
    x: 550,
    y: 250,
    parents: ["explorer"],
  },
  {
    id: "breeder",
    title: "Breeder",
    description: "Breed two animals.",
    icon: "🐄",
    unlocked: true,
    x: 550,
    y: 380,
    parents: ["miner"],
  },
  {
    id: "nether_traveler",
    title: "Nether Traveler",
    description: "Enter the Nether dimension.",
    icon: "🔥",
    unlocked: true,
    x: 100,
    y: 430,
    parents: ["builder"],
  },
  {
    id: "boss_slayer",
    title: "Boss Slayer",
    description: "Defeat the Ender Dragon.",
    icon: "🐉",
    unlocked: true,
    x: 350,
    y: 480,
    parents: ["nether_traveler", "breeder"],
  },
  {
    id: "legendary_builder",
    title: "Legendary Builder",
    description: "Build a monument.",
    icon: "🏰",
    unlocked: true,
    x: 570,
    y: 530,
    parents: ["builder", "enchanter"],
  },
];

function ConnectionLine({ from, to }) {
  return (
    <line
      x1={from.x + 70}
      y1={from.y + 70}
      x2={to.x + 70}
      y2={to.y + 70}
      stroke="#facc15"
      strokeWidth={3}
      strokeLinecap="round"
      className="opacity-70"
    />
  );
}

export default function AdvancementPage() {
  const achievementsById = Object.fromEntries(
    achievements.map((a) => [a.id, a])
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-10 font-mono">
      <h1 className="text-4xl text-yellow-400 mb-10 text-center tracking-widest drop-shadow-lg">
        ADVANCEMENTS
      </h1>

      <div className="relative mx-auto" style={{ width: 700, height: 650 }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {achievements.map(({ id, parents }) =>
            parents
              ? parents.map((parentId) => (
                  <ConnectionLine
                    key={`${parentId}->${id}`}
                    from={achievementsById[parentId]}
                    to={achievementsById[id]}
                  />
                ))
              : null
          )}
        </svg>

        {achievements.map(({ id, title, description, icon, unlocked, x, y }) => (
          <div
            key={id}
            className={`absolute w-36 h-36 p-4 bg-gray-900 border-4 rounded-lg shadow-lg cursor-pointer transition-transform duration-300 ${
              unlocked ? "border-yellow-400" : "border-gray-700"
            } ${unlocked ? "hover:scale-110" : "opacity-50"}`}
            style={{ left: x, top: y }}
            title={`${title}: ${description}`}
          >
            <div className="text-6xl mb-2 select-none">{icon}</div>
            <h2
              className={`text-lg font-bold ${
                unlocked ? "text-yellow-300" : "text-gray-600"
              }`}
            >
              {title}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
