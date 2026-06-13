import React, { useState } from "react";
import { Peak } from "../data";
import { X, ShieldAlert, Footprints, ClipboardList, CheckSquare, MessageSquare, Sparkles, Navigation, CloudLightning, Loader2, ArrowUpRight, Share2 } from "lucide-react";

interface PeakDetailProps {
  peak: Peak;
  onClose: () => void;
  onStartTracking: () => void;
  onViewOnMap: () => void;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onShare?: () => void;
}

export default function PeakDetail({
  peak,
  onClose,
  onStartTracking,
  onViewOnMap,
  isCompleted,
  onToggleCompleted,
  onShare,
}: PeakDetailProps) {
  const [aiTab, setAiTab] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAskGemini = async (questionWord?: string) => {
    const promptText = questionWord || `Tell me about safety precautions, water sources, permits required, and expected weather constraints for climbing ${peak.nameCH} (${peak.nameEN}). Include an equipment list tailored for standard Taiwanese climbers.`;
    
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const response = await fetch("/api/gemini/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await response.json();
      setAiResponse(data.text);
    } catch (err) {
      console.error(err);
      setAiResponse("⚠️ Failed to reach Gemini AlpineGuide server. Please check your networks and secret keys config.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const difficultyColors = {
    "Class A": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "Class B": "bg-sky-500/10 text-sky-400 border-sky-500/30",
    "Class C": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    "Class C+": "bg-orange-500/10 text-orange-400 border-orange-500/30",
    "Class D": "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end">
      {/* Drawer Body container */}
      <div className="bg-[#050705] border-t border-white/10 rounded-t-[32px] max-h-[92%] flex flex-col shadow-[0_-15px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
        
        {/* Drag handle block */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-emerald-900/40 rounded-full"></div>
        </div>

        {/* Header toolbar */}
        <div className="px-5 pb-3 flex items-start justify-between border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight uppercase">{peak.nameCH}</h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${difficultyColors[peak.grade]}`}>
                {peak.grade}
              </span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-gray-450 font-semibold">{peak.nameEN}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action utility headers */}
        <div className="bg-black/35 px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-300">
            <span className="text-[#d4ff00]">{peak.height} m</span>
            <span className="text-white/20">•</span>
            <span className="text-gray-400 uppercase tracking-wider">{peak.range}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleCompleted}
              className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                isCompleted 
                  ? "bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/40 shadow-[0_0_8px_rgba(212,255,0,0.15)]"
                  : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
              }`}
            >
              <CheckSquare className={`w-3.5 h-3.5 ${isCompleted ? 'fill-[#d4ff00]/20' : ''}`} />
              {isCompleted ? "CONQUERED" : "Mark Summit"}
            </button>

            {isCompleted && onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg border bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/30 hover:bg-[#d4ff00]/20 active:scale-95 transition-all text-white"
                title="Share Summit Milestone Badge"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 text-xs font-bold">
          <button
            onClick={() => setAiTab(false)}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider ${
              !aiTab 
                ? "border-[#d4ff05] text-[#d4ff05] bg-black/40" 
                : "border-transparent text-slate-500 hover:text-slate-350"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Specs & Route
          </button>
          <button
            onClick={() => {
              setAiTab(true);
              if (!aiResponse && !isAiLoading) {
                handleAskGemini();
              }
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider ${
              aiTab 
                ? "border-[#d4ff05] text-[#d4ff05] bg-black/40" 
                : "border-transparent text-slate-500 hover:text-slate-350"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Alpine AI
          </button>
        </div>

        {/* Tab Content scrolling frame */}
        <div className="p-5 overflow-y-auto flex-1 h-[420px] bg-slate-900/40 text-sm">
          {!aiTab ? (
            <div className="space-y-4">
              {/* Peak description block */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-emerald-500" />
                  Peak Bio
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">{peak.description}</p>
              </div>

              {/* Core numbers grid */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="bg-slate-950/40 border border-slate-800/30 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Location & Permits</div>
                  <div className="text-slate-300 font-semibold text-xs truncate" title={peak.location}>{peak.location}</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-1">
                    {peak.permitRequired ? "⚠️ National Park Permit Required" : "✅ No permits required"}
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/30 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Est. Walk Duration</div>
                  <div className="text-slate-300 font-semibold text-xs">{peak.durationDays} Days Roundtrip</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-1">~{peak.durationDays * 8} hours active hiking</div>
                </div>
              </div>

              {/* Trail checkpoints timeline */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  Route Coordinates checkpoints
                </h3>
                <div className="relative border-l border-slate-800 pl-4 py-1.5 space-y-3.5 ml-2">
                  {peak.pointsOfInterest.map((pt, idx) => (
                    <div key={idx} className="relative">
                      {/* Node Dot */}
                      <span className="absolute -left-[21px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-500"></span>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">{pt.name}</span>
                        <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded">
                          {pt.elevation}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hiker safety precautions */}
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-3.5">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Important preparation tips
                </h4>
                <ul className="space-y-1.5 text-[11px] text-amber-300 font-tight">
                  {peak.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-amber-500 font-extrabold">•</span>
                      <span className="leading-normal">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Gemini Section header */}
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/40">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Ask AlpineGuide AI</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                    Our server-side Alpine safety model generates instant advice for scaling {peak.nameCH}.
                  </p>
                </div>
              </div>

              {/* AI response content */}
              <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/40 min-h-[160px] text-xs">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    <span className="text-[11px] font-medium tracking-tight animate-pulse text-slate-300">
                      Generating specialized safety profiles...
                    </span>
                  </div>
                ) : aiResponse ? (
                  <div className="text-slate-300 whitespace-pre-line leading-relaxed h-[240px] overflow-y-auto pr-1">
                    {aiResponse}
                  </div>
                ) : (
                  <div className="text-slate-500 py-10 text-center text-[11px]">
                    No preparation guides fetched yet.
                  </div>
                )}
              </div>

              {/* Quick AI Chips triggers */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                <button
                  disabled={isAiLoading}
                  onClick={() => handleAskGemini(`What are the seasonal weather danger conditions and typhoon rules for climbing ${peak.nameCH}?`)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors"
                >
                  🌧️ Weather & Typhoon Rules
                </button>
                <button
                  disabled={isAiLoading}
                  onClick={() => handleAskGemini(`How do I apply for national park permits, cabin draws, and entry permissions for a hike on ${peak.nameCH}?`)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors"
                >
                  📝 Permit & Cabin drawing guides
                </button>
                <button
                  disabled={isAiLoading}
                  onClick={() => handleAskGemini(`Explain water source locations, river crossing points, and cabin water quality setups along the ${peak.nameCH} paths.`)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700/60 transition-colors"
                >
                  💧 Water source sites
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lower Action buttons */}
        <div className="p-4 bg-black/90 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={onViewOnMap}
            className="flex-1 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-bold uppercase tracking-wider text-[11px] py-3.5 px-4 rounded-full border border-white/10 flex items-center justify-center gap-1.5 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-[#d4ff00]" />
            Pin on Map
          </button>
          
          <button
            onClick={onStartTracking}
            className="flex-1 bg-[#d4ff00] hover:bg-[#c3eb00] active:bg-[#a6ca00] text-black font-black uppercase tracking-widest text-[11px] py-4 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-[0_10px_25px_-8px_#d4ff00]"
          >
            <Footprints className="w-3.5 h-3.5" />
            Launch Track
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
