import React, { useState } from "react";
import { ShareConcept, PRESET_PHOTOS, PresetPhoto } from "../types";
import { X, Share2, Upload, Camera, Check, Download } from "lucide-react";

interface SocialShareModalProps {
  concept: ShareConcept;
  onClose: () => void;
  userNickname: string;
  userEmoji: string;
  lang?: string;
}

const SHARING_THEMES = [
  { id: "tatara-sunrise", name: "Tatara Sunrise", zhName: "塔塔加日出", class: "bg-gradient-to-br from-orange-500 via-rose-600 to-indigo-950", border: "border-orange-500/30" },
  { id: "black-forest", name: "Midnight Pine", zhName: "午夜松林", class: "bg-gradient-to-br from-emerald-950 via-[#07130c] to-black", border: "border-emerald-500/20" },
  { id: "cyber-neon", name: "Cyber Topo", zhName: "賽博等高線", class: "bg-gradient-to-br from-black via-[#050f05] to-[#122e12]", border: "border-[#d4ff00]/40" },
  { id: "glacial-mist", name: "Glacial Ice", zhName: "冰河薄霧", class: "bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950", border: "border-sky-500/20" },
];

export default function SocialShareModal({ concept, onClose, userNickname, userEmoji, lang }: SocialShareModalProps) {
  const isZh = lang === "zh";
  const [selectedTheme, setSelectedTheme] = useState(SHARING_THEMES[0]);
  const [useUpload, setUseUpload] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetPhoto>(PRESET_PHOTOS[0]);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState(() => {
    if (isZh) {
      return concept.type === "peak" 
        ? `順利登頂！成功站在 ${concept.peakNameCH || '台灣百岳'} (${concept.height}m) 的巔峰之處！🏔️✨`
        : concept.type === "track"
          ? `剛新增了 ${concept.peakNameCH} 的登山紀錄！里程：${concept.distance}公里，耗時約 ${(concept.duration?.replace("mins", "分鐘") || "")}！`
          : `很榮幸分享我的台灣百岳攀登進度：已成功征服 ${concept.distance} 座高峰，累計海拔高達 ${concept.elevationGained?.toLocaleString()} 公尺！`;
    }
    return concept.type === "peak" 
      ? `Summit Completed! Standing on the high point of ${concept.peakNameCH || 'Taiwan'} (${concept.height}m)! 🏔️✨`
      : concept.type === "track"
        ? `Just logged a telemetry track run on ${concept.peakNameCH}! Distance: ${concept.distance}km in under ${(concept.duration)}!`
        : `Proud to share my Baiyue hiking progress: scaled ${concept.distance} peaks for over ${concept.elevationGained?.toLocaleString()}m total ascent!`;
  });

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

    // Translate platform name if needed
    let displayPlatform = platform;
    if (isZh) {
      if (platform === "Instagram Stories") displayPlatform = "Instagram 限時動態";
      else if (platform === "Facebook Feed") displayPlatform = "Facebook 貼文動態";
      else if (platform === "X (Twitter)") displayPlatform = "X / Twitter";
      else if (platform === "LINE Chat") displayPlatform = "LINE 好友對話";
      else if (platform === "Camera Roll / Photo Album") displayPlatform = "手機相簿";
    }

    // Simulate preparing card and uploading block
    setTimeout(() => {
      setIsProcessing(false);
      if (isZh) {
        setShareSuccess(`已成功將您的攀登榮譽卡分享至 ${displayPlatform}！`);
      } else {
        setShareSuccess(`Successfully shared milestone card directly to your ${displayPlatform} story!`);
      }
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

  const getPresetPhotoName = (pic: PresetPhoto) => {
    if (!isZh) return pic.name;
    switch (pic.id) {
      case "jade-sunrise": return "玉山日出";
      case "hsuehshan-forest": return "雪山黑森林";
      case "jiaming-teardrop": return "嘉明湖天使眼淚";
      case "qilai-north-sea": return "奇萊山雲海";
      case "hehuanshan-green": return "合歡山綠色草原";
      default: return pic.name;
    }
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
          <div className="flex items-center gap-1.5 font-sans">
            <Share2 className="w-4.5 h-4.5 text-[#d4ff00]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-100">
              {isZh ? "榮譽卡製作美化" : "SUMMIT POSTER STUDIO"}
            </h3>
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
                <div className="flex items-center gap-2 font-sans">
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-sm shadow">
                    {userEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wide block truncate max-w-[120px] text-slate-100">
                      {userNickname}
                    </span>
                    <span className="text-[8px] text-white/50 block font-bold leading-none">
                      {isZh ? "台灣百岳登山家" : "TAIWAN ALPINIST"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-black text-[#d4ff00] bg-black/40 px-1.5 py-0.5 rounded-md border border-[#d4ff00]/20 inline-block font-mono">
                    {isZh ? "百岳俱樂部" : "BAJYUE CLUB"}
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
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between select-none">
                  <div className="truncate pr-1">
                    {concept.peakNameCH && (
                      <h4 className="text-xs font-black tracking-tight text-white inline-flex items-center gap-1">
                        🏔️ {concept.peakNameCH}
                      </h4>
                    )}
                    <span className="text-[8px] block font-mono text-white/70 font-semibold truncate leading-none mt-0.5">
                      {isZh ? "台灣百岳之美" : (concept.peakNameEN || "TAIWAN 100 PEAKS")}
                    </span>
                  </div>

                  {concept.height && (
                    <span className="text-[10px] font-mono font-black text-[#d4ff00] bg-black/70 px-1.5 py-0.5 rounded border border-[#d4ff00]/30 leading-none shadow shrink-0">
                      {concept.height}m
                    </span>
                  )}
                </div>
              </div>

              {/* Concept Specific KPI Grid Overlay */}
              <div className="bg-black/35 backdrop-blur h-[52px] rounded-xl border border-white/5 p-2 grid grid-cols-3 gap-1 text-center font-mono my-2 relative z-10 select-none">
                {concept.type === "track" ? (
                  <>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "里程距離" : "Distance"}</span>
                      <span className="text-[11px] font-bold text-[#d4ff00] mt-1 truncate">{concept.distance}km</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/10">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "攀登耗時" : "Duration"}</span>
                      <span className="text-[11px] font-bold text-white mt-1 truncate">
                        {isZh ? concept.duration?.replace("mins", "分鐘") : concept.duration}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/10">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "累計爬升" : "Elevation"}</span>
                      <span className="text-[11px] font-bold text-emerald-400 mt-1 truncate">+{concept.elevationGained}m</span>
                    </div>
                  </>
                ) : concept.type === "peak" ? (
                  <>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "極頂海拔" : "Alt Peak"}</span>
                      <span className="text-[11px] font-bold text-[#d4ff00] mt-1 truncate">{concept.height}m</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/10">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "登頂日期" : "Date Logged"}</span>
                      <span className="text-[10px] font-bold text-white mt-1 leading-tight truncate">{concept.date || new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/10">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "驗證狀態" : "Verify status"}</span>
                      <span className="text-[9px] font-bold text-emerald-400 mt-1 uppercase truncate font-sans">
                        {isZh ? "驗證通過" : "APPROVED"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "登頂高峰" : "Summits"}</span>
                      <span className="text-[11px] font-bold text-[#d4ff00] mt-1 truncate">
                        {isZh ? `${concept.distance} 座` : `${concept.distance} Peaks`}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/10">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "累計爬升" : "Cumulative Climb"}</span>
                      <span className="text-[10px] font-bold text-white mt-1 truncate">+{concept.elevationGained?.toLocaleString()}m</span>
                    </div>
                    <div className="flex flex-col justify-center border-l border-white/10">
                      <span className="text-[8px] text-white/50 font-sans font-bold uppercase leading-none">{isZh ? "登山稱號" : "Rank Status"}</span>
                      <span className="text-[10px] font-bold text-sky-400 mt-1 uppercase font-bold font-sans truncate font-black">
                        {isZh ? "百岳達人" : "EXPERT"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Caption Text summary in card */}
              <p className="text-[10px] text-white/90 leading-tight italic line-clamp-2 px-2 py-1.5 text-center relative z-10 bg-black/10 rounded-lg">
                "{caption}"
              </p>

              {/* Micro-footer watermark telemetry lines */}
              <div className="flex items-center justify-between text-[7px] font-mono text-white/30 pt-3 mt-2 border-t border-white/5 min-h-[14px]">
                <span>LOC: 23°28'13.8"N 120°57'27.3"E</span>
                <span className="flex items-center gap-0.5 font-sans">
                  🛡️ {isZh ? "GPS 連線驗證" : "GPS MATCHED"}
                </span>
              </div>
            </div>
          </div>

          {/* Toast Notification message */}
          {shareSuccess && (
            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 animate-pulse select-none font-sans">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {shareSuccess}
            </div>
          )}

          {/* CUSTOMIZER OPTIONS BLOCKS */}
          <div className="space-y-3.5">
            
            {/* Background design selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block pl-1 font-sans">
                {isZh ? "卡片漸層樣式設定" : "Card Gradient Style"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SHARING_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`h-11 rounded-xl transition-all relative overflow-hidden border flex items-center justify-center ${theme.class} ${
                      selectedTheme.id === theme.id ? "scale-105 border-white ring-2 ring-emerald-500/40" : "border-transparent text-white/30"
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase bg-black/40 px-1.5 py-0.5 rounded scale-90 relative text-white font-sans">
                      {isZh ? theme.zhName : theme.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo selections & controls tab */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block font-sans">
                  {isZh ? "登頂影像來源" : "Summit Photograph source"}
                </label>
                <div className="flex rounded-md bg-black/50 border border-white/10 p-0.5 text-[8px] uppercase font-bold text-gray-400 shrink-0 select-none font-sans">
                  <button 
                    onClick={() => setUseUpload(false)}
                    className={`px-2 py-1 rounded transition-colors ${!useUpload ? "bg-white/10 text-white" : "hover:text-gray-200"}`}
                  >
                    {isZh ? "系統精選" : "Presets"}
                  </button>
                  <button 
                    onClick={() => setUseUpload(true)}
                    className={`px-2 py-1 rounded transition-colors ${useUpload ? "bg-white/10 text-white" : "hover:text-gray-200"}`}
                  >
                    {isZh ? "上傳照片" : "Upload Own"}
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
                        <span className="text-[8px] text-white truncate w-full font-bold leading-none font-sans">
                          {getPresetPhotoName(pic)}
                        </span>
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
                        <div className="text-left font-sans">
                          <span className="text-xs font-bold text-slate-200 block">{isZh ? "已成功載入自訂照片" : "Custom photograph loaded"}</span>
                          <span className="text-[9px] text-gray-400 block">{isZh ? "照片已就緒，可以輸出卡片" : "Ready to compile with stats"}</span>
                        </div>
                      </div>
                      <label 
                        htmlFor="hiker-photo-uploader-input"
                        className="text-[10px] uppercase font-bold text-[#d4ff00] bg-[#d4ff00]/10 hover:bg-[#d4ff00]/15 px-2.5 py-1.5 rounded-lg border border-[#d4ff00]/20 cursor-pointer font-sans"
                      >
                        {isZh ? "重新選擇" : "Replace"}
                      </label>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-600 animate-pulse" />
                      <div className="font-sans">
                        <h4 className="text-xs font-bold text-slate-300">{isZh ? "分享您現場的實際登頂時刻" : "Share your actual climbing snapshot"}</h4>
                        <p className="text-[9px] text-gray-500 leading-normal max-w-[220px] mx-auto mt-0.5">
                          {isZh 
                            ? "上傳您在此趟百岳行程中拍攝的手機照片，高質感影像將自動合成在此榮譽卡中！" 
                            : "Load a picture taken during your hike. It renders directly onto your customizable milestone badge poster!"
                          }
                        </p>
                      </div>
                      <label
                        htmlFor="hiker-photo-uploader-input"
                        className="flex items-center gap-1.5 text-xs bg-[#d4ff00] text-black font-semibold px-4 py-2 rounded-xl transition-all hover:bg-[#c3eb00] cursor-pointer shadow-md mt-2 font-sans"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isZh ? "從裝置選擇照片" : "Select Hiker Snapshot"}
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Customize Caption Field text */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block pl-1 font-sans">
                {isZh ? "自訂榮譽卡感言" : "Personal Summit Caption"}
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={100}
                placeholder={isZh ? "寫下你在巔峰看見的風景、風聲與內心感動..." : "Share your alpine reflections..."}
                className="w-full text-xs bg-black/60 border border-white/5 focus:border-[#d4ff00] placeholder-gray-600 rounded-xl p-3 text-white focus:outline-none transition-all h-16 resize-none"
              />
              <div className="text-right text-[8px] text-gray-550 font-semibold font-sans">{caption.length}/100 {isZh ? "字" : "chars"}</div>
            </div>

          </div>

        </div>

        {/* Lower trigger share bar with social channel triggers */}
        <div className="p-4 bg-black border-t border-white/10 space-y-3 shrink-0 select-none">
          <div className="text-center text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1 font-sans">
            {isProcessing 
              ? (isZh ? "正在彙整百岳遙測數據與影像中..." : "Prepping Telemetry Attachments...") 
              : (isZh ? "分享與輸出榮譽卡" : "PROMPT SHARE TO PLATFORM STORIES")
            }
          </div>

          <div className="grid grid-cols-4 gap-2 font-sans">
            {[
              { id: "instagram", name: "Instagram Stories", zhName: "IG動態", icon: "📸", color: "hover:bg-pink-600/10 hover:text-pink-500" },
              { id: "facebook", name: "Facebook Feed", zhName: "臉書貼文", icon: "👥", color: "hover:bg-blue-600/10 hover:text-blue-550" },
              { id: "twitter", name: "X (Twitter)", zhName: "推特", icon: "🐦", color: "hover:bg-white/10 hover:text-white" },
              { id: "line", name: "LINE Chat", zhName: "LINE分享", icon: "🟢", color: "hover:bg-green-600/10 hover:text-green-500" }
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
                <span className="text-[8px] font-black uppercase text-center leading-none mt-0.5 tracking-tight font-sans">
                  {isZh ? plat.zhName : plat.id}
                </span>
              </button>
            ))}
          </div>

          {/* Quick download card mock button */}
          <button
            disabled={isProcessing}
            onClick={() => handleShareClick("Camera Roll / Photo Album")}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest transition-all hover:bg-gray-100 disabled:opacity-40 select-none cursor-pointer font-sans"
          >
            <Download className="w-3.5 h-3.5" />
            {isZh ? "下載精彩榮譽卡並保存至裝置相簿" : "Download Poster & Save to Camera Roll"}
          </button>
        </div>

      </div>
    </div>
  );
}
