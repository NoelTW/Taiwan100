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
}

interface ChecklistItem {
  id: string;
  category: "Permits" | "Gear" | "Navigation" | "Hydration" | "Emergency";
  label: string;
  critical: boolean;
}

export default function SafetyChecklist({ initialPeak, onRegisterLogWithAi }: SafetyChecklistProps) {
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
        label: "National Park 入園證 (Park Access Entry Permit approved)",
        critical: true
      });
      list.push({
        id: "permit-mountain",
        category: "Permits",
        label: "Police Mountain Entry Permit 入山證 printed & kept on body",
        critical: true
      });
    } else {
      list.push({
        id: "permit-notify",
        category: "Permits",
        label: "Register emergency trail itinerary with trusted family contact",
        critical: true
      });
    }

    if (peak.durationDays > 1) {
      list.push({
        id: "permit-cabin",
        category: "Permits",
        label: `Paiyun/Cabin allocation or campsite slot verification (${peak.durationDays} days)`,
        critical: true
      });
    }

    // 2. Navigation Section (Critical offline and GPS steps)
    list.push({
      id: "nav-offline-map",
      category: "Navigation",
      label: `Download offline GPS topo tracks & maps for ${peak.nameCH} inside app`,
      critical: true
    });
    list.push({
      id: "nav-battery",
      category: "Navigation",
      label: "Power Bank capacity check (Fully charged, waterproof sealed container)",
      critical: true
    });

    if (grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "nav-plb",
        category: "Navigation",
        label: "Satellite Messenger (Garmin inReach / PLB beacon) checked and activated",
        critical: true
      });
    }

    // 3. Hydration & Sustenance Section
    list.push({
      id: "hydro-water",
      category: "Hydration",
      label: "Minimum 2.5L clean drinking water + thermal flask check",
      critical: true
    });

    if (peak.durationDays > 1 || grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "hydro-filter",
        category: "Hydration",
        label: "Portable squeeze water filter or water treatment tablets",
        critical: true
      });
      list.push({
        id: "hydro-ration",
        category: "Hydration",
        label: "1-day backup dry survival rations (emergency caloric buffer)",
        critical: false
      });
    } else {
      list.push({
        id: "hydro-snacks",
        category: "Hydration",
        label: "High calorie trail snacks (nuts, electrolyte packets, gel pouches)",
        critical: false
      });
    }

    // 4. Clothing & Gear Section based on elevation and grade
    list.push({
      id: "gear-insulation",
      category: "Gear",
      label: "Three-layer system check: Base moisture wick, Fleece mid layer, Gore-Tex shell",
      critical: true
    });

    if (peak.height > 3500) {
      list.push({
        id: "gear-altitude",
        category: "Gear",
        label: `Sub-zero insulation layer (beanie, high altitude windproof gloves) for high peak (${peak.height}m)`,
        critical: true
      });
    }

    if (grade === "Class B" || grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "gear-trekking",
        category: "Gear",
        label: "Sturdy Vibram-soled hiking boots + waterproof gaiters against screen mud",
        critical: true
      });
      list.push({
        id: "gear-poles",
        category: "Gear",
        label: "Trekking poles to mitigate joint fatigue during steep high altitude slopes",
        critical: false
      });
    }

    if (grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "gear-helmet",
        category: "Gear",
        label: "Summit climbing helmet against rockfall risk (scree/cliff lines)",
        critical: true
      });
      list.push({
        id: "gear-technical",
        category: "Gear",
        label: "Technical harness, lock carabiners & group rope line (30 meters)",
        critical: true
      });
    }

    // 5. Emergency Section
    list.push({
      id: "em-headlamp",
      category: "Emergency",
      label: "LED Headlamp with extra lithium batteries (Crucial for midnight starts)",
      critical: true
    });
    list.push({
      id: "em-whistle",
      category: "Emergency",
      label: "Safety high-decibel whistle & emergency thermal bivy sheet",
      critical: true
    });

    if (peak.height > 3000) {
      list.push({
        id: "em-meds",
        category: "Emergency",
        label: `Altitude sickness mitigation meds (Diamox / Acetazolamide or Ibuprofen)`,
        critical: true
      });
    }

    if (grade === "Class B" || grade === "Class C" || grade === "Class C+" || grade === "Class D") {
      list.push({
        id: "em-firstaid",
        category: "Emergency",
        label: "Full outdoor medical wrap kit: SAM splint, compression wraps, antiseptic",
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

  // Compile detailed secure safety compliance logs
  const handleRegisterWithAi = () => {
    if (totalCount === 0) return;

    const uncheckedItemsList = currentItems.filter(item => !checkedItems[item.id]);
    
    let reportText = `I am ready to registry my pre-hike Safety Quick-Check telemetry for **${selectedPeak.nameCH}** (${selectedPeak.nameEN}, Grade: ${selectedPeak.grade.replace("Class ", "")}).\n\n`;
    reportText += `📊 **Preparation Completion**: ${percentage}% (${checkedCount} of ${totalCount} items verified)\n`;
    
    if (uncheckedItemsList.length > 0) {
      reportText += `⚠️ **Outstanding Safety Items Needed**:\n`;
      uncheckedItemsList.forEach(item => {
        reportText += `• [ ] ${item.label} (${item.category})\n`;
      });
    } else {
      reportText += `✅ **Aspinist Readiness Perfect**: All critical high altitude safeguards have been double checked and authenticated!\n`;
    }

    // Dynamic model customized response based on readiness factor and grade level
    let aiReply = `⚙️ **Alpinist Registry Sync Complete**\n`;
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

    onRegisterLogWithAi(reportText, aiReply);
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
    }, 4000);
  };

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-4.5 space-y-4 shadow-xl shrink-0" id="safety-quickcheck-container">
      
      {/* Header element with badge indicator */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#d4ff00]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#d4ff00]">Safety Quick-Check</h3>
          </div>
          <p className="text-[9px] text-gray-500 font-mono tracking-wide uppercase leading-none">Pre-Hike Preparation Protocol</p>
        </div>
        
        <span className="text-[8px] font-mono font-bold bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/20 px-2 py-0.5 rounded uppercase">
          Grade: {selectedPeak.grade.replace("Class ", "")}
        </span>
      </div>

      {/* Selector dropdown for peak choosing */}
      <div className="relative">
        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1 pl-0.5">
          Focus Hike target
        </label>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-left text-xs text-white hover:border-[#d4ff00] transition-colors flex items-center justify-between"
          id="safety-peak-selector-trigger"
        >
          <span className="truncate pr-2 font-black">
            🏔️ {selectedPeak.nameCH} — {selectedPeak.nameEN}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${dropdownOpen ? "rotate-185" : ""}`} />
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
          <span className="text-gray-500 block uppercase tracking-wider font-bold">Altitude Spec</span>
          <span className="text-white font-mono font-bold">{selectedPeak.height.toLocaleString()}m ({Math.round(selectedPeak.height * 3.28084)} ft)</span>
        </div>
        <div>
          <span className="text-gray-500 block uppercase tracking-wider font-bold">Hike Duration</span>
          <span className="text-white font-mono font-bold">{selectedPeak.durationDays} Days Itinerary</span>
        </div>
      </div>

      {/* Interactive preparation Checklist items lists */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
        {currentItems.map((item) => {
          const isDone = !!checkedItems[item.id];
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
                  {item.category}
                </span>
                <p className={`text-[10px] leading-tight font-medium ${isDone ? "line-through text-slate-400" : ""}`}>
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
          <span className="text-gray-400 font-bold uppercase tracking-wider">Ascent Readiness</span>
          <span className="text-[#d4ff00] font-mono font-black">{percentage}% Prepared</span>
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
            📡 TELEMETRY VERIFIED & REGISTERED IN CHAT!
          </div>
        ) : (
          <button
            onClick={handleRegisterWithAi}
            className="w-full py-2.5 bg-[#d4ff00]/10 hover:bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 hover:border-[#d4ff00]/60 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            Register Safety Log with AI
          </button>
        )}
      </div>

      <div className="bg-[#121c12]/20 border border-emerald-950/40 p-2.5 rounded-xl flex items-start gap-1.5 text-[9px] text-gray-400 select-none">
        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-tight">
          Checking off security safeguards allows mountain services to track emergency preparedness indices during off-grid SAR actions.
        </p>
      </div>

    </div>
  );
}
