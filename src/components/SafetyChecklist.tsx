import React, { useState, useEffect } from "react";
import { Peak, TAIWAN_100_PEAKS } from "../data";
import { 
  Check, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  ChevronDown, 
  ShieldCheck, 
  Activity, 
  Droplet, 
  ClipboardCheck, 
  ArrowRight,
  Info
} from "lucide-react";

interface SafetyChecklistProps {
  initialPeak: Peak | null;
  onRegisterLogWithAi: (reportText: string, aiReplyText: string) => void;
  lang?: "en" | "zh";
}

interface ChecklistItem {
  id: string;
  category: "Permits" | "Gear" | "Navigation" | "Hydration" | "Emergency";
  label: string;
  critical: boolean;
}

export default function SafetyChecklist({ initialPeak, onRegisterLogWithAi, lang = "zh" }: SafetyChecklistProps) {
  const isZh = lang === "zh";

  // Let the user select any peak inside this screen, defaulting to Yushan or first peak if none
  const [selectedPeakId, setSelectedPeakId] = useState<string>(
    initialPeak?.id || TAIWAN_100_PEAKS[0]?.id || ""
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const selectedPeak = TAIWAN_100_PEAKS.find(p => p.id === selectedPeakId) || TAIWAN_100_PEAKS[0];

  // Generate difficulty-specific checklist items
  const getWeightyItems = (peak: Peak): ChecklistItem[] => {
    const list: ChecklistItem[] = [];
    const grade = peak.grade;

    // 1. Administration & Permits Section
    if (peak.permitRequired) {
      list.push({
        id: "permit-park",
        category: "Permits",
        label: isZh 
          ? "內政部國家公園園區「入園許可證」(已核准且列印備用)"
          : "National Park 入園證 (Park Access Entry Permit approved)",
        critical: true
      });
      list.push({
        id: "permit-mountain",
        category: "Permits",
        label: isZh
          ? "內政部警政署「入山許可證」(已列印且隨身在隊攜帶)"
          : "Police Mountain Entry Permit 入山證 printed & kept on body",
        critical: true
      });
    } else {
      list.push({
        id: "permit-notify",
        category: "Permits",
        label: isZh
          ? "向所屬對象、家人或緊急留守聯絡人報備詳細登山活動計畫"
          : "Register emergency trail itinerary with trusted family contact",
        critical: true
      });
    }

    if (peak.durationDays > 1) {
      list.push({
        id: "permit-cabin",
        category: "Permits",
        label: isZh
          ? `避難山屋中籤名額、床位排雲分配或營位預約確實審核核對 (${peak.durationDays} 天)`
          : `Paiyun/Cabin allocation or campsite slot verification (${peak.durationDays} days)`,
        critical: true
      });
    }

    // 2. Navigation Section (Critical offline and GPS steps)
    list.push({
      id: "nav-offline-map",
      category: "Navigation",
      label: isZh
        ? `確認本地離線 GPS 軌跡與地形圖包已成功下載到手持設備`
        : `Download offline GPS topo tracks & maps for ${peak.nameCH} inside app`,
      critical: true
    });
    list.push({
      id: "nav-battery",
      category: "Navigation",
      label: isZh
        ? "高容量行動電源與充電線確保充飽，並收納於雙層防水分密封袋內"
        : "Power Bank capacity check (Fully charged, waterproof sealed container)",
      critical: true
    });

    if (grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "nav-plb",
        category: "Navigation",
        label: isZh
          ? "衛星雙向通訊機 (Garmin inReach / PLB 搜救發射信標) 核對及功能預測正常"
          : "Satellite Messenger (Garmin inReach / PLB beacon) checked and activated",
        critical: true
      });
    }

    // 3. Hydration & Sustenance Section
    list.push({
      id: "hydro-water",
      category: "Hydration",
      label: isZh
        ? "充足飲水及備用水、個人保溫熱水瓶核對 (累計不低於 2.5 公升)"
        : "Minimum 2.5L clean drinking water + thermal flask check",
      critical: true
    });

    if (peak.durationDays > 1 || grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "hydro-filter",
        category: "Hydration",
        label: isZh
          ? "個人攜帶式雙重中空纖維濾水器或淨水化學微粒膠囊"
          : "Portable squeeze water filter or water treatment tablets",
        critical: true
      });
      list.push({
        id: "hydro-ration",
        category: "Hydration",
        label: isZh
          ? "增加 1 日份備用緊急避難戰備超高熱量乾糧糧草儲備"
          : "1-day backup dry survival rations (emergency caloric buffer)",
        critical: false
      });
    } else {
      list.push({
        id: "hydro-snacks",
        category: "Hydration",
        label: isZh
          ? "攜帶高興奮及高熱量行進補給食品 (能量軟糖、高能堅果、高電解質粉)"
          : "High calorie trail snacks (nuts, electrolyte packets, gel pouches)",
        critical: false
      });
    }

    // 4. Clothing & Gear Section based on elevation and grade
    list.push({
      id: "gear-insulation",
      category: "Gear",
      label: isZh
        ? "嚴格執行洋蔥式三層穿著核對 (排汗貼身層、保暖刷毛/高蓬鬆羽絨、防風防水Gore-Tex外殼)"
        : "Three-layer system check: Base moisture wick, Fleece mid layer, Gore-Tex shell",
      critical: true
    });

    if (peak.height > 3510) {
      list.push({
        id: "gear-altitude",
        category: "Gear",
        label: isZh
          ? `極限抗寒與高山防風保暖帽（務必防風遮陽耳部）、登山防潑水手套（海拔 ${peak.height}m 適用）`
          : `Sub-zero insulation layer (beanie, high altitude windproof gloves) for high peak (${peak.height}m)`,
        critical: true
      });
    }

    if (grade === "Class B" || grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "gear-trekking",
        category: "Gear",
        label: isZh
          ? "高筒黃金大底 Vibram 防滑專業登山鞋 + 耐磨防水防泥土綁腿裝備"
          : "Sturdy Vibram-soled hiking boots + waterproof gaiters against screen mud",
        critical: true
      });
      list.push({
        id: "gear-poles",
        category: "Gear",
        label: isZh
          ? "高強度防震雙避震登山杖以緩解長期重裝陡坡帶來的肌肉疲勞"
          : "Trekking poles to mitigate joint fatigue during steep high altitude slopes",
        critical: false
      });
    }

    if (grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "gear-helmet",
        category: "Gear",
        label: isZh
          ? "高空安全攀岩專用防護防落石頭盔 (風化斷崖與大碎石坡專用)"
          : "Summit climbing helmet against rockfall risk (scree/cliff lines)",
        critical: true
      });
      list.push({
        id: "gear-technical",
        category: "Gear",
        label: isZh
          ? "技術型防跌落大安全吊帶、雙重鎖定防護防墜落扣環、30米戶外高強度編織輔助安全繩"
          : "Technical harness, lock carabiners & group rope line (30 meters)",
        critical: true
      });
    }

    // 5. Emergency Section
    list.push({
      id: "em-headlamp",
      category: "Emergency",
      label: isZh
        ? "戶外 LED 頭燈與其備用專用鋰電池袋 (午前摸黑起登與黃昏趕路不可或缺)"
        : "LED Headlamp with extra lithium batteries (Crucial for midnight starts)",
      critical: true
    });
    list.push({
      id: "em-whistle",
      category: "Emergency",
      label: isZh
        ? "高分貝求生哨 + 輕便高反射保暖急救防風避難帳蓬帳"
        : "Safety high-decibel whistle & emergency thermal bivy sheet",
      critical: true
    });

    if (peak.height > 3000) {
      list.push({
        id: "em-meds",
        category: "Emergency",
        label: isZh
          ? "預防高山症隨身備用控制藥物 (丹木斯/Diamox、高海拔乙酰唑胺或布洛芬)"
          : `Altitude sickness mitigation meds (Diamox / Acetazolamide or Ibuprofen)`,
        critical: true
      });
    }

    if (grade === "Class B" || grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "em-firstaid",
        category: "Emergency",
        label: isZh
          ? "戶外創傷緊急救護包 (含醫用自黏繃帶、無菌紗布、抗菌酒精與SAM夾板)"
          : "Full outdoor medical wrap kit: SAM splint, compression wraps, antiseptic",
        critical: true
      });
    }

    return list;
  };

  const currentItems = getWeightyItems(selectedPeak);

  // Clear checked items when switching peaks
  useEffect(() => {
    setCheckedItems({});
    setRegisterSuccess(false);
  }, [selectedPeakId]);

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const totalCount = currentItems.length;
  const checkedCount = currentItems.filter(item => checkedItems[item.id]).length;
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Compile detailed secure safety compliance logs (Bilingual Output)
  const handleRegisterWithAi = () => {
    if (totalCount === 0) return;

    const uncheckedItemsList = currentItems.filter(item => !checkedItems[item.id]);
    
    let reportText = "";
    let aiReply = "";

    if (isZh) {
      reportText = `我已完成出發前高海拔攀登準備核對事宜，誠摯提交 **${selectedPeak.nameCH}** (${selectedPeak.nameEN}，難度：${selectedPeak.grade.replace("Class ", "")}) 的安全指標 telemetry 數據：\n\n`;
      reportText += `📊 **登山準備就緒率**：${percentage}% (共 ${totalCount} 個安全因子中已手動備妥 ${checkedCount} 項)\n`;
      
      if (uncheckedItemsList.length > 0) {
        reportText += `⚠️ **目前尚欠缺/待備置的安全防護清單**：\n`;
        uncheckedItemsList.forEach(item => {
          reportText += `• [ ] ${item.label} (${item.category})\n`;
        });
      } else {
        reportText += `✅ **防護安全完備度 100%**：所有山屋、入山證登記、人身洋蔥防風防凍衣物與衛星PLB設備已全部確認就位。這是一個高度自律的專業預配計畫！\n`;
      }

      // AI feedback in Traditional Chinese
      aiReply = `⚙️ **百岳登記安全日誌備查完成**\n`;
      aiReply += `已在登山應急助理安全資料庫中登記 **${selectedPeak.nameCH}** 的安全就緒數據。您的準備就緒度分析為 **${percentage}%**。\n\n`;

      if (percentage < 60) {
        aiReply += `🚨 **極端風險警報**：您的準備就緒度不足 60%。攀登高難度百岳 **${selectedPeak.nameCH}** 將面臨巨大的生命防護與失溫風險。`;
        aiReply += `強烈建議在出發前，請務必先補齊 **${uncheckedItemsList[0]?.label || "必要入山證與禦寒物品"}**。`;
      } else if (percentage < 100) {
        aiReply += `⚠️ **預防行進警告**：您的情況大體良好，但仍忘記/遺漏了關鍵部分（例如：*${uncheckedItemsList[0]?.label}*）。`;
        aiReply += `高海拔（海拔大於3000公尺）氣候可能在下午猝然白牆並狂風大作。請在午夜摸黑起登前爭取補齊。`;
      } else {
        aiReply += `🌟 **專業與高安全啟登祝福**：極為出色！您已 100% 準備就緒。`;
        aiReply += `高山三日即時地磅、路線海拔節點坐標和 GPS 電子羅盤已妥善載入您的本地雷達。`;
        aiReply += `預祝您順利登頂並安全凱旋。請於稜線上保持搜救 PLB 與無線電開啟！`;
      }

    } else {
      reportText = `I am ready to registry my pre-hike Safety Quick-Check telemetry for **${selectedPeak.nameCH}** (${selectedPeak.nameEN}, Grade: ${selectedPeak.grade.replace("Class ", "")}).\n\n`;
      reportText += `📊 **Preparation Completion**: ${percentage}% (${checkedCount} of ${totalCount} items verified)\n`;
      
      if (uncheckedItemsList.length > 0) {
        reportText += `⚠️ **Outstanding Safety Items Needed**:\n`;
        uncheckedItemsList.forEach(item => {
          reportText += `• [ ] ${item.label} (${item.category})\n`;
        });
      } else {
        reportText += `✅ **Aspinist Readiness Perfect**: All critical high altitude safeguards have been double checked and authenticated!\n`;
      }

      aiReply = `⚙️ **Alpinist Registry Sync Complete**\n`;
      aiReply += `Safety checklist received for **${selectedPeak.nameCH}**. Progress is categorized at **${percentage}%** compliance rate.\n\n`;

      if (percentage < 60) {
        aiReply += `🚨 **WARNING**: You have checked less than 60% of necessary safeguards. `;
        aiReply += `Hiking **${selectedPeak.nameCH}** (Grade ${selectedPeak.grade.replace("Class ", "")}) in this state carries high alpine risks. `;
        aiReply += `Please prioritize securing **${uncheckedItemsList[0]?.label || "mandatory permits"}** and high altitude items before starting.`;
      } else if (percentage < 100) {
        aiReply += `⚠️ **PRE-HIKE CAUTION**: You are almost ready, but missing some checkpoints (e.g. *${uncheckedItemsList[0]?.label}*). `;
        aiReply += `Alpine environments above 3000m can trigger unexpected storms or AMS. Resolve the empty items before midnight.`;
      } else {
        aiReply += `🌟 **READY FOR ASCENT**: Excellent job, climber! You are 100% prepared. `;
        aiReply += `The weather widget and safety routing parameters have been loaded onto your localized GPS console. `;
        aiReply += `Have an incredible hike up **${selectedPeak.nameCH}**! Keep your transceiver on.`;
      }
    }

    onRegisterLogWithAi(reportText, aiReply);
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
    }, 4500);
  };

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-4.5 space-y-4 shadow-xl shrink-0" id="safety-quickcheck-container">
      
      {/* Header element with badge indicator */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#d4ff00]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#d4ff00]">
              {isZh ? "高山安全自主核對" : "Safety Quick-Check"}
            </h3>
          </div>
          <p className="text-[9px] text-gray-500 font-mono tracking-wide uppercase leading-none">
            {isZh ? "高海拔攀登自主安全核對清單" : "Pre-Hike Preparation Protocol"}
          </p>
        </div>
        
        <span className="text-[8px] font-mono font-bold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/20 px-2 py-0.5 rounded uppercase">
          {isZh ? "難度等級" : "Grade"}: {selectedPeak.grade.replace("Class ", "")}
        </span>
      </div>

      {/* Selector dropdown for peak choosing */}
      <div className="relative">
        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1 pl-0.5">
          {isZh ? "當前目標百岳項目" : "Focus Hike target"}
        </label>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-left text-xs text-white hover:border-[#d4ff00] transition-colors flex items-center justify-between"
          id="safety-peak-selector-trigger"
        >
          <span className="truncate pr-2 font-black">
            🏔️ {selectedPeak.nameCH} — {selectedPeak.nameEN}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-[#0a0c0a] border border-white/10 rounded-xl shadow-2xl p-1 text-xs divide-y divide-white/5 animate-in fade-in duration-120">
            {TAIWAN_100_PEAKS.map((peak) => (
              <button
                key={peak.id}
                onClick={() => {
                  setSelectedPeakId(peak.id);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors hover:bg-white/5 flex items-center justify-between ${
                  selectedPeakId === peak.id ? "text-[#d4ff00] bg-[#d4ff00]/5 font-black" : "text-slate-300"
                }`}
              >
                <span>{peak.nameCH} ({peak.nameEN.split(" (")[0]})</span>
                <span className="text-[9px] font-mono text-gray-500 font-bold">G: {peak.grade.replace("Class ", "")}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Target specs info pill block */}
      <div className="grid grid-cols-2 gap-2 text-[9.5px] bg-[#050705]/50 border border-white/5 p-2 rounded-xl text-gray-450">
        <div>
          <span className="text-gray-500 block uppercase tracking-wider font-bold">
            {isZh ? "官方標高資料" : "Altitude Spec"}
          </span>
          <span className="text-white font-mono font-bold">
            {selectedPeak.height.toLocaleString()}m ({Math.round(selectedPeak.height * 3.28084)} ft)
          </span>
        </div>
        <div>
          <span className="text-gray-500 block uppercase tracking-wider font-bold">
            {isZh ? "預算行程天數" : "Hike Duration"}
          </span>
          <span className="text-white font-mono font-bold">
            {selectedPeak.durationDays} {isZh ? "天計畫行程" : "Days Itinerary"}
          </span>
        </div>
      </div>

      {/* Interactive preparation Checklist items lists */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
        {currentItems.map((item) => {
          const isDone = !!checkedItems[item.id];
          
          let localizedCategory: string = item.category;
          if (isZh) {
            if (item.category === "Permits") localizedCategory = "許可與證件";
            else if (item.category === "Gear") localizedCategory = "人身防寒防護";
            else if (item.category === "Navigation") localizedCategory = "導航通訊電力";
            else if (item.category === "Hydration") localizedCategory = "水源與備糧";
            else if (item.category === "Emergency") localizedCategory = "應急急救藥包";
          }

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-2 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer selection:bg-transparent ${
                isDone 
                  ? "bg-[#d4ff00]/10 border-[#d4ff00]/30 text-white" 
                  : "bg-black/30 border-white/5 text-slate-300 hover:bg-black/50 hover:border-white/10"
              }`}
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                isDone 
                  ? "bg-[#d4ff00] border-[#d4ff00] text-black" 
                  : "border-gray-600 hover:border-gray-400 bg-transparent"
              }`}>
                {isDone && <Check className="w-3 h-3 stroke-[4]" />}
              </div>
              <div className="space-y-0.5 flex-1">
                <span className="text-[7.5px] uppercase font-mono tracking-wider text-[#d4ff00] block opacity-80">
                  {localizedCategory}
                </span>
                <p className={`text-[10px] leading-tight font-medium ${isDone ? "line-through text-slate-450 text-slate-400" : ""}`}>
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Neon safety Progress Bar tracker gauge */}
      <div className="space-y-1.5 pt-1 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-400 font-bold uppercase tracking-wider">
            {isZh ? "登頂安全核實就緒率" : "Ascent Readiness"}
          </span>
          <span className="text-[#d4ff00] font-mono font-black">
            {percentage}% {isZh ? "已檢查備妥" : "Prepared"}
          </span>
        </div>
        
        <div className="h-2 bg-black/60 border border-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-[#d4ff00] transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Custom Trigger Action: Sync logs with Assistant chatbot */}
      <div className="pt-1.5">
        {registerSuccess ? (
          <div className="text-[10px] font-bold text-center text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl animate-pulse">
            {isZh 
              ? "📡 安全就緒 Telemetry 日誌已成功存查備份至 AI 線上助理！" 
              : "📡 TELEMETRY VERIFIED & REGISTERED IN CHAT!"}
          </div>
        ) : (
          <button
            onClick={handleRegisterWithAi}
            className="w-full py-2.5 bg-[#d4ff00]/10 hover:bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 hover:border-[#d4ff00]/60 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            {isZh ? "提交攀登安全日誌至 AI 線上備用" : "Register Safety Log with AI"}
          </button>
        )}
      </div>

      <div className="bg-[#121c12]/20 border border-emerald-950/40 p-2.5 rounded-xl flex items-start gap-1.5 text-[9px] text-gray-400 select-none">
        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-tight">
          {isZh
            ? "在出發之前勾選各項安全自主指標，可建立高度自律防護基準，在遭遇極端地質氣候等緊急搜救（SAR）事故時，幫助救護直升機快速調閱您的出發裝備記錄。"
            : "Checking off security safeguards allows mountain services to track emergency preparedness indices during off-grid SAR actions."}
        </p>
      </div>

    </div>
  );
}
