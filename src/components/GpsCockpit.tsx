import React, { useState, useEffect, useRef } from "react";
import { Peak, SavedTrack } from "../data";
import { Play, Pause, Square, Navigation, Activity, Compass, TrendingUp, HelpCircle, Save, CheckCircle2, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface GpsCockpitProps {
  peak: Peak;
  onAbort: () => void;
  onSaveTrack: (track: SavedTrack) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  // callback when coordinate moves during hike
  onCoordinateUpdate: (lat: number, lng: number, ele: number) => void;
}

export default function GpsCockpit({
  peak,
  onAbort,
  onSaveTrack,
  isSimulating,
  setIsSimulating,
  onCoordinateUpdate,
}: GpsCockpitProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [useRealGps, setUseRealGps] = useState(false);
  
  // Hiker Metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentAltitude, setCurrentAltitude] = useState(peak.trailPath[0]?.ele || 2000);
  const [elevationGained, setElevationGained] = useState(0);
  
  // High-fidelity tracking list path
  const [trackedPoints, setTrackedPoints] = useState<{ lat: number; lng: number; ele: number; timestamp: string }[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Index pointer for path simulation
  const simulationIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Watch position ID if using actual Geolocation API
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset indicators on mount or peak swap
    setElapsedSeconds(0);
    setDistanceKm(0);
    setElevationGained(0);
    setCurrentSpeed(0);
    setCurrentAltitude(peak.trailPath[0]?.ele || 2000);
    setTrackedPoints([]);
    simulationIndexRef.current = 0;
    setSaveSuccess(false);
    setIsPlaying(false);
  }, [peak]);

  // Handle Play/Pause timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      // 1. Advance Hiker duration
      setElapsedSeconds(prev => prev + 1);

      // 2. Determine GPS tracking state
      if (useRealGps) {
        // Fetch actual web geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude, altitude, speed } = pos.coords;
              const ele = Math.round(altitude || peak.trailPath[Math.min(simulationIndexRef.current, peak.trailPath.length - 1)].ele);
              const spd = speed ? Number((speed * 3.6).toFixed(1)) : 3.2; // Convert m/s mock to km/h or standard hiking speed

              setCurrentAltitude(ele);
              setCurrentSpeed(spd);
              
              setTrackedPoints(prev => {
                const nowStr = new Date().toLocaleTimeString();
                const newPoints = [...prev, { lat: latitude, lng: longitude, ele, timestamp: nowStr }];
                
                // Calculate distance from previous point if present
                if (prev.length > 0) {
                  const last = prev[prev.length - 1];
                  const dist = getHaversineDistance(last.lat, last.lng, latitude, longitude);
                  setDistanceKm(d => Number((d + dist).toFixed(3)));
                  
                  // Ele gained
                  if (ele > last.ele) {
                    setElevationGained(eg => eg + (ele - last.ele));
                  }
                }
                
                return newPoints;
              });

              onCoordinateUpdate(latitude, longitude, ele);
            },
            (err) => {
              console.error("Geolocation error:", err);
              // Fallback to simulation if web iframe blocks geolocation
              simulateStep();
            },
            { enableHighAccuracy: true }
          );
        } else {
          simulateStep();
        }
      } else {
        // Simulator Path Step
        simulateStep();
      }

    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, useRealGps, peak]);

  // Haversine calculation
  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  // Simulates stepping along the precalculated trailpoints in data.ts
  const simulateStep = () => {
    const path = peak.trailPath;
    const currentIdx = simulationIndexRef.current;
    
    if (currentIdx >= path.length) {
      // Loop or pause at peak summit
      setIsPlaying(false);
      return;
    }

    const currentPt = path[currentIdx];
    setCurrentAltitude(currentPt.ele);
    
    // speed hikes between 3.2km/h and 5.5km/h with minor random noise
    const speedHike = Number((3.6 + Math.random() * 1.5).toFixed(1));
    setCurrentSpeed(speedHike);

    setTrackedPoints(prev => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newPoints = [...prev, { lat: currentPt.lat, lng: currentPt.lng, ele: currentPt.ele, timestamp: timeStr }];
      
      // Calculate derived variables
      if (prev.length > 0) {
        const prevPt = prev[prev.length - 1];
        const dist = getHaversineDistance(prevPt.lat, prevPt.lng, currentPt.lat, currentPt.lng);
        setDistanceKm(d => Number((d + dist).toFixed(3)));

        if (currentPt.ele > prevPt.ele) {
          setElevationGained(eg => eg + (currentPt.ele - prevPt.ele));
        }
      }
      return newPoints;
    });

    onCoordinateUpdate(currentPt.lat, currentPt.lng, currentPt.ele);
    simulationIndexRef.current = currentIdx + 1;
  };

  // Human elapsed time formulator
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${hours}:${mins}:${secs}`;
  };

  // Submits tracked walk to profile logs
  const handleSaveTrackLog = () => {
    if (trackedPoints.length === 0) return;
    
    const trackRecord: SavedTrack = {
      id: `track-${Date.now()}`,
      peakId: peak.id,
      peakNameCH: peak.nameCH,
      peakNameEN: peak.nameEN,
      date: new Date().toLocaleDateString(),
      durationSeconds: elapsedSeconds,
      distanceKm: Number(distanceKm.toFixed(2)),
      elevationGained,
      coordinatesMatchedCount: trackedPoints.length,
      points: trackedPoints
    };

    onSaveTrack(trackRecord);
    setSaveSuccess(true);
    setIsPlaying(false);
    setTimeout(() => {
      onAbort();
    }, 1500);
  };

  // Chart source structure
  const chartData = trackedPoints.map((pt, idx) => ({
    time: pt.timestamp,
    Altitude: pt.ele,
  }));

  // Render dummy initial line to display beautiful empty chart bounds
  const displayChartData = chartData.length > 0 ? chartData : [
    { time: "Start", Altitude: peak.pointsOfInterest[0]?.elevation || 2000 },
    { time: "Peak Point", Altitude: peak.height }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-transparent text-white z-10 relative">
      
      {/* Target header display */}
      <div className="bg-black/60 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/20 flex items-center justify-center">
            <Compass className="w-5 h-5 animate-spin-slow text-[#d4ff00]" />
          </div>
          <div>
            <div className="text-[9px] text-[#d4ff00] uppercase font-black tracking-widest">ACTIVE TRACK TARGET</div>
            <h3 className="text-sm font-bold text-slate-200">{peak.nameCH} ({peak.height}m)</h3>
          </div>
        </div>
        <button
          onClick={onAbort}
          className="text-[10px] uppercase font-bold text-rose-400 bg-rose-950/20 hover:bg-rose-900/30 px-3 py-1.5 rounded-lg border border-rose-900/40 font-bold transition-all"
        >
          Quit
        </button>
      </div>

      {/* GPS Switch selector */}
      <div className="grid grid-cols-2 gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10 text-xs font-semibold">
        <button
          onClick={() => {
            setUseRealGps(false);
            setIsSimulating(true);
          }}
          className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px] font-bold ${
            !useRealGps 
              ? "bg-[#d4ff00] text-black shadow-[0_3px_12px_rgba(212,255,0,0.2)]" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Simulator
        </button>
        <button
          onClick={() => {
            setUseRealGps(true);
            setIsSimulating(false);
          }}
          className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px] font-bold ${
            useRealGps 
              ? "bg-[#d4ff00] text-black shadow-[0_3px_12px_rgba(212,255,0,0.2)]" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Real-Time GPS
        </button>
      </div>

      {/* Primary KPI Grid Board */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Core Clock Time */}
        <div className="col-span-2 bg-black/60 border border-white/10 p-4 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-[9px] text-[#d4ff00] font-black tracking-[0.2em] mb-1.5 uppercase">ELAPSED TIME</div>
          <div className="text-3xl font-mono font-black text-white tracking-widest">{formatTime(elapsedSeconds)}</div>
          <div className="w-24 h-1.5 bg-[#d4ff00] shadow-[0_0_8px_#d4ff00] rounded-full mt-3"></div>
        </div>

        {/* Speed Card */}
        <div className="bg-black/35 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">SPEED</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-slate-100">{currentSpeed}</span>
            <span className="text-[10px] text-gray-500">km/h</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00]"></span>
            Hiking pace
          </p>
        </div>

        {/* Current Altitude */}
        <div className="bg-black/35 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">ALTITUDE</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-slate-100">{currentAltitude}</span>
            <span className="text-[10px] text-gray-500">m</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#d4ff00]" />
            Top: {peak.height}m
          </p>
        </div>

        {/* Total Distance */}
        <div className="bg-black/35 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">DISTANCE COVERED</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-slate-100">{distanceKm.toFixed(2)}</span>
            <span className="text-[10px] text-gray-500">km</span>
          </div>
          <p className="text-[10px] text-gray-450 mt-1 font-medium">Est total: ~{peak.durationDays * 12}km</p>
        </div>

        {/* Elevation Gained */}
        <div className="bg-black/35 border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">ELEVATION GAIN</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-bold text-[#d4ff00]">{elevationGained}</span>
            <span className="text-[10px] text-gray-500">m</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Uphill tracking</p>
        </div>

      </div>

      {/* Altitude Elevation Profile Recharts Board */}
      <div className="bg-black/60 border border-white/10 p-4 rounded-3xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Altitude Log Profile</span>
          <span className="text-[9px] font-mono font-medium text-[#d4ff00] bg-[#d4ff00]/5 px-2 py-0.5 rounded border border-[#d4ff00]/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00] animate-pulse"></span>
            RADAR ACTIVE
          </span>
        </div>
        
        <div className="h-28 w-full font-mono text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#d4ff00" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#475569', fontSize: 9 }} width={25} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050705', borderColor: '#d4ff00', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                itemStyle={{ color: '#d4ff00', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="Altitude" stroke="#d4ff00" strokeWidth={1.8} fillOpacity={1} fill="url(#colorAlt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls Button toolbar */}
      <div className="bg-black/65 p-4 rounded-3xl border border-white/10 flex flex-col gap-3">
        {saveSuccess ? (
          <div className="flex items-center justify-center gap-2 py-3.5 text-black font-extrabold text-xs bg-[#d4ff00] border border-[#d4ff00]/40 rounded-full animate-pulse uppercase tracking-[0.1em]">
            <CheckCircle2 className="w-4 h-4 text-black" />
            Track Log Saved!
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                className="flex-1 bg-[#d4ff00] hover:bg-[#c3eb00] active:bg-[#a6ca00] text-black font-black uppercase tracking-wider text-[11px] py-3.5 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-[0_6px_16px_rgba(212,255,0,0.2)]"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                {elapsedSeconds === 0 ? "START" : "RESUME"}
              </button>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] py-3.5 px-4 rounded-full flex items-center justify-center gap-1.5 transition-colors shadow-lg"
              >
                <Pause className="w-4 h-4 fill-black text-black" />
                PAUSE
              </button>
            )}

            <button
              disabled={trackedPoints.length === 0}
              onClick={handleSaveTrackLog}
              className={`flex-1 font-bold uppercase tracking-wider text-[11px] py-3.5 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all border ${
                trackedPoints.length > 0 
                  ? "bg-white text-black border-white hover:bg-gray-100" 
                  : "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" />
              SAVE RUN
            </button>
          </div>
        )}

        <div className="text-center text-[10px] text-gray-500 font-medium">
          * Telemetry simulator updates coordinate positions sequentially along trail lines.
        </div>
      </div>

    </div>
  );
}
