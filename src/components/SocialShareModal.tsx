import React, { useState } from "react";
import { ShareConcept, PRESET_PHOTOS, PresetPhoto } from "../types";
import { X, Share2, Upload, Camera, Check, Sparkles, Send, Download, ExternalLink, Calendar, Compass, Footprints, TrendingUp } from "lucide-react";

interface SocialShareModalProps {
  concept: ShareConcept;
  onClose: () => void;
  userNickname: string;
  userEmoji: string;
}

const SHARING_THEMES = [
  { id: " tatara-sunrise", name: "Tatara Sunrise", class: "bg-gradient-to-br from-orange-500 via-rose-600 to-indigo-950", border: "border-orange-500/30" },
  { id: "black-forest", name: "Midnight Pine", class: "bg-gradient-to-br from-emerald-950 via-[#07130c] to-black", border: "border-emerald-500/20" },
  { id: "cyber-neon", name: "Cyber Topo", class: "bg-gradient-to-br from-black via-[#050f05] to-[#122e12]", border: "border-[#d4ff00]/40" },
  { id: "glacial-mist", name: "Glacial Ice", class: "bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950", border: "border-sky-500/20" },
];

export default function SocialShareModal({ concept, onClose, userNickname, userEmoji }: SocialShareModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(SHARING_THEMES[0]);
  const [useUpload, setUseUpload] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetPhoto>(PRESET_PHOTOS[0]);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState(
    concept.type === "peak" 
      ? `Summit Completed! Standing on the high point of ${concept.peakNameCH || 'Taiwan'} (${concept.height}m)! 🏔️✨`
      : concept.type === "track"
        ? `Just logged a telemetry track run on ${concept.peakNameCH}! Distance: ${concept.distance}km in under ${(concept.duration)}!`
        : `Proud to share my Baiyue hiking progress: scaled ${concept.distance} peaks for over ${concept.elevationGained?.toLocaleString()}m total ascent!`
  );

  const [activeShareTarget, setActiveShareTarget] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  // Handle uploaded hiker photos converting to data URLs
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareClick = (platform: string) => {
    setIsProcessing(true);
    setActiveShareTarget(platform);
    setShareSuccess(null);

    // Simulate preparing card and uploading block
    setTimeout(() => {
      setIsProcessing(false);
      setShareSuccess(`Successfully shared milestone card directly to your ${platform} story!`);
      setTimeout(() => {
        setShareSuccess(null);
        setActiveShareTarget(null);
      }, 3500);
    }, 2000);
  };

  const getPhotoToDisplay = () => {
    if (useUpload && uploadedPhotoUrl) {
      return uploadedPhotoUrl;
    }
    return selectedPreset.url;
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-lg z-50 flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-[#050705] border-t border-white/10 rounded-t-[32px] max-h-[95%] flex flex-col shadow-[0_-15px_40px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Draw Line Drag helper */}
        <div className="flex justify-center py-2.5 shrink-0">
          <div className="w-12 h-1 bg-white/10 rounded-full"></div>
        </div>

        {/* Modal headers */}
        <div className="px-5 pb-2.5 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-1.5">
            <Share2 className="w-4.5 h-4.5 text-[#d4ff00]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-100">SUMMIT POSTER STUDIO</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:bg-white/15 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable controls and poster generation area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* Output Share poster mockup card */}
          <div className="flex justify-center">
            <div 
              className={`w-full max-w-[290px] rounded-3xl p-4 text-white relative shadow-2xl overflow-hidden border ${selectedTheme.border} ${selectedTheme.class} transition-all duration-500`}
              id="hiker-share-canvas"
            >
              {/* Star details / Topography mesh grids watermark */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none opacity-40"></div>
              
              {/* Header block info */}
              <div className="flex items-center justify-between relative z-10 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-sm shadow">
                    {userEmoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wide block truncate max-w-[120px] text-slate-100">
                      {userNickname}
                    </span>
                    <span className="text-[8px] text-white/50 block font-bold leading-none">TAIWAN ALPINIST</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-black text-[#d4ff00] bg-black/40 px-1.5 py-0.5 rounded-md border border-[#d4ff00]/20 inline-block font-mono">
                    BAJYUE CLUB
                  </span>
                </div>
              </div>

              {/* Center poster Graphic framed Photo space */}
              <div className="my-3 rounded-2xl overflow-hidden aspect-video relative group border border-white/10 bg-black/30">
                <img 
                  src={getPhotoToDisplay()} 
                  alt="Peak View" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                
                {/* Embedded details onto bottom of photo overlay */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
                  <div className="truncate">
                    {concept.peakNameCH && (
                      <h4 className="text-xs font-black tracking-tight text-white inline-flex items-center gap-1">
                        🏔️ {concept.peakNameCH}
                      </h4>
                    )}
                    <span className="text-[8px] block font-mono text-white/70 font-semibold truncate leading-none mt-0.5">
                      {concept.peakNameEN || "TAIWAN 100 PEAKS"}
                    </span>
                  </div>

                  {concept.height && (
                    <span className="text-[10px] font-mono font-black text-[#d4ff00] bg-black/70 px-1.5 py-0.5 rounded border border-[#d4ff00]/30 leading-none shadow">
                      {concept.height}m
                    </span>
                  )}
                </div>
              </div>

              {/* Concept Specific KPI Grid Overlay */}
              <div className="bg-black/35 backdrop-blur h-[52px] rounded-xl border border-white/5 p-2 grid grid-cols-3 gap-1 text-center font-mono my-2 relative z-10">
                {concept.type === "track" ? (
                  <>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Distance</span>
                      <span className="text-[11px] font-bold text-[#d4ff00] mt-1">{concept.distance}km</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/5">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Duration</span>
                      <span className="text-[11px] font-bold text-white mt-1">{concept.duration}</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/5">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Elevation</span>
                      <span className="text-[11px] font-bold text-emerald-400 mt-1">+{concept.elevationGained}m</span>
                    </div>
                  </>
                ) : concept.type === "peak" ? (
                  <>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Alt Peak</span>
                      <span className="text-[11px] font-bold text-[#d4ff00] mt-1">{concept.height}m</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/5">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Date Logged</span>
                      <span className="text-[10px] font-bold text-white mt-1 leading-tight">{concept.date || new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/5">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Verify status</span>
                      <span className="text-[9px] font-bold text-emerald-400 mt-1 uppercase">APPROVED</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Summits</span>
                      <span className="text-[11px] font-bold text-[#d4ff00] mt-1">{concept.distance} Peaks</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/5">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Cumulative Climb</span>
                      <span className="text-[10px] font-bold text-white mt-1 truncate">+{concept.elevationGained?.toLocaleString()}m</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/5">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">Rank Status</span>
                      <span className="text-[10px] font-bold text-sky-400 mt-1 font-bold">EXPERT</span>
                    </div>
                  </>
                )}
              </div>

              {/* Caption Text summary in card */}
              <p className="text-[10px] text-white/90 leading-tight italic line-clamp-2 px-1 py-1 text-center relative z-10 bg-black/10 rounded-lg">
                "{caption}"
              </p>

              {/* Micro-footer watermark telemetry lines */}
              <div className="flex items-center justify-between text-[7px] font-mono text-white/30 pt-3 mt-2 border-t border-white/5 min-h-[14px]">
                <span>LOC: 23°28'13.8"N 120°57'27.3"E</span>
                <span className="flex items-center gap-0.5">
                  🛡️ GPS MATCHED
                </span>
              </div>
            </div>
          </div>

          {/* Toast Notification message */}
          {shareSuccess && (
            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 animate-pulse select-none">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {shareSuccess}
            </div>
          )}

          {/* CUSTOMIZER OPTIONS BLOCKS */}
          <div className="space-y-3.5">
            
            {/* Background design selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block pl-1">Card Gradient Style</label>
              <div className="grid grid-cols-4 gap-2">
                {SHARING_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`h-11 rounded-xl transition-all relative overflow-hidden border flex items-center justify-center ${theme.class} ${
                      selectedTheme.id === theme.id ? "scale-105 border-white ring-2 ring-emerald-500/40" : "border-transparent text-white/30"
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase bg-black/40 px-1 py-0.5 rounded scale-90 relative text-white">{theme.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo selections & controls tab */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Summit Photograph source</label>
                <div className="flex rounded-md bg-black/50 border border-white/10 p-0.5 text-[8px] uppercase font-bold text-gray-400 shrink-0 select-none">
                  <button 
                    onClick={() => setUseUpload(false)}
                    className={`px-2 py-1 rounded transition-colors ${!useUpload ? "bg-white/10 text-white" : "hover:text-gray-200"}`}
                  >
                    Presets
                  </button>
                  <button 
                    onClick={() => setUseUpload(true)}
                    className={`px-2 py-1 rounded transition-colors ${useUpload ? "bg-white/10 text-white" : "hover:text-gray-200"}`}
                  >
                    Upload Own
                  </button>
                </div>
              </div>

              {!useUpload ? (
                /* Preset gallery carousel list */
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_PHOTOS.map((pic) => (
                    <button
                      key={pic.id}
                      onClick={() => setSelectedPreset(pic)}
                      className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border transition-all ${
                        selectedPreset.id === pic.id ? "border-[#d4ff00] scale-95 ring-2 ring-[#d4ff00]/20" : "border-white/5 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={pic.url} alt={pic.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                        <span className="text-[8px] text-white truncate w-full font-bold leading-none">{pic.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Real Photo Uploader and preview */
                <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <input
                    type="file"
                    id="hiker-photo-uploader-input"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  
                  {uploadedPhotoUrl ? (
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={uploadedPhotoUrl} 
                          alt="Uploaded thumb" 
                          className="w-10 h-10 object-cover rounded-lg border border-white/15" 
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-200 block">Custom photograph loaded</span>
                          <span className="text-[9px] text-gray-500 block">Ready to compile with stats</span>
                        </div>
                      </div>
                      <label 
                        htmlFor="hiker-photo-uploader-input"
                        className="text-[10px] uppercase font-bold text-[#d4ff00] bg-[#d4ff00]/10 hover:bg-[#d4ff00]/15 px-2.5 py-1.5 rounded-lg border border-[#d4ff00]/20 cursor-pointer"
                      >
                        Replace
                      </label>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-600 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-300">Share your actual climbing snapshot</h4>
                        <p className="text-[9px] text-gray-500 leading-normal max-w-[220px] mx-auto mt-0.5">
                          Load a picture taken during your hike. It renders directly onto your customizable milestone badge poster!
                        </p>
                      </div>
                      <label
                        htmlFor="hiker-photo-uploader-input"
                        className="flex items-center gap-1.5 text-xs bg-[#d4ff00] text-black font-semibold px-4 py-2 rounded-xl transition-all hover:bg-[#c3eb00] cursor-pointer shadow-md mt-2"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Select Hiker Snapshot
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Customize Caption Field text */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block pl-1">Personal Summit Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={100}
                placeholder="Share your alpine reflections..."
                className="w-full text-xs bg-black/60 border border-white/5 focus:border-[#d4ff00] placeholder-gray-600 rounded-xl p-3 text-white focus:outline-none transition-all h-16 resize-none"
              />
              <div className="text-right text-[8px] text-gray-600 font-semibold">{caption.length}/100 chars</div>
            </div>

          </div>

        </div>

        {/* Lower trigger share bar with social channel triggers */}
        <div className="p-4 bg-black border-t border-white/10 space-y-3 shrink-0 select-none">
          <div className="text-center text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">
            {isProcessing ? "Prepping Telemetry Attachments..." : "PROMPT SHARE TO PLATFORM STORIES"}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "instagram", name: "Instagram Stories", icon: "📸", color: "hover:bg-pink-600/10 hover:text-pink-500" },
              { id: "facebook", name: "Facebook Feed", icon: "👥", color: "hover:bg-blue-600/10 hover:text-blue-550" },
              { id: "twitter", name: "X (Twitter)", icon: "🐦", color: "hover:bg-white/10 hover:text-white" },
              { id: "line", name: "LINE Chat", icon: "🟢", color: "hover:bg-green-600/10 hover:text-green-500" }
            ].map((plat) => (
              <button
                key={plat.id}
                disabled={isProcessing}
                onClick={() => handleShareClick(plat.name)}
                className={`py-3 rounded-2xl bg-white/5 border border-white/5 active:scale-95 transition-all text-sm flex flex-col items-center justify-center gap-1.5 cursor-pointer ${plat.color} disabled:opacity-30`}
              >
                {isProcessing && activeShareTarget === plat.name ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"></div>
                ) : (
                  <span className="text-lg leading-none">{plat.icon}</span>
                )}
                <span className="text-[8px] font-black uppercase text-center leading-none mt-0.5 tracking-tight">{plat.id}</span>
              </button>
            ))}
          </div>

          {/* Quick download card mock button */}
          <button
            disabled={isProcessing}
            onClick={() => handleShareClick("Camera Roll / Photo Album")}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest transition-all hover:bg-gray-100 disabled:opacity-40 select-none cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Poster & Save to Camera Roll
          </button>
        </div>

      </div>
    </div>
  );
}
