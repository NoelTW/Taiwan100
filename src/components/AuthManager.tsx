import React, { useState } from "react";
import { UserAccount } from "../types";
import { Compass, Sparkles, User, Lock, KeyRound, Check, Zap, Eye, EyeOff } from "lucide-react";

interface AuthManagerProps {
  onLogin: (user: UserAccount) => void;
}

const AVATAR_EMOJIS = ["🌲", "🏔️", "🎒", "🦅", "🧗", "⚡", "🏕️", "🐺", "🔥", "🧭", "🌋", "🧗‍♀️"];
const AVATAR_COLORS = [
  { class: "from-[#d4ff00] to-emerald-500", label: "Alpine Lime" },
  { class: "from-sky-500 to-indigo-600", label: "Glacial Blue" },
  { class: "from-amber-500 to-rose-600", label: "Sunrise Flame" },
  { class: "from-purple-500 to-pink-600", label: "Orchid Twlight" },
  { class: "from-emerald-500 to-teal-800", label: "Deep Spruce" },
];

export default function AuthManager({ onLogin }: AuthManagerProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🏔️");
  const [avatarColor, setAvatarColor] = useState("from-[#d4ff00] to-emerald-500");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Load existing registered users list or initialize with preset hiker
  const getRegisteredUsers = (): UserAccount[] => {
    try {
      const cached = localStorage.getItem("taiwan_100_registered_users");
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }

    // Default pre-seeded hiker account for rapid testing
    const defaultHiker: UserAccount = {
      id: "user-hiker-default",
      username: "hiker",
      passwordHash: "password",
      nickname: "Aoxun Shen",
      avatarEmoji: "🧗",
      avatarColor: "from-[#d4ff00] to-emerald-500",
      completedPeakIds: ["yushan-main", "hsuehshan-main", "hehuan-main"],
      savedTracks: [
        {
          id: "track-preseeded-1",
          peakId: "hehuan-main",
          peakNameCH: "合歡主峰",
          peakNameEN: "Hehuanshan Main Peak",
          date: "2026-06-01",
          durationSeconds: 2450,
          distanceKm: 3.8,
          elevationGained: 237,
          coordinatesMatchedCount: 8,
          points: []
        },
        {
          id: "track-preseeded-2",
          peakId: "yushan-main",
          peakNameCH: "玉山主峰",
          peakNameEN: "Yushan Main Peak",
          date: "2026-06-10",
          durationSeconds: 15400,
          distanceKm: 12.4,
          elevationGained: 1342,
          coordinatesMatchedCount: 18,
          points: []
        }
      ],
      joinedDate: "June 2026"
    };

    localStorage.setItem("taiwan_100_registered_users", JSON.stringify([defaultHiker]));
    return [defaultHiker];
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    const users = getRegisteredUsers();
    const found = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.passwordHash === password
    );

    if (!found) {
      setErrorMsg("Incorrect credentials. Try 'hiker' & 'password'!");
      return;
    }

    triggerSuccessAndLogin(found);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanUsername = username.trim().toLowerCase();

    if (!username.trim() || !password.trim() || !nickname.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (username.length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 4) {
      setErrorMsg("Password must be at least 4 characters.");
      return;
    }

    const users = getRegisteredUsers();
    const alreadyExists = users.some(u => u.username.toLowerCase() === cleanUsername);

    if (alreadyExists) {
      setErrorMsg("Username is already taken. Try another identifier!");
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      passwordHash: password,
      nickname: nickname.trim(),
      avatarEmoji,
      avatarColor,
      completedPeakIds: [],
      savedTracks: [],
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };

    const nextUsers = [...users, newUser];
    localStorage.setItem("taiwan_100_registered_users", JSON.stringify(nextUsers));

    triggerSuccessAndLogin(newUser);
  };

  const triggerSuccessAndLogin = (user: UserAccount) => {
    setSuccessAnimation(true);
    setTimeout(() => {
      onLogin(user);
    }, 1200);
  };

  const handleQuickDemoFill = () => {
    setUsername("hiker");
    setPassword("password");
    setIsRegistering(false);
    setErrorMsg("");
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 relative overflow-y-auto select-none">
      
      {/* Absolute success overlay card */}
      {successAnimation && (
        <div className="absolute inset-0 z-50 bg-[#050705]/95 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00] flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(212,255,0,0.3)]">
            <Check className="w-8 h-8 text-[#d4ff00]" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Alpinist Connected</h3>
            <p className="text-[10px] text-[#d4ff00] font-mono animate-pulse">🛰️ SYNCING GPS LOGS & ACHIEVEMENT BADGES</p>
          </div>
        </div>
      )}

      {/* Top Brand Identity card */}
      <div className="space-y-3.5 text-center my-auto">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-[#d4ff00] to-green-600 p-[1.5px] shadow-[0_8px_24px_rgba(212,255,0,0.15)] animate-pulse">
            <div className="w-full h-full bg-[#050705] rounded-[18px] flex items-center justify-center text-xl">
              🏔️
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-black uppercase tracking-[0.2em] text-white">Taiwan 100 Peaks</h2>
          <p className="text-[9px] text-[#d4ff00] font-mono tracking-widest uppercase">Off-Grid Safety Registry & Tracker</p>
        </div>
        <p className="text-[11px] text-gray-500 max-w-[280px] mx-auto leading-normal">
          Register or log in to lock in summit targets, track safety routes offline, and compile personal achievements.
        </p>
      </div>

      {/* Entry Forms Card */}
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 p-5 space-y-4 shadow-2xl my-auto">
        
        {/* Toggle Switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-black/60 rounded-xl border border-white/5 text-[10px] uppercase font-bold text-gray-400">
          <button
            onClick={() => { setIsRegistering(false); setErrorMsg(""); }}
            className={`py-2 px-1.5 rounded-lg transition-all ${
              !isRegistering ? "bg-white/10 text-white font-black" : "hover:text-gray-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegistering(true); setErrorMsg(""); }}
            className={`py-2 px-1.5 rounded-lg transition-all ${
              isRegistering ? "bg-white/10 text-white font-black" : "hover:text-gray-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Action Form */}
        <form onSubmit={isRegistering ? handleCreateAccount : handleSignIn} className="space-y-3.5">
          {errorMsg && (
            <div className="text-[10px] text-rose-400 font-bold bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-xl text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form fields layout */}
          <div className="space-y-3">
            
            {/* Nickname (Register Only) */}
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-gray-400 pl-1 font-bold block">Display Nickname</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eric Chen"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full text-xs bg-black/50 border border-white/10 focus:border-[#d4ff00] rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-gray-400 pl-1 font-bold block">Username</label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={isRegistering ? "Register name (e.g. hiker99)" : "Enter username (e.g. hiker)"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs bg-black/50 border border-white/10 focus:border-[#d4ff00] rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none transition-all placeholder-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-gray-400 pl-1 font-bold block">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="• • • • • •"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-black/50 border border-white/10 focus:border-[#d4ff00] rounded-xl py-2.5 pl-9 pr-10 text-white focus:outline-none transition-all placeholder-gray-650"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Hiker Custom Profile Badge Customize (Register Only) */}
            {isRegistering && (
              <div className="space-y-2 pt-1 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 pl-1 font-bold block">
                    Choose Alpinist Badge Symbol: <span className="text-[#d4ff00] pr-1">{avatarEmoji}</span>
                  </label>
                  <div className="grid grid-cols-6 gap-1 bg-black/50 border border-white/10 p-2 rounded-xl">
                    {AVATAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        className={`py-1 rounded-lg text-sm bg-transparent hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center border ${
                          avatarEmoji === emoji ? "border-[#d4ff00] bg-[#d4ff00]/10" : "border-transparent"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 pl-1 font-bold block">
                    Telemetry Theme Color Gradient
                  </label>
                  <div className="flex gap-1.5 bg-black/50 border border-white/10 p-2 rounded-xl">
                    {AVATAR_COLORS.map((col) => (
                      <button
                        key={col.class}
                        type="button"
                        onClick={() => setAvatarColor(col.class)}
                        className={`w-5 h-5 rounded-full bg-gradient-to-br ${col.class} relative hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0`}
                        title={col.label}
                      >
                        {avatarColor === col.class && (
                          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Submission Button */}
          <button
            type="submit"
            className="w-full bg-[#d4ff00] hover:bg-[#c3eb00] text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(212,255,0,0.15)] cursor-pointer"
          >
            {isRegistering ? "CREATE ALPINIST PROFILE" : "SECURE CONNECT"}
          </button>
        </form>

        {/* Quick autofill helper */}
        {!isRegistering && (
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="w-full py-2 border border-[#d4ff00]/20 bg-[#d4ff00]/5 hover:bg-[#d4ff00]/10 text-[#d4ff00] font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 px-3"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Demo: Autofill test climber
          </button>
        )}
      </div>

      {/* Footer support coordinates */}
      <div className="text-center text-[10px] text-gray-500 font-mono tracking-wide mt-auto pt-4 select-none">
        TAIWAN BAJYUE GPS REGISTRY V3 • OFFLINE APPROVED
      </div>

    </div>
  );
}
