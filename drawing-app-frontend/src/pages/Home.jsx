import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hand, Key, Plus, Sword } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [myRoomCode, setMyRoomCode] = useState("");
  const [myDuelCode, setMyDuelCode] = useState("");
  const [currentXP, setCurrentXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  const [friendUsername, setFriendUsername] = useState("");
  const [friends, setFriends] = React.useState(() => {
    // On initial render, try to get from localStorage
    const stored = localStorage.getItem("friends");
    return stored ? JSON.parse(stored) : [];
  });
  const getRank = (level) => {
    if (level >= 50) return { name: "LEGENDARY", color: "text-purple-600" };
    if (level >= 40) return { name: "DIAMOND", color: "text-cyan-500" };
    if (level >= 30) return { name: "PLATINUM", color: "text-blue-500" };
    if (level >= 20) return { name: "GOLD", color: "text-yellow-500" };
    if (level >= 5) return { name: "ROOKIE", color: "text-red-500" };
    return { name: "BRONZE", color: "text-gray-500" };
  };

  React.useEffect(() => {
    localStorage.setItem("friends", JSON.stringify(friends));
  }, [friends]);

  const handleAddFriend = async () => {
    const uid = friendUsername.trim(); // this should be the inputted UID

    if (uid === "") return;

    const alreadyAdded = friends.find((f) => f.uuid === uid);
    if (alreadyAdded) {
      toast.error("Friend already added.");
      return;
    }

    // Query Supabase to find the user by UID
    const { data, error } = await supabase
      .from("users")
      .select("username, id")
      .eq("id", uid)
      .maybeSingle(); // ✅ safer than .single()

    if (error || !data) {
      toast.error("User not found.");
      return;
    }

    // Add to friends list
    setFriends([
      ...friends,
      {
        name: data.username,
        uuid: data.uuid,
        online: false,
      },
    ]);

    toast.success(`Added ${data.username} as a friend!`);
    setFriendUsername(""); // clear input
  };

  // XP required to reach the next level
  const getXpForNextLevel = (lvl) => 100 + (lvl - 1) * 50;
  // Level 1 = 100 XP, Level 2 = 150 XP, Level 3 = 200 XP, etc.

  const LOCAL_STORAGE_XP_KEY = "user_xp";
  const LOCAL_STORAGE_LEVEL_KEY = "user_level";

  // Fetch user ID and username
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from("users")
          .select("username")
          .eq("id", user.id)
          .single();
        if (data) setUsername(data.username);
      }
    };
    fetchUser();
  }, []);

  // Fetch XP/Level from Supabase
  useEffect(() => {
    const fetchXP = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("user_stats")
        .select("xp, level")
        .eq("user_id", userId)
        .single();

      if (data) {
        setCurrentXP(data.xp);
        setLevel(data.level);
        localStorage.setItem(LOCAL_STORAGE_XP_KEY, data.xp.toString());
        localStorage.setItem(LOCAL_STORAGE_LEVEL_KEY, data.level.toString());
      }
    };
    fetchXP();
  }, [userId]);

  // Load XP and level from localStorage on mount
  useEffect(() => {
    const savedXP = localStorage.getItem(LOCAL_STORAGE_XP_KEY);
    const savedLevel = localStorage.getItem(LOCAL_STORAGE_LEVEL_KEY);
    if (savedXP !== null && savedLevel !== null) {
      setCurrentXP(parseInt(savedXP, 10));
      setLevel(parseInt(savedLevel, 10));
    }
  }, []);

  const gainXP = (amount) => {
    try {
      let currentXPValue =
        parseInt(localStorage.getItem(LOCAL_STORAGE_XP_KEY), 10) || 0;
      let currentLevelValue =
        parseInt(localStorage.getItem(LOCAL_STORAGE_LEVEL_KEY), 10) || 1;

      let newXP = currentXPValue + amount;
      let newLevel = currentLevelValue;

      while (newXP >= getXpForNextLevel(newLevel)) {
        newXP -= getXpForNextLevel(newLevel);
        newLevel++;
      }

      localStorage.setItem(LOCAL_STORAGE_XP_KEY, newXP.toString());
      localStorage.setItem(LOCAL_STORAGE_LEVEL_KEY, newLevel.toString());

      setCurrentXP(newXP);
      setLevel(newLevel);

      console.log(`XP updated locally: XP=${newXP}, Level=${newLevel}`);
    } catch (err) {
      console.error("Error updating XP locally:", err);
      toast.error("Failed to update XP locally.");
    }
  };

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMyRoomCode(code);
  };

  const handleJoinRoom = async () => {
    if (roomCode.trim().length === 0) return;
    if (!userId) {
      toast.error("User ID not loaded yet. Please try again.");
      return;
    }
    await gainXP(30);
    navigate(`/room/${roomCode}`);
  };

  const handleStartDuel = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMyDuelCode(code);
    toast.success("Duel!");
    await gainXP(30);
    navigate(`/duel/${code}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 relative">
      {/* Username & XP Bar */}
      {username && (
        <div className="absolute top-4 right-4 text-black font-semibold text-2xl md:text-3xl text-right">
          HI, {username}
          <div className="w-full max-w-md mt-4">
            <div className="text-black text-5xl font-extrabold mb-1">
              Level {level}
            </div>
            <div className="w-[250px] bg-gray-200 rounded-full h-5 shadow-inner">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-in-out w-"
                style={{
                  width: `${(currentXP / getXpForNextLevel(level)) * 120}%`,
                }}
              ></div>
            </div>
            <div className="text-sm text-black mt-1 text-right">
              {currentXP} / {getXpForNextLevel(level)} XP to Level {level + 1}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 mb-4 ml-29">
            <span
              className={`text-sm font-bold uppercase ${getRank(level).color}`}
            >
              {getRank(level).name} Rank
            </span>
            <span>
              {getRank(level).name === "BRONZE" && "🥉"}
              {getRank(level).name === "ROOKIE" && "🧢"}
              {getRank(level).name === "GOLD" && "🥇"}
              {getRank(level).name === "PLATINUM" && "🎖️"}
              {getRank(level).name === "DIAMOND" && "💎"}
              {getRank(level).name === "LEGENDARY" && "🔥"}
            </span>
          </div>
        </div>
      )}

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-6 text-center">
        Enter the Arena
      </h1>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8 w-full max-w-lg">
        <button
          onClick={handleStartDuel}
          className="bg-white text-black border border-red-400/40 px-12 py-3 w-full sm:w-auto rounded-xl hover:bg-red-200 transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Sword className="w-5 h-5 text-red-500" /> Duel Now
        </button>
        <button
          onClick={generateRoomCode}
          className="bg-white text-black px-12 py-3 w-full sm:w-auto rounded-xl hover:bg-green-200 transition flex items-center justify-center gap-2 shadow-sm border border-green-400/40"
        >
          <Plus className="w-5 h-5 text-green-500" /> Create a Room
        </button>
      </div>

      {/* Room Code Display */}
      {myRoomCode && (
        <div className="bg-white border border-black rounded-xl p-5 text-center shadow-md w-full max-w-sm mb-6">
          <p className="font-bold text-black text-lg">Room Code:</p>
          <p className="text-2xl font-mono text-black mt-1">{myRoomCode}</p>
          <button
            className="mt-3 text-sm text-black underline hover:text-gray-700"
            onClick={() => {
              navigator.clipboard.writeText(myRoomCode);
              toast.success("Copied to clipboard!");
            }}
          >
            📤 Copy & Share
          </button>
        </div>
      )}

      {/* Join Room Form */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-md">
        <h2 className="text-black font-semibold text-lg mb-4">
          <Key className="inline w-6 text-yellow-500" /> Join a Room
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Room Code"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl shadow-sm text-black placeholder-gray-500"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <button
            onClick={handleJoinRoom}
            className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-900 transition w-full sm:w-auto"
          >
            Enter
          </button>
        </div>
      </div>
      {/* Friend Section */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-md mt-6">
        <h2 className="text-black font-semibold text-lg mb-4 flex items-center gap-2">
          🤝 Friends
        </h2>
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {friends && friends.length > 0 ? (
            friends.map((friend, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100"
              >
                <span className="text-black font-medium">{friend.name}</span>
                <span
                  className={`text-sm font-medium ${
                    friend.online ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {friend.online ? "Online" : "Offline"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No friends added yet.</p>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <input
            type="text"
            placeholder="Enter friend's auth UID"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            className="px-4 py-2 border rounded text-black"
          />
          <button
            onClick={handleAddFriend}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Friend
          </button>
        </div>
      </div>
    </div>
  );
}
