import { SavedTrack } from "./data";

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string; // simple string hash or text in this safe sandboxed demo
  nickname: string;
  avatarEmoji: string; // e.g. 🌲, 🏔️, 🎒, 🦅, 🧗, ⚡
  avatarColor: string; // tailwind color class
  completedPeakIds: string[];
  savedTracks: SavedTrack[];
  joinedDate: string;
}

export interface ShareConcept {
  type: "peak" | "track" | "achievement";
  title: string;
  subtitle: string;
  peakNameCH?: string;
  peakNameEN?: string;
  height?: number;
  duration?: string;
  distance?: number;
  elevationGained?: number;
  date?: string;
}

export interface PresetPhoto {
  id: string;
  name: string;
  url: string; // simulated or real un-splash path
  hueClass: string;
}

export const PRESET_PHOTOS: PresetPhoto[] = [
  { 
    id: "jade-sunrise", 
    name: "Yushan Sunrise", 
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    hueClass: "from-amber-500/20 via-orange-600/30 to-rose-950/40"
  },
  { 
    id: "hsuehshan-forest", 
    name: "Black Forest Fir", 
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    hueClass: "from-emerald-950/40 via-emerald-800/20 to-black/60"
  },
  { 
    id: "jiaming-teardrop", 
    name: "Jiaming Angel Lake", 
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
    hueClass: "from-sky-500/10 via-blue-900/30 to-slate-950/50"
  },
  { 
    id: "qilai-north-sea", 
    name: "Qilai Sea of Clouds", 
    url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=600&q=80",
    hueClass: "from-yellow-400/20 via-purple-900/20 to-black/70"
  },
  { 
    id: "hehuanshan-green", 
    name: "Hehuan Grasslands", 
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    hueClass: "from-green-600/10 via-lime-900/20 to-slate-900/80"
  }
];
