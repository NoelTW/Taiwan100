import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import IosFrame from "./components/IosFrame";
import PeakDetail from "./components/PeakDetail";
import GpsCockpit from "./components/GpsCockpit";
import OfflineManager from "./components/OfflineManager";
import SafetyChecklist from "./components/SafetyChecklist";
import { TAIWAN_100_PEAKS, Peak, SavedTrack, OFFLINE_PACKS, OfflineMapPack } from "./data";
import { 
  Compass, 
  Map as MapIcon, 
  Search, 
  SlidersHorizontal, 
  History, 
  Calendar, 
  Trophy, 
  Award, 
  Flame, 
  Activity, 
  HardDrive, 
  Sparkles, 
  Send, 
  User, 
  MessageSquare,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronUp,
  Footprints,
  LogOut,
  Info,
  Share2
} from "lucide-react";
import AuthManager from "./components/AuthManager";
import SocialShareModal from "./components/SocialShareModal";
import { UserAccount, ShareConcept } from "./types";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "peaks" | "map" | "assistant" | "offline">("dashboard");
  
  // Peaks lists state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedPeak, setSelectedPeak] = useState<Peak | null>(null);
  
  // User Session & Social Share States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeShareConcept, setActiveShareConcept] = useState<ShareConcept | null>(null);

  // Persisted state via LocalStorage (loaded per-user, or with direct sync fallback)
  const [completedPeakIds, setCompletedPeakIds] = useState<string[]>([]);
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
  const [offlinePacksState, setOfflinePacksState] = useState<OfflineMapPack[]>(OFFLINE_PACKS);

  // General AI Chat Assistant State
  const [generalMessages, setGeneralMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "⛰️ Hello! I am AlpineGuide AI. Ask me anything about scaling Taiwan's 100 peaks, gear lists, cabin permits, water checkpoints, or emergency procedures." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active GPS Tracker state
  const [activeTrackingPeak, setActiveTrackingPeak] = useState<Peak | null>(null);
  const [isSimulatingHike, setIsSimulatingHike] = useState(false);
  const [currentHikerLocation, setCurrentHikerLocation] = useState<{ lat: number; lng: number; ele: number } | null>(null);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const peakMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const trackPolylineRef = useRef<L.Polyline | null>(null);
  const mapTileLayerRef = useRef<L.TileLayer | null>(null);

  // Load session & cached offline packs on mount
  useEffect(() => {
    try {
      const activeUserStr = localStorage.getItem("taiwan_100_active_user");
      if (activeUserStr) {
        const user = JSON.parse(activeUserStr) as UserAccount;
        setCurrentUser(user);
        setCompletedPeakIds(user.completedPeakIds || []);
        setSavedTracks(user.savedTracks || []);
      }

      const cachedPacks = localStorage.getItem("taiwan_100_offline_packs");
      if (cachedPacks) setOfflinePacksState(JSON.parse(cachedPacks));
    } catch (e) {
      console.error("Failed to restore cached hiker profiles", e);
    }
  }, []);

  // Multi-user database persistence helper
  const syncUserDatabase = (nextPeaks: string[], nextTracks: SavedTrack[]) => {
    if (!currentUser) return;
    try {
      const usersStr = localStorage.getItem("taiwan_100_registered_users");
      if (usersStr) {
        const users = JSON.parse(usersStr) as UserAccount[];
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx].completedPeakIds = nextPeaks;
          users[idx].savedTracks = nextTracks;
          localStorage.setItem("taiwan_100_registered_users", JSON.stringify(users));
          
          // Sync active user state in sync
          const updatedUser = { ...currentUser, completedPeakIds: nextPeaks, savedTracks: nextTracks };
          setCurrentUser(updatedUser);
          localStorage.setItem("taiwan_100_active_user", JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      console.error("Failed to sync hiker telemetry database", e);
    }
  };

  const handleUserLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setCompletedPeakIds(user.completedPeakIds || []);
    setSavedTracks(user.savedTracks || []);
    localStorage.setItem("taiwan_100_active_user", JSON.stringify(user));
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    setCompletedPeakIds([]);
    setSavedTracks([]);
    localStorage.removeItem("taiwan_100_active_user");
  };

  // Update Completed Peaks list
  const handleToggleCompleted = (peakId: string) => {
    setCompletedPeakIds(prev => {
      const next = prev.includes(peakId) ? prev.filter(id => id !== peakId) : [...prev, peakId];
      // Sync straight away to database
      setTimeout(() => {
        syncUserDatabase(next, savedTracks);
      }, 50);
      return next;
    });
  };

  // Save GPS tracks
  const handleSaveTrack = (track: SavedTrack) => {
    setSavedTracks(prev => {
      const nextTracks = [track, ...prev];
      
      let nextPeaks = completedPeakIds;
      if (!completedPeakIds.includes(track.peakId)) {
        nextPeaks = [...completedPeakIds, track.peakId];
        setCompletedPeakIds(nextPeaks);
      }

      setTimeout(() => {
        syncUserDatabase(nextPeaks, nextTracks);
      }, 50);

      return nextTracks;
    });
  };

  const handleToggleDownloadPack = (packId: string, downloaded: boolean) => {
    setOfflinePacksState(prev => {
      const next = prev.map(p => p.id === packId ? { ...p, downloaded } : p);
      localStorage.setItem("taiwan_100_offline_packs", JSON.stringify(next));
      return next;
    });
  };

  // Delete specific track log
  const handleDeleteTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTracks(prev => {
      const nextTracks = prev.filter(t => t.id !== id);
      setTimeout(() => {
        syncUserDatabase(completedPeakIds, nextTracks);
      }, 50);
      return nextTracks;
    });
  };

  // Social Milestone sharing trigger callbacks
  const handleSharePeakMilestone = (peak: Peak) => {
    setActiveShareConcept({
      type: "peak",
      title: "Summit Milestone Conquered",
      subtitle: peak.nameEN,
      peakNameCH: peak.nameCH,
      peakNameEN: peak.nameEN,
      height: peak.height,
      date: new Date().toLocaleDateString(),
    });
  };

  const handleShareTrackLog = (track: SavedTrack) => {
    setActiveShareConcept({
      type: "track",
      title: "Completed Hike Telemetry",
      subtitle: track.peakNameEN,
      peakNameCH: track.peakNameCH,
      peakNameEN: track.peakNameEN,
      height: TAIWAN_100_PEAKS.find(p => p.id === track.peakId)?.height || 3000,
      duration: `${(track.durationSeconds / 60).toFixed(0)} mins`,
      distance: track.distanceKm,
      elevationGained: track.elevationGained,
      date: track.date,
    });
  };

  const handleShareAchievements = () => {
    if (!currentUser) return;
    setActiveShareConcept({
      type: "achievement",
      title: "Alpinist Peak Progress",
      subtitle: `${completedPeakIds.length} of 100 Baiyue Peaks Scaled`,
      distance: completedPeakIds.length,
      elevationGained: TAIWAN_100_PEAKS
        .filter(p => completedPeakIds.includes(p.id))
        .reduce((sum, p) => sum + p.height, 0),
      date: new Date().toLocaleDateString(),
    });
  };

  // Initialize Map Instance (Leaflet)
  useEffect(() => {
    if (activeTab !== "map") {
      // Cleanup leaflet map instance if leaving tab to ensure zero render orphans
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        peakMarkerRef.current = null;
        userMarkerRef.current = null;
        routePolylineRef.current = null;
        trackPolylineRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double trigger in strict mode

    try {
      // 1. Initialize map view centered in central Taiwan mountain range (Yushan cluster)
      const initialLat = selectedPeak?.latitude || 23.9738;
      const initialLng = selectedPeak?.longitude || 120.9820;
      const initialZoom = selectedPeak ? 13 : 8.2;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([initialLat, initialLng], initialZoom);

      // Add elegant Esri World Topographic Tile layer
      const topoTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
      }).addTo(map);

      mapTileLayerRef.current = topoTiles;
      mapInstanceRef.current = map;

      // Draw active selected peak marker and trail polyline if available
      drawMapElements(map);
    } catch (err) {
      console.error("Leaflet initiation failure:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  // Re-draw elements whenever peak details or hiker tracks change on active map tab
  useEffect(() => {
    if (activeTab === "map" && mapInstanceRef.current) {
      drawMapElements(mapInstanceRef.current);
    }
  }, [selectedPeak, currentHikerLocation, activeTrackingPeak]);

  const drawMapElements = (map: L.Map) => {
    // 1. Clean previous graphic elements
    if (peakMarkerRef.current) map.removeLayer(peakMarkerRef.current);
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (routePolylineRef.current) map.removeLayer(routePolylineRef.current);
    if (trackPolylineRef.current) map.removeLayer(trackPolylineRef.current);

    // Custom CSS pulsing HTML elements markers
    const peakIcon = L.divIcon({
      className: "custom-peak-icon-div",
      html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 border-2 border-orange-500 shadow-xl text-xs filter drop-shadow">🏔️</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const userIcon = L.divIcon({
      className: "custom-user-icon-div",
      html: `<div class="relative flex items-center justify-center w-6 h-6"><div class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></div><div class="relative w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Determine target peak context
    const peakFocus = activeTrackingPeak || selectedPeak;

    if (peakFocus) {
      // Draw peak node marker
      const peakMarker = L.marker([peakFocus.latitude, peakFocus.longitude], { icon: peakIcon })
        .bindPopup(`<b>${peakFocus.nameCH}</b><br/>Height: ${peakFocus.height}m`)
        .addTo(map);
      peakMarkerRef.current = peakMarker;

      // Draw projected mountain trail outline
      const routeCoords = peakFocus.trailPath.map(pt => [pt.lat, pt.lng] as [number, number]);
      const routePolyline = L.polyline(routeCoords, {
        color: "#e11d48", // Rose path
        weight: 3.5,
        dashArray: "3, 6",
        opacity: 0.8
      }).addTo(map);
      routePolylineRef.current = routePolyline;

      // Center map viewport on active target
      if (!currentHikerLocation) {
        map.setView([peakFocus.latitude, peakFocus.longitude], 12);
      }
    }

    // Draw hiker's active telemetry position dot if GPS tracking is ongoing
    if (currentHikerLocation) {
      const userMarker = L.marker([currentHikerLocation.lat, currentHikerLocation.lng], { icon: userIcon })
        .bindPopup(`<b>Hiker Location</b><br/>Altitude: ${currentHikerLocation.ele}m`)
        .addTo(map);
      userMarkerRef.current = userMarker;

      // Plot line of walked steps
      if (activeTrackingPeak) {
        const pathIndices = activeTrackingPeak.trailPath;
        const currentIdx = pathIndices.findIndex(
          p => p.lat === currentHikerLocation.lat && p.lng === currentHikerLocation.lng
        );
        if (currentIdx !== -1) {
          const walkedCoords = pathIndices.slice(0, currentIdx + 1).map(pt => [pt.lat, pt.lng] as [number, number]);
          const trackPolyline = L.polyline(walkedCoords, {
            color: "#10b981", // Emerald tracker line
            weight: 4.5,
            opacity: 0.9
          }).addTo(map);
          trackPolylineRef.current = trackPolyline;
        }
      }

      // Smoothly pan map center onto hiker
      map.setView([currentHikerLocation.lat, currentHikerLocation.lng], 14.5);
    }
  };

  // Run general AI consult search stream
  const handleSendGeneralMessage = async () => {
    if (!userInput.trim()) return;
    const textPrompt = userInput;
    setUserInput("");
    setGeneralMessages(prev => [...prev, { role: "user", text: textPrompt }]);
    
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textPrompt }),
      });
      const data = await response.json();
      setGeneralMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (err) {
      console.error(err);
      setGeneralMessages(prev => [...prev, { role: "model", text: "⚠️ Server connectivity error. Check backend connection configuration." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRegisterSafetyLog = (reportText: string, aiReplyText: string) => {
    setGeneralMessages(prev => [
      ...prev,
      { role: "user", text: reportText },
      { role: "model", text: aiReplyText }
    ]);
  };

  // Filters peak directory
  const filteredPeaks = TAIWAN_100_PEAKS.filter(p => {
    const matchesSearch = 
      p.nameCH.includes(searchQuery) || 
      p.nameEN.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRange = selectedRange === "All" || p.range === selectedRange;
    const matchesDiff = selectedDifficulty === "All" || p.grade === selectedDifficulty;
    return matchesSearch && matchesRange && matchesDiff;
  });

  // Calculate stats for Hiker Achievements
  const totalSummitCount = completedPeakIds.length;
  const climbedHeightsMeters = TAIWAN_100_PEAKS
    .filter(p => completedPeakIds.includes(p.id))
    .reduce((sum, p) => sum + p.height, 0);

  const totalHikedDistanceKm = savedTracks.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalDurationHrs = (savedTracks.reduce((sum, t) => sum + t.durationSeconds, 0) / 3600).toFixed(1);

  if (!currentUser) {
    return (
      <IosFrame>
        <AuthManager onLogin={handleUserLogin} />
      </IosFrame>
    );
  }

  return (
    <IosFrame 
      activeStatusText={activeTrackingPeak ? "🛰️ RECORDING" : undefined}
      isGpsActive={!!activeTrackingPeak}
    >
      {/* Main Container Viewport */}
      <div className="flex-1 flex flex-col bg-[#050705] text-white relative overflow-hidden select-none">
        
        {/* Background Topographic Layer Simulation */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topoGrid" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M0 60 Q 30 10, 60 60 T 120 60" fill="none" stroke="#d4ff00" strokeWidth="0.6" />
                <path d="M0 30 Q 40 80, 80 30 T 160 30" fill="none" stroke="#4ade80" strokeWidth="0.4" />
                <path d="M0 90 Q 20 40, 50 90 T 100 90" fill="none" stroke="#d4ff00" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topoGrid)" />
          </svg>
        </div>

        {/* Top Header Section */}
        <header className="px-5 transition-all duration-300 py-3.5 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-md shrink-0 z-10">
          <div className="flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-[#d4ff00] animate-spin-slow" />
            <h1 className="text-xs font-bold tracking-[0.15em] text-slate-100 uppercase">
              {activeTab === "dashboard" && "Hiker Dashboard"}
              {activeTab === "peaks" && "Taiwan Peak 100"}
              {activeTab === "map" && "Topographic Radar"}
              {activeTab === "assistant" && "Alpine Safety AI"}
              {activeTab === "offline" && "Topo Downloader"}
            </h1>
          </div>
          
          {/* Active tracker header pill */}
          {activeTrackingPeak && (
            <button 
              onClick={() => {
                setSelectedPeak(activeTrackingPeak);
                setActiveTab("map");
              }}
              className="flex items-center gap-1.5 bg-[#d4ff00]/10 hover:bg-[#d4ff00]/25 border border-[#d4ff00]/25 px-2.5 py-1 rounded-full text-[10px] text-[#d4ff00] font-bold transition-all animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00]"></span>
              Live Track: {activeTrackingPeak.nameCH}
            </button>
          )}
        </header>

        {/* Dynamic viewport scroll based on Active Screen Tab */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* 1. Explore/Dashboard Screen */}
          {activeTab === "dashboard" && (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              
              {/* Premium Hiker card */}
              <div className="bg-black/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden z-10">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#d4ff00]/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentUser?.avatarColor || "from-[#d4ff00] to-green-600"} p-[1.5px] shadow-lg shadow-[#d4ff00]/5`}>
                      <div className="w-full h-full bg-[#050705] rounded-[14px] flex items-center justify-center text-xl">
                        {currentUser?.avatarEmoji || "🧗"}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-1 uppercase tracking-wide">
                        {currentUser?.nickname || "Climber"}
                        <Award className="w-4 h-4 text-[#d4ff00]" />
                      </h2>
                      <p className="text-[9px] uppercase tracking-[0.08em] text-gray-400 font-bold">Joined: {currentUser?.joinedDate || "June 2026"}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogOut}
                    className="p-1 px-2 rounded-lg bg-white/5 hover:bg-rose-950/20 text-gray-400 hover:text-rose-400 active:scale-95 transition-all text-[9.5px] font-bold border border-white/5 flex items-center gap-1 cursor-pointer"
                    title="Sign Out of Hiker Profile"
                  >
                    <LogOut className="w-3 h-3" />
                    Lock App
                  </button>
                </div>

                {/* Score numbers block */}
                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-450 block font-bold text-gray-400">Completed Peaks</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl font-mono font-black text-slate-100">{totalSummitCount}</span>
                      <span className="text-xs text-gray-500 font-bold">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-455 block font-bold text-gray-400">Summit Altitudes</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2.5xl font-mono font-black text-[#d4ff00]">{climbedHeightsMeters.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">m</span>
                    </div>
                  </div>
                </div>

                {/* Summit Completion bar meter */}
                <div className="space-y-1.5 mt-4">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                    <span className="uppercase tracking-wider">Baiyue Completion 100 Peaks</span>
                    <span className="font-mono text-[#d4ff00]">{((totalSummitCount / 100) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#050705] h-2.5 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="bg-[#d4ff05] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_#d4ff00]"
                      style={{ width: `${Math.max(1.5, (totalSummitCount / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Summit achievements share button */}
                <button
                  onClick={handleShareAchievements}
                  className="w-full mt-4 py-2 bg-white/5 hover:bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/25 hover:border-[#d4ff00]/60 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#d4ff00]" />
                  Share Accomplishments Card
                </button>
              </div>

              {/* Dynamic Hiker Badges Carousel */}
              <div className="space-y-2">
                <h3 className="text-[10px] text-[#d4ff00] uppercase font-black tracking-widest pl-1">Earned Badges</h3>
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x pr-2">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center shrink-0 w-[105px] text-center snap-center relative">
                    <Flame className={`w-6 h-6 mb-1 ${totalSummitCount > 0 ? "text-orange-500" : "text-[#d4ff00]/20"}`} />
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full">First Step</span>
                    <span className="text-[8px] text-gray-500 mt-0.5 font-bold">1 Peak</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center shrink-0 w-[105px] text-center snap-center">
                    <Trophy className={`w-6 h-6 mb-1 ${completedPeakIds.includes("yushan-main") ? "text-[#d4ff00] drop-shadow-[0_0_8px_#d4ff00]" : "text-slate-600"}`} />
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full">Jade Conqueror</span>
                    <span className="text-[8px] text-gray-500 mt-0.5 font-bold font-light">Mt Jade Done</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center shrink-0 w-[105px] text-center snap-center_disabled">
                    <Activity className={`w-6 h-6 mb-1 ${savedTracks.length > 0 ? "text-[#d4ff00]" : "text-slate-600"}`} />
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full">Telemetry Log</span>
                    <span className="text-[8px] text-gray-500 mt-0.5 font-light">GPS Checked</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center shrink-0 w-[105px] text-center snap-center">
                    <HardDrive className={`w-6 h-6 mb-1 ${offlinePacksState.some(p => p.downloaded) ? "text-[#d4ff00]" : "text-slate-600"}`} />
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full">Offline Safe</span>
                    <span className="text-[8px] text-gray-500 mt-0.5 font-light font-bold">Offline pack</span>
                  </div>
                </div>
              </div>

              {/* Saved GPS Track log lists */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pl-1">
                  <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Historical Telemetry Logs</h3>
                  <span className="text-[9px] font-mono font-black text-[#d4ff00] bg-[#d4ff00]/10 border border-[#d4ff00]/30 px-2 py-0.5 rounded-lg">
                    {savedTracks.length} HIKES
                  </span>
                </div>

                {savedTracks.length === 0 ? (
                  <div className="bg-black/30 rounded-2xl border border-white/5 p-6 text-center space-y-2.5">
                    <History className="w-7 h-7 text-gray-600 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">No telemetry logs found</h4>
                    <p className="text-[10px] text-gray-500 leading-normal max-w-[240px] mx-auto">
                      Access the Peaks list, select a mountain, and trigger **Launch Track** to simulate live tracking loops.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedTracks.map((track) => (
                      <div 
                        key={track.id}
                        onClick={() => {
                          const peak = TAIWAN_100_PEAKS.find(p => p.id === track.peakId);
                          if (peak) {
                            setSelectedPeak(peak);
                            setActiveTab("map");
                          }
                        }}
                        className="p-3 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-[#d4ff00]/30 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/25 flex items-center justify-center shrink-0">
                            <History className="w-4 h-4 text-[#d4ff00]" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-200 group-hover:text-[#d4ff00] transition-colors">
                              {track.peakNameCH}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-gray-500 flex items-center gap-0.5 font-medium">
                                <Calendar className="w-3 h-3" />
                                {track.date}
                              </span>
                              <span className="text-[10px] text-white/5">•</span>
                              <span className="text-[10px] font-sans text-[#d4ff00] font-black">
                                {track.distanceKm} km
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold text-slate-400 block">
                              {(track.durationSeconds / 60).toFixed(0)} min
                            </span>
                            <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5 text-sky-400" />
                              +{track.elevationGained}m
                            </span>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareTrackLog(track);
                            }}
                            className="p-1.5 opacity-0 group-hover:opacity-100 rounded-lg text-slate-400 hover:text-[#d4ff00] hover:bg-[#d4ff00]/10 transition-all shrink-0 cursor-pointer"
                            title="Share Hike Milestone"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            onClick={(e) => handleDeleteTrack(track.id, e)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all shrink-0 cursor-pointer"
                            title="Remove log file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Summary indicators list */}
              <div className="bg-slate-950/30 p-4 border border-slate-805/40 rounded-3xl grid grid-cols-2 gap-4">
                <div className="p-1 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Total Track Hours</span>
                  <span className="text-xl font-mono font-bold text-slate-200 mt-1 inline-block">{totalDurationHrs} h</span>
                </div>
                <div className="p-1 text-center border-l border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Total Distance Hiked</span>
                  <span className="text-xl font-mono font-bold text-slate-200 mt-1 inline-block">{totalHikedDistanceKm.toFixed(1)} km</span>
                </div>
              </div>

            </div>
          )}

          {/* 2. Peaks Finder Screen */}
          {activeTab === "peaks" && (
            <div className="flex-1 overflow-hidden flex flex-col relative">
              
              {/* Filter controls panel */}
              <div className="px-5 py-3.5 bg-black/60 border-b border-white/10 space-y-3 shrink-0">
                
                {/* Search Bar input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search peaks (e.g. Yushan, Jade, 雪山)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-black/60 border border-white/10 focus:border-[#d4ff00] rounded-xl py-2.5 pl-9 pr-4 text-white focus:outline-none transition-all"
                  />
                </div>

                {/* Categories inline filters list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider pl-0.5">
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Filter Range & Grade
                    </span>
                    <span className="text-[#d4ff00]">{filteredPeaks.length} PEAKS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <select
                      value={selectedRange}
                      onChange={(e) => setSelectedRange(e.target.value)}
                      className="bg-[#050705] border border-white/10 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-[#d4ff00]"
                    >
                      <option value="All">All Ranges</option>
                      <option value="Yushan Range">Yushan Range</option>
                      <option value="Hsuehshan Range">Hsuehshan Range</option>
                      <option value="Central Range">Central Range</option>
                    </select>

                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="bg-[#050705] border border-white/10 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-[#d4ff00]"
                    >
                      <option value="All">All Grades (A-D)</option>
                      <option value="Class A">Class A</option>
                      <option value="Class B">Class B</option>
                      <option value="Class C">Class C</option>
                      <option value="Class C+">Class C+</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Peaks card directory scroll viewport */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
                {filteredPeaks.length === 0 ? (
                  <div className="text-center py-20 space-y-2">
                    <Compass className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-slate-400 font-bold text-xs">No matching peaks found</p>
                    <p className="text-[10px] text-slate-500">Refine search text or select 'All Ranges'.</p>
                  </div>
                ) : (
                  filteredPeaks.map((peak) => {
                    const isCompleted = completedPeakIds.includes(peak.id);
                    return (
                      <div 
                        key={peak.id}
                        onClick={() => setSelectedPeak(peak)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                          isCompleted 
                            ? "bg-[#d4ff00]/10 border-[#d4ff00]/25 shadow-[0_2px_12px_rgba(212,255,0,0.05)] hover:bg-[#d4ff00]/15" 
                            : "bg-black/30 border-white/5 hover:bg-black/50 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-[70%]">
                          {/* Left node code height status mark */}
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                            isCompleted 
                              ? "bg-[#d4ff00]/15 border-[#d4ff00]/35 text-[#d4ff00]" 
                              : "bg-black/40 border-white/10 text-slate-400"
                          }`}>
                            <span className="text-[10px] font-mono font-black leading-none">{peak.height}</span>
                            <span className="text-[8px] font-mono uppercase tracking-widest mt-0.5 leading-none font-bold">m</span>
                          </div>

                          <div className="truncate">
                            <span className="text-xs font-black text-slate-200 block group-hover:text-[#d4ff00] transition-colors truncate">
                              {peak.nameCH}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium truncate block">
                              {peak.nameEN} (Grade: {peak.grade.replace("Class ", "")})
                            </span>
                          </div>
                        </div>

                        {/* Right stats indicators */}
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <span className="bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 text-[9px] px-2 py-0.5 rounded font-bold font-mono">
                              CONQUERED
                            </span>
                          ) : (
                            <span className="bg-white/5 border border-white/10 text-slate-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                              GRADE {peak.grade.replace("Class ", "")}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 group-hover:text-[#d4ff00] transition-all" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* 3. Topographic Map & Real-time GPS Tracker Screen */}
          {activeTab === "map" && (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              
              {/* Telemetry quick strip overlay */}
              <div className="absolute top-2.5 left-2.5 right-2.5 z-40 bg-slate-950/85 backdrop-blur border border-slate-800/60 p-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-2xl">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-slate-300 font-bold">
                    {activeTrackingPeak ? `Tracking: ${activeTrackingPeak.nameCH}` : (selectedPeak ? `Focus: ${selectedPeak.nameCH}` : "Browse Peak topology")}
                  </span>
                </div>
                
                {/* Visualizer detail switcher button */}
                <span className="text-[9px] font-mono text-slate-500 tracking-tighter bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                  ESRI TOPO STYLE
                </span>
              </div>

              {/* Map Canvas div */}
              <div id="map-radar" ref={mapContainerRef} className="flex-1 w-full bg-slate-950" />

              {/* Lower Cockpit sheet sliding indicator (active tracking mode layout) */}
              {activeTrackingPeak ? (
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 max-h-[70%] border-t border-slate-800 z-40 rounded-t-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-center py-2 shrink-0">
                    <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
                  </div>
                  <GpsCockpit 
                    peak={activeTrackingPeak}
                    isSimulating={isSimulatingHike}
                    setIsSimulating={setIsSimulatingHike}
                    onAbort={() => {
                      setActiveTrackingPeak(null);
                      setCurrentHikerLocation(null);
                    }}
                    onCoordinateUpdate={(lat, lng, ele) => {
                      setCurrentHikerLocation({ lat, lng, ele });
                    }}
                    onSaveTrack={(track) => {
                      handleSaveTrack(track);
                    }}
                  />
                </div>
              ) : (
                selectedPeak && (
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-40 bg-slate-950/85 backdrop-blur p-3.5 rounded-2.5xl border border-slate-800/80 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-400">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold font-mono">
                        {selectedPeak.height}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-100">{selectedPeak.nameCH}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Click for specs sheet & GPS Tracker</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPeak(selectedPeak)} // triggers Drawer open
                      className="text-xs bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl"
                    >
                      Open Specs
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* 4. Gemini Safety AI assistant */}
          {activeTab === "assistant" && (
            <div className="flex-1 overflow-hidden flex flex-col relative bg-transparent">
              
              {/* Warnings notice box */}
              <div className="px-5 py-2.5 bg-black/40 border-b border-white/5 flex items-start gap-2 text-[10px] text-gray-300 shrink-0 select-none">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#d4ff00]" />
                <p className="leading-normal text-slate-400">
                  <span className="text-[#d4ff00] font-black uppercase">Emergency Hotline</span>: Dial <span className="font-bold">112</span> if cell signal is unavailable (it routes through multi-carrier beacons). Stop, think, and prepare before acting.
                </p>
              </div>

              {/* Chat View messages & Safety Quick-Check Dashboard */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                
                {/* Interactive pre-hike checklists based on climb difficulty parameters */}
                <SafetyChecklist 
                  initialPeak={selectedPeak}
                  onRegisterLogWithAi={handleRegisterSafetyLog}
                />

                {generalMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-2.5 text-xs max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {/* Role Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      msg.role === "user" 
                        ? "bg-white/5 border-white/10 text-gray-300" 
                        : "bg-[#d4ff00]/10 border-[#d4ff50]/20 text-[#d4ff00]"
                    }`}>
                      {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-[#d4ff00]" />}
                    </div>

                    <div className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line text-[11px] ${
                      msg.role === "user" 
                        ? "bg-white/10 text-slate-200 border border-white/5 rounded-tr-none" 
                        : "bg-black/60 text-gray-300 rounded-tl-none border border-white/10"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex gap-2.5 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00] flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#d4ff00]" />
                    </div>
                    <div className="bg-black/60 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00] animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00] animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00] animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Search prompt Input line */}
              <div className="p-4 bg-black/90 border-t border-white/10 shrink-0">
                <div className="relative flex items-center bg-black/60 border border-white/10 focus-within:border-[#d4ff00] rounded-2xl px-3 py-1">
                  <input 
                    type="text"
                    disabled={isAiLoading}
                    placeholder="Ask about permit rules, gear weights, typhoon patterns..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                       if (e.key === "Enter") handleSendGeneralMessage();
                    }}
                    className="flex-1 bg-transparent border-none text-xs focus:outline-none focus:ring-0 py-2.5 text-slate-100 placeholder-gray-500"
                  />
                  <button
                    disabled={isAiLoading || !userInput.trim()}
                    onClick={handleSendGeneralMessage}
                    className="p-2.5 rounded-xl bg-[#d4ff00] hover:bg-[#c3eb00] text-black disabled:opacity-20 transition-all font-bold shadow-[0_4px_12px_rgba(212,255,0,0.15)] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 5. Offline map packages downloader */}
          {activeTab === "offline" && (
            <OfflineManager 
              packs={offlinePacksState}
              onToggleDownload={handleToggleDownloadPack}
            />
          )}

        </div>

        {/* iPhone Footer Toolbar Menu tabs navigation */}
        <footer className="h-[64px] bg-black/85 backdrop-blur-2xl border-t border-white/10 grid grid-cols-5 py-1 z-40 select-none shadow-[0_-10px_30px_rgba(212,255,0,0.05)] shrink-0">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setSelectedPeak(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "dashboard" ? "text-[#d4ff00]" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <Trophy className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold tracking-tight uppercase">Me Logs</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("peaks");
              setSelectedPeak(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "peaks" ? "text-[#d4ff00]" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold tracking-tight uppercase">Peaks</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("map");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "map" ? "text-[#d4ff00]" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <MapIcon className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold tracking-tight uppercase">Radar Map</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("assistant");
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "assistant" ? "text-[#d4ff00]" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold tracking-tight uppercase">Rescue AI</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("offline");
              setSelectedPeak(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              activeTab === "offline" ? "text-[#d4ff00]" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <HardDrive className="w-4.5 h-4.5" />
            <span className="text-[9px] font-bold tracking-tight uppercase">Offline</span>
          </button>
        </footer>

        {/* Selected Peak Bottom Specs sliding Drawer Sheet */}
        {selectedPeak && activeTab !== "assistant" && !activeTrackingPeak && (
          <PeakDetail 
            peak={selectedPeak}
            isCompleted={completedPeakIds.includes(selectedPeak.id)}
            onToggleCompleted={() => handleToggleCompleted(selectedPeak.id)}
            onClose={() => setSelectedPeak(null)}
            onStartTracking={() => {
              setActiveTrackingPeak(selectedPeak);
              setIsSimulatingHike(true);
              setActiveTab("map");
            }}
            onViewOnMap={() => {
              setActiveTab("map");
            }}
            onShare={() => handleSharePeakMilestone(selectedPeak)}
          />
        )}

        {/* Global Social Poster Custom Sharing Studio Frame */}
        {activeShareConcept && currentUser && (
          <SocialShareModal
            concept={activeShareConcept}
            onClose={() => setActiveShareConcept(null)}
            userNickname={currentUser.nickname}
            userEmoji={currentUser.avatarEmoji}
          />
        )}

      </div>
    </IosFrame>
  );
}
