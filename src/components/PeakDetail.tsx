import React, { useState } from "react";
import { Peak } from "../data";
import { X, ShieldAlert, Footprints, ClipboardList, CheckSquare, MessageSquare, Sparkles, Navigation, CloudLightning, Loader2, ArrowUpRight, Share2 } from "lucide-react";
import PeakWeather from "./PeakWeather";

interface PeakDetailProps {
  peak: Peak;
  onClose: () => void;
  onStartTracking: () => void;
  onViewOnMap: () => void;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onShare?: () => void;
  lang?: "en" | "zh";
}

export default function PeakDetail({
  peak,
  onClose,
  onStartTracking,
  onViewOnMap,
  isCompleted,
  onToggleCompleted,
  onShare,
  lang = "zh",
}: PeakDetailProps) {
  const [aiTab, setAiTab] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const isZh = lang === "zh";

  const handleAskGemini = async (questionWord?: string) => {
    let promptText = questionWord;
    if (!promptText) {
      if (isZh) {
        promptText = `請針對攀登 ${peak.nameCH} (${peak.nameEN}) 生成一份中文的高山安全注意事項指南。包括預估天氣劇烈降溫警戒、水源補給點、國家公園入山許可和排雲山莊/山屋申請登記攻略，並提供一份適合台灣登山健行者的必備裝備清单。`;
      } else {
        promptText = `Tell me about safety precautions, water sources, permits required, and expected weather constraints for climbing ${peak.nameCH} (${peak.nameEN}). Include an equipment list tailored for standard Taiwanese climbers.`;
      }
    }
    
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
      setAiResponse(
        isZh 
          ? "⚠️ 無法取得 Gemini 專家 AI 服務，請確認您的網路狀況或 API 金鑰配置。" 
          : "⚠️ Failed to reach Gemini AlpineGuide server. Please check your networks and secret keys config."
      );
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

  // Traditional Chinese fallback tip dictionary for the main tip array
  const getLocalizedTips = (p: Peak) => {
    if (!isZh) return p.tips;
    
    // Provide gorgeous, professional translations of standard advice
    if (p.id === "yushan-main") {
      return [
        "排雲山莊 (3,402m) 屬於熱門山莊，必須提前一個月向內政部爬山登記系統參與名額抽籤。",
        "強烈建議凌晨 2:30 起步起登，以確保在晨光中抵達主峰頂觀賞日出、亦可避免午後白牆濃霧。",
        "主峰頂前的風口鐵鍊通道風力強大、地形陡峭暴露感極高，請注意手部保暖與確實抓穩。"
      ];
    }
    if (p.id === "hsuehshan-main") {
      return [
        "三六九避難山屋與營地 slot 必須提前進行登記入園許可抽籤登記。",
        "哭坡地勢陡峭且多碎石，登行時請注意呼吸節奏、調勻體力避免高山反應。",
        "黑森林冷杉純林林種茂密，大白牆大霧或降雪時極易發生方向迷失，切記依循黃色反光反光標記前進。"
      ];
    }
    return p.tips;
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
                {isZh ? peak.grade.replace("Class ", "難度等級 ") : peak.grade}
              </span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-gray-500 font-semibold">{peak.nameEN}</p>
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
            <span className="text-[#d4ff00]">▲ {peak.height} m</span>
            <span className="text-white/20">•</span>
            <span className="text-gray-400 uppercase tracking-wider">
              {isZh 
                ? (peak.range === "Yushan Range" ? "玉山山脈" : peak.range === "Hsuehshan Range" ? "雪山山脈" : peak.range === "Central Range" ? "中央山脈" : peak.range) 
                : peak.range}
            </span>
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
              {isCompleted ? (isZh ? "已登頂征服" : "CONQUERED") : (isZh ? "標記登頂" : "Mark Summit")}
            </button>

            {isCompleted && onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg border bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/30 hover:bg-[#d4ff00]/20 active:scale-95 transition-all text-white"
                title={isZh ? "分享登頂成就卡片" : "Share Summit Milestone Badge"}
              >
                <Share2 className="w-3.5 h-3.5" />
                {isZh ? "分享" : "Share"}
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
            {isZh ? "規格與縱走途徑" : "Specs & Route"}
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
            {isZh ? "Gemini 高山 AI 研判" : "Gemini Alpine AI"}
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
                  {isZh ? "百嶽名山概況" : "Peak Bio"}
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {isZh && peak.id === "yushan-main"
                    ? "玉山主峰為台灣及東北亞的第一高峰。備受當地布農族與鄒族原住民崇敬。視野遼闊無比，沿線設有完備、安全的步道防護設施與金屬鍊條，是國內最具代表性的百岳頂峰。"
                    : isZh && peak.id === "hsuehshan-main"
                      ? "雪山主峰為台灣第二高峰。以其獨特的高山植物景觀、黑森林（冷杉純林）以及主峰下宏偉壯觀的冰斗（ glacial cirque ）遺跡而聞名，四季皆有特色。"
                      : peak.description}
                </p>
              </div>

              {/* Real-time Mountain Weather Forecast */}
              <PeakWeather peak={peak} lang={lang} />

              {/* Core numbers grid */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="bg-slate-950/40 border border-slate-800/30 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                    {isZh ? "座落縣市與入山證要求" : "Location & Permits"}
                  </div>
                  <div className="text-slate-300 font-semibold text-xs truncate" title={peak.location}>
                    {isZh 
                      ? (peak.id === "yushan-main" ? "南投縣 / 嘉義縣 / 高雄市" : peak.id === "hsuehshan-main" ? "台中市 / 苗栗縣" : peak.location) 
                      : peak.location}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-1">
                    {peak.permitRequired 
                      ? (isZh ? "⚠️ 須向國家公園申辦入園證/入山證" : "⚠️ National Park Permit Required") 
                      : (isZh ? "✅ 該管轄地免入山證要求" : "✅ No permits required")}
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/30 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                    {isZh ? "預算攀登行程天數" : "Est. Walk Duration"}
                  </div>
                  <div className="text-slate-300 font-semibold text-xs">
                    {peak.durationDays} {isZh ? "天計畫行程往返" : "Days Roundtrip"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-1">
                    {isZh ? `預計約需要 ${peak.durationDays * 8} 小時實際健行` : `~${peak.durationDays * 8} hours active hiking`}
                  </div>
                </div>
              </div>

              {/* Trail checkpoints timeline */}
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  {isZh ? "登山路線海拔節點坐標" : "Route Coordinates checkpoints"}
                </h3>
                <div className="relative border-l border-slate-800 pl-4 py-1.5 space-y-3.5 ml-2">
                  {peak.pointsOfInterest.map((pt, idx) => {
                    let locName = pt.name;
                    if (isZh) {
                      // Professional local names
                      if (pt.name === "Tataka Trailhead") locName = "塔塔加登山口";
                      else if (pt.name === "Monroe Pavilion") locName = "孟祿亭觀景台";
                      else if (pt.name === "Paiyun Lodge") locName = "排雲山莊";
                      else if (pt.name === "Wind tunnel (Chain crossing)") locName = "風口防護鐵鍊區";
                      else if (pt.name === "Yushan Main Peak Summit") locName = "玉山主峰頂峰";
                      else if (pt.name === "Shei-Pa Wuling Trailhead") locName = "雪霸武陵登山口";
                      else if (pt.name === "Qika Cabin") locName = "七卡山莊";
                      else if (pt.name === "Crying Slope") locName = "哭坡觀景平台";
                      else if (pt.name === "East Peak Peak") locName = "雪山東峰攀登點";
                      else if (pt.name === "369 Cabin Site") locName = "三六九山莊遺址";
                      else if (pt.name === "Glacial Cirque Viewpoint") locName = "雪山一號冰斗觀景點";
                      else if (pt.name === "Hsuehshan Summit") locName = "雪山主峰頂峰";
                    }
                    return (
                      <div key={idx} className="relative">
                        {/* Node Dot */}
                        <span className="absolute -left-[21px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-slate-900 border-2 border-emerald-500"></span>
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-200">{locName}</span>
                          <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800/50 px-1.5 py-0.5 rounded">
                            {pt.elevation}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hiker safety precautions */}
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-3.5">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  {isZh ? "高山安全叮嚀與要訣" : "Important preparation tips"}
                </h4>
                <ul className="space-y-1.5 text-[11px] text-amber-300 font-tight">
                  {getLocalizedTips(peak).map((tip, idx) => (
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
                  <h4 className="text-xs font-semibold text-white">
                    {isZh ? "高山安全大模型 AI 諮詢" : "Ask AlpineGuide AI"}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                    {isZh 
                      ? `我們的高海拔防護模型已啟用，將為您智慧診斷攀登 ${peak.nameCH} 的安全防寒、水屋水源配置。`
                      : `Our server-side Alpine safety model generates instant advice for scaling ${peak.nameCH}.`}
                  </p>
                </div>
              </div>

              {/* AI response content */}
              <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/40 min-h-[160px] text-xs">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    <span className="text-[11px] font-medium tracking-tight animate-pulse text-slate-300">
                      {isZh ? "正在連線智庫，為您計算極高溫溫差、高低海拔高程比與防護策略..." : "Generating specialized safety profiles..."}
                    </span>
                  </div>
                ) : aiResponse ? (
                  <div className="text-slate-300 whitespace-pre-line leading-relaxed h-[240px] overflow-y-auto pr-1">
                    {aiResponse}
                  </div>
                ) : (
                  <div className="text-slate-400 py-10 text-center text-[11px]">
                    {isZh ? "尚未載入任何安全指引，請使用下方快捷鍵獲取。" : "No preparation guides fetched yet."}
                  </div>
                )}
              </div>

              {/* Quick AI Chips triggers */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                <button
                  disabled={isAiLoading}
                  onClick={() => handleAskGemini(isZh ? `請問攀登 ${peak.nameCH} 的颱風預警制度、午後降雨氣候白牆成因以及稜線陣風防寒應變有哪些？` : `What are the seasonal weather danger conditions and typhoon rules for climbing ${peak.nameCH}?`)}
                  className="text-[10px] bg-slate-850 hover:bg-slate-800 text-slate-300 px-2 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                >
                  {isZh ? "🌧️ 氣候突變、白牆狂風與防護機制" : "🌧️ Weather & Typhoon Rules"}
                </button>
                <button
                  disabled={isAiLoading}
                  onClick={() => handleAskGemini(isZh ? `如何申辦 ${peak.nameCH} 的入園證、入山證抽籤？排雲山莊/避難山屋中籤概率、營位和留守計畫填寫指南是？` : `How do I apply for national park permits, cabin draws, and entry permissions for a hike on ${peak.nameCH}?`)}
                  className="text-[10px] bg-slate-850 hover:bg-slate-800 text-slate-300 px-2 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                >
                  {isZh ? "📝 國家公園入園登記與熱門山房抽籤攻略" : "📝 Permit & Cabin drawing guides"}
                </button>
                <button
                  disabled={isAiLoading}
                  onClick={() => handleAskGemini(isZh ? `請詳細列出沿途的活水源、看天池、避難小屋儲水箱水質，以及預計應該攜帶的淨水裝備。` : `Explain water source locations, river crossing points, and cabin water quality setups along the ${peak.nameCH} paths.`)}
                  className="text-[10px] bg-slate-850 hover:bg-slate-800 text-slate-300 px-2 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                >
                  {isZh ? "💧 沿線活水源與應急看天池分佈" : "💧 Water source sites"}
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
            {isZh ? "在地圖中定位" : "Pin on Map"}
          </button>
          
          <button
            onClick={onStartTracking}
            className="flex-1 bg-[#d4ff00] hover:bg-[#c3eb00] active:bg-[#a6ca00] text-black font-black uppercase tracking-widest text-[11px] py-4 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-[0_10px_25px_-8px_#d4ff00]"
          >
            <Footprints className="w-3.5 h-3.5" />
            {isZh ? "開啟實時記錄" : "Launch Track"}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
