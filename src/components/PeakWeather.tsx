import React, { useState, useEffect } from "react";
import { Peak } from "../data";
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  CloudFog, 
  Snowflake, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  TrendingDown
} from "lucide-react";

interface PeakWeatherProps {
  peak: Peak;
  lang?: "en" | "zh";
}

interface DayForecast {
  date: string;
  weekday: string;
  tempMax: number;
  tempMin: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  advisory: string;
  advisoryLevel: "safe" | "caution" | "hazard";
}

// Convert WMO weather codes to user-friendly conditions & icons (Bilingual)
function getWeatherDetails(code: number, lang: "en" | "zh" = "zh"): { text: string; icon: React.ReactNode; bgClass: string; textClass: string } {
  const isZh = lang === "zh";
  if (code === 0) {
    return { 
      text: isZh ? "晴朗天空" : "Clear Sky", 
      icon: <Sun className="w-6 h-6 text-amber-400" />, 
      bgClass: "from-amber-950/20 to-orange-950/20 border-amber-500/15",
      textClass: "text-amber-400"
    };
  }
  if (code >= 1 && code <= 3) {
    let t = "";
    if (code === 1) t = isZh ? "晴時多雲" : "Mainly Clear";
    else if (code === 2) t = isZh ? "局部多雲" : "Partly Cloudy";
    else t = isZh ? "陰天白牆" : "Overcast";
    return { 
      text: t, 
      icon: <CloudSun className="w-6 h-6 text-sky-300" />, 
      bgClass: "from-slate-900/30 to-sky-950/20 border-slate-700/15",
      textClass: "text-sky-300"
    };
  }
  if (code === 45 || code === 48) {
    return { 
      text: isZh ? "高山濃霧" : "Dense Fog", 
      icon: <CloudFog className="w-6 h-6 text-teal-300" />, 
      bgClass: "from-teal-950/25 to-slate-900/20 border-teal-500/15",
      textClass: "text-teal-300"
    };
  }
  if (code >= 51 && code <= 55) {
    return { 
      text: isZh ? "毛毛細雨" : "Light Drizzle", 
      icon: <CloudRain className="w-6 h-6 text-sky-400" />, 
      bgClass: "from-blue-950/20 to-teal-950/20 border-blue-500/15",
      textClass: "text-sky-400"
    };
  }
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return { 
      text: isZh ? "劇烈山雨" : "Heavy Mountain Rain", 
      icon: <CloudRain className="w-6 h-6 text-blue-400 animate-bounce" />, 
      bgClass: "from-blue-950/30 to-indigo-950/20 border-blue-500/20",
      textClass: "text-blue-400"
    };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { 
      text: isZh ? "高山飄雪" : "Alpine Snow Flurries", 
      icon: <Snowflake className="w-6 h-6 text-sky-100 animate-spin-slow" />, 
      bgClass: "from-sky-950/30 to-slate-900/40 border-sky-300/20",
      textClass: "text-sky-200"
    };
  }
  if (code >= 95) {
    return { 
      text: isZh ? "劇烈雷雨" : "Thunderstorm! Danger", 
      icon: <CloudLightning className="w-6 h-6 text-red-400 animate-pulse" />, 
      bgClass: "from-red-950/30 to-stone-900/40 border-red-500/20",
      textClass: "text-red-400"
    };
  }

  return { 
    text: isZh ? "局部多雲" : "Partly Cloudy", 
    icon: <Cloud className="w-6 h-6 text-slate-300" />, 
    bgClass: "from-slate-900/30 to-slate-950/20 border-white/5",
    textClass: "text-slate-300"
  };
}

// Map dates to clean labels
function getWeekdayLabel(dateStr: string, index: number, lang: "en" | "zh" = "zh"): string {
  const isZh = lang === "zh";
  try {
    const dateObj = new Date(dateStr);
    if (index === 0) return isZh ? "今天" : "Today";
    if (index === 1) return isZh ? "明天" : "Tomorrow";
    if (isZh) {
      const days = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
      return `${days[dateObj.getDay()]} ${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    }
    return dateObj.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
  } catch (e) {
    return isZh ? `第 ${index + 1} 天` : `Day ${index + 1}`;
  }
}

export default function PeakWeather({ peak, lang = "zh" }: PeakWeatherProps) {
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [altitudeLossMsg, setAltitudeLossMsg] = useState("");
  const isZh = lang === "zh";

  const fetchWeather = async () => {
    setIsLoading(true);
    setIsOfflineMode(false);
    try {
      // Free Open-Meteo endpoint (No API key needed) with elevation models
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${peak.latitude}&longitude=${peak.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=Asia%2FTaipei`
      );

      if (!response.ok) {
        throw new Error("API offline");
      }

      const data = await response.json();
      
      const dates = data.daily.time || [];
      const weathercodes = data.daily.weathercode || [];
      const tMaxArr = data.daily.temperature_2m_max || [];
      const tMinArr = data.daily.temperature_2m_min || [];
      const windArr = data.daily.windspeed_10m_max || [];
      const apiElevation = data.elevation || 1000;

      // Mountain lapse rate: temperation lowers 0.65°C per 100m.
      const elevationOffsetMeters = peak.height - apiElevation;
      const temperatureOffsetCelsius = elevationOffsetMeters > 0 ? (elevationOffsetMeters / 100) * 0.65 : 0;

      if (elevationOffsetMeters > 0) {
        setAltitudeLossMsg(
          isZh
            ? `山頂溫差已自動降低 -${temperatureOffsetCelsius.toFixed(1)}°C (氣溫直減率：對比基準觀測高程 ${Math.round(apiElevation)}m 與主峰高度 ${peak.height}m)`
            : `Summit temp offset is adjusted down by -${temperatureOffsetCelsius.toFixed(1)}°C (Lapse rate: -0.65°C/100m from API reference grid of ${Math.round(apiElevation)}m to summit height of ${peak.height}m).`
        );
      } else {
        setAltitudeLossMsg("");
      }

      const dailyResult: DayForecast[] = [];
      for (let i = 0; i < Math.min(3, dates.length); i++) {
        const rawMax = tMaxArr[i] !== undefined ? tMaxArr[i] : 20;
        const rawMin = tMinArr[i] !== undefined ? tMinArr[i] : 12;
        
        const adjustedMax = Math.round(rawMax - temperatureOffsetCelsius);
        const adjustedMin = Math.round(rawMin - temperatureOffsetCelsius);
        const wind = windArr[i] !== undefined ? Math.round(windArr[i]) : 15;
        const code = weathercodes[i] !== undefined ? weathercodes[i] : 2;

        let condition = getWeatherDetails(code, lang).text;
        
        let level: "safe" | "caution" | "hazard" = "safe";
        let advisoryText = isZh ? "氣候十分適宜。請配備標準百岳防風防水裝備起登。" : "Optimal trail condition. Secure standard gear.";

        if (code >= 95) {
          level = "hazard";
          advisoryText = isZh 
            ? "稜線極高雷擊危險！極度不建議今日強行登頂避難。" 
            : "High electrocution danger on ridge. Summit highly discouraged!";
        } else if (code >= 61 && code <= 65) {
          level = "hazard";
          advisoryText = isZh 
            ? "劇烈大豪雨導致落石崩塌與失足風險。沿線溪水暴漲可能阻斷路線。" 
            : "Heavy torrential slip hazard. Flash floods possible in ravines.";
        } else if (wind > 35) {
          level = "caution";
          advisoryText = isZh 
            ? "稜線陣風強勁（大於九級），重心容易偏移。請抓緊沿路岩石拉繩。" 
            : "Gale force ridge draft. Secure backpacks and use chain routes.";
        } else if (adjustedMin < 2) {
          level = "caution";
          advisoryText = isZh 
            ? "山頂處於近冰點嚴寒。請必備羽絨禦寒底層、禦寒毛帽與冰爪。" 
            : "Sub-freezing conditions. Bring spike crampons and thermal wear.";
        } else if (adjustedMin < -3) {
          level = "hazard";
          advisoryText = isZh 
            ? "極端低溫嚴寒，步道恐大面積結冰。若無冬攀雪地裝備請立即撤退。" 
            : "Extreme ridge freeze. Heavy snow pack possible.";
        } else if (code === 45 || code === 48) {
          level = "caution";
          advisoryText = isZh 
            ? "白牆濃霧且能見度極低。請隨手查閱手持式 GPS 離線軌跡避免迷途。" 
            : "Visibility limited. Use GPS trackers closely.";
        } else if (peak.grade === "Class C" || peak.grade === "Class C+" || peak.grade === "Class D") {
          level = "caution";
          advisoryText = isZh 
            ? "本百岳屬於高難度偏遠山嶽。即使天氣尚可，亦請備妥全套野外留守救援裝備。" 
            : "Remote terrain with standard conditions. Pack full rescue kits.";
        }

        dailyResult.push({
          date: dates[i],
          weekday: getWeekdayLabel(dates[i], i, lang),
          tempMax: adjustedMax,
          tempMin: adjustedMin,
          windSpeed: wind,
          weatherCode: code,
          conditionText: condition,
          advisory: advisoryText,
          advisoryLevel: level
        });
      }

      setForecast(dailyResult);

    } catch (e) {
      console.warn("Using offline simulated backup forecast models", e);
      setIsOfflineMode(true);
      generateMockAlpineForecast();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAlpineForecast = () => {
    const baseTempMax = 20 - (peak.height - 1000) / 150;
    const baseTempMin = baseTempMax - 8;
    const weatherFactor = peak.nameCH.length % 3; 

    const dailyResult: DayForecast[] = [];
    const today = new Date();

    for (let i = 0; i < 3; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      const dayStr = forecastDate.toISOString().split("T")[0];
      const weekday = getWeekdayLabel(dayStr, i, lang);

      let code = 1;
      if (weatherFactor === 0 && i === 2) {
        code = 61;
      } else if (weatherFactor === 1 && i === 1) {
        code = 45;
      } else if (weatherFactor === 2 && i === 0 && peak.grade === "Class C+") {
        code = 95;
      } else if (peak.height > 3700 && baseTempMin < 0) {
        code = 73;
      }

      const tempVar = Math.sin(i * 1.5) * 2;
      const finalMax = Math.round(baseTempMax + tempVar);
      const finalMin = Math.round(baseTempMin + tempVar - 1);
      const windSpeed = Math.round(15 + Math.cos(i) * 12 + (peak.height / 1000) * 4);

      let condition = getWeatherDetails(code, lang).text;
      let level: "safe" | "caution" | "hazard" = "safe";
      let advisoryText = isZh ? "模擬氣候適宜。請配備常規安全裝備，安全登頂。" : "Optimal conditions. Proceed following safety route maps.";

      if (code >= 95) {
        level = "hazard";
        advisoryText = isZh ? "安全預警：恐有午後劇烈強降雨與雷擊。稜線极危險！" : "Thunderstorms predicted. Dangerous lightning strikes possible!";
      } else if (code >= 61) {
        level = "hazard";
        advisoryText = isZh ? "碎石坡路面極為濕滑，注意坍方。嚴防失溫、保持無線電開啟。" : "Rock falls & slippery roots. Keep emergency radio active.";
      } else if (windSpeed > 30) {
        level = "caution";
        advisoryText = isZh ? "稜線強風警報。經過斷崖與狹窄地段請貼地行進。" : "Exposed ridge gale gust. Balance shifts expectable.";
      } else if (finalMin < 0) {
        level = "caution";
        advisoryText = isZh ? "山頂低於冰點。請注意背陰路面碎石上的暗冰滑倒。" : "Below freezing at summit. Watch for trail black ice.";
      } else if (code === 45) {
        level = "caution";
        advisoryText = isZh ? "高山起白牆，濃霧中易失方向。請與隊友保持呼應距離。" : "Heavy forest fog likely. Stick with trail signs.";
      }

      dailyResult.push({
        date: dayStr,
        weekday,
        tempMax: finalMax,
        tempMin: finalMin,
        windSpeed,
        weatherCode: code,
        conditionText: condition,
        advisory: advisoryText,
        advisoryLevel: level
      });
    }

    setAltitudeLossMsg(
      isZh 
        ? `山頂微氣候模擬中：基於海拔標高 ${peak.height}m 建立的氣候高程直減分析數據。` 
        : `Using simulated offline micro-climate forecast modeled for peak summit altitude of ${peak.height}m.`
    );
    setForecast(dailyResult);
  };

  useEffect(() => {
    fetchWeather();
  }, [peak.id, lang]);

  let peakSafetyLevel: "safe" | "caution" | "hazard" = "safe";
  
  if (forecast.some(f => f.advisoryLevel === "hazard")) {
    peakSafetyLevel = "hazard";
  } else if (forecast.some(f => f.advisoryLevel === "caution")) {
    peakSafetyLevel = "caution";
  }

  const advisoryClass = {
    safe: "border-emerald-500/20 bg-emerald-950/15 text-emerald-400 text-[10px]",
    caution: "border-amber-500/20 bg-amber-950/15 text-amber-400 text-[10px]",
    hazard: "border-red-500/20 bg-red-950/20 text-red-400 text-[10px]"
  };

  return (
    <div className="bg-slate-950/40 border border-slate-800/30 rounded-2xl p-3.5 space-y-3.5" id="summit-weather-widget">
      
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#d4ff00] flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5" />
            {isZh ? "高山三日實時預報" : "3-Day Alpine Weather"}
          </h4>
          <p className="text-[9px] text-gray-500 leading-none">
            {isZh ? "實時高程直減率氣溫校正" : "REAL-TIME GPS ELEVATION ADJUSTMENT"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOfflineMode && (
            <span className="text-[8px] font-mono tracking-wider font-extrabold text-amber-400/80 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-500/10">
              {isZh ? "離線模擬" : "OFFLINE MODE"}
            </span>
          )}
          <button 
            onClick={fetchWeather}
            disabled={isLoading}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-45 cursor-pointer"
            title={isZh ? "刷新天氣數據" : "Force refresh conditions"}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-[#d4ff00]" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-[10px] uppercase font-bold tracking-wider animate-pulse">
            {isZh ? "正連線百岳氣象觀測站與中央氣象台雲圖..." : "Consulting alpine weather station..."}
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          
          {/* Days forecast Row */}
          <div className="grid grid-cols-3 gap-2">
            {forecast.map((day, idx) => {
              const details = getWeatherDetails(day.weatherCode, lang);
              return (
                <div 
                  key={idx}
                  className={`bg-gradient-to-b ${details.bgClass} border rounded-xl p-2 flex flex-col items-center text-center space-y-1`}
                >
                  <span className="text-[9.5px] font-black uppercase text-gray-400 tracking-wider">
                    {day.weekday}
                  </span>
                  
                  {/* Weather symbol */}
                  <div className="py-0.5">
                    {details.icon}
                  </div>

                  {/* Temp display */}
                  <div className="text-xs font-mono font-extrabold text-slate-100 flex items-baseline justify-center">
                    <span>{day.tempMax}°</span>
                    <span className="text-[9px] text-gray-500 font-normal mx-0.5">/</span>
                    <span className="text-[10px] font-bold text-sky-400">{day.tempMin}°</span>
                  </div>

                  {/* Condition label */}
                  <span className={`text-[8.5px] font-bold block truncate w-full ${details.textClass} leading-tight`}>
                    {day.conditionText}
                  </span>

                  {/* Wind indicator */}
                  <div className="flex items-center gap-0.5 text-[8px] font-mono text-gray-500 leading-none pt-0.5">
                    <Wind className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                    <span>{day.windSpeed} km/h</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combined Summit Safety Advisory Banner */}
          <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${advisoryClass[peakSafetyLevel]}`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black uppercase tracking-wider block text-[9.5px]">
                {peakSafetyLevel === "hazard" 
                  ? (isZh ? "高山安全威脅警告" : "Summiteer Danger Warning") 
                  : peakSafetyLevel === "caution" 
                    ? (isZh ? "氣候安全注意公告" : "Ridge Caution Advisory") 
                    : (isZh ? "氣候適宜良好等級" : "Stable Climbing Weather")}
              </span>
              <p className="leading-tight text-[10px] opacity-90 font-medium">
                {forecast[0]?.advisory}
              </p>
            </div>
          </div>

          {/* Altitude breakdown message details */}
          {altitudeLossMsg && (
            <div className="text-[9px] text-gray-500 leading-tight flex items-start gap-1 font-mono pt-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{altitudeLossMsg}</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
