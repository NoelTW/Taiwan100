import React, { useState } from "react";
import { OfflineMapPack, OFFLINE_PACKS } from "../data";
import { Download, HardDrive, ShieldCheck, CheckCircle, Trash2, Info, Loader2, Signal } from "lucide-react";

interface OfflineManagerProps {
  packs: OfflineMapPack[];
  onToggleDownload: (id: string, downloaded: boolean) => void;
  lang?: "en" | "zh";
}

export default function OfflineManager({ packs, onToggleDownload, lang = "zh" }: OfflineManagerProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const isZh = lang === "zh";

  const startDownload = (id: string) => {
    setDownloadingId(id);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onToggleDownload(id, true);
          setDownloadingId(null);
          return 100;
        }
        return prev + 15; // advance fast enough but visual
      });
    }, 150);
  };

  const deletePack = (id: string) => {
    onToggleDownload(id, false);
  };

  // Helper to calculate total offline storage consumed
  const totalCachedMb = packs
    .filter((p) => p.downloaded)
    .reduce((sum, p) => sum + p.sizeMb, 0);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-transparent text-white z-15 relative">
      
      {/* Upper Status summary card */}
      <div className="bg-black/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex items-center justify-between">
        <div>
          <div className="text-[9px] text-[#d4ff00] font-black tracking-[0.15em] flex items-center gap-1.5 uppercase">
            <Signal className="w-3 h-3 text-[#d4ff00]" />
            {isZh ? "地形快取數據 HUD" : "Terrain Cache HUD"}
          </div>
          <h3 className="text-sm font-bold text-slate-100 mt-1">
            {isZh ? "高山等高線離線硬碟儲存" : "Satellite Topo Storage"}
          </h3>
          <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
            {isZh 
              ? "向量等高線閉合網格、山容路標、急救拉繩與 POI 座標已快取於本瀏覽器硬碟。" 
              : "Vector contour loops and trail markers saved to client memory."}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-black text-[#d4ff00]">{totalCachedMb} <span className="text-xs">MB</span></div>
          <div className="text-[9px] text-gray-500 uppercase font-black tracking-wider">
            {isZh ? "離線已佔用" : "Storage active"}
          </div>
        </div>
      </div>

      {/* Warning/Preparation Info */}
      <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex gap-2.5 text-xs">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-gray-400 leading-normal text-[11px]">
          {isZh 
            ? "離線等高線數據直接儲存至本機快取。下載區域數據包後，即使在深山中處於完全無手機信號、無蜂窩流動網路的情況下，GPS 線上軌跡定位與急救高程直減分析亦能正常作業。"
            : "Vector topological grids downloaded directly to device. Caching coordinates allows live routing and elevation tracking with zero celular signal available."}
        </p>
      </div>

      {/* Package lists */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 pl-1">
          {isZh ? "百嶽等高線圖示分段下載區" : "Cached Map Sectors"}
        </h4>
        
        <div className="space-y-2.5">
          {packs.map((pack) => {
            let regionName = pack.region;
            let rangeCovered = pack.coverage;
            if (isZh) {
              if (pack.id === "yushan-grid") {
                regionName = "玉山主峰全脈圖";
                rangeCovered = "覆蓋排雲山莊、玉山前峰等 5 處登山坐標";
              } else if (pack.id === "hsuehshan-grid") {
                regionName = "雪山聖稜線核心區";
                rangeCovered = "覆蓋三六九山莊、雪山東峰及黑森林 7 處登山點";
              } else if (pack.id === "qilai-north") {
                regionName = "奇萊中央山脈北二段";
                rangeCovered = "覆蓋奇萊主脊、奇萊北峰、成功避難堡等 9 處急救坐標";
              }
            }

            return (
              <div 
                key={pack.id} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  pack.downloaded 
                    ? "bg-[#050704]/80 border-[#d4ff00]/30 shadow-[0_2px_12px_rgba(212,255,0,0.06)]" 
                    : "bg-black/40 border-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{regionName}</span>
                      {pack.downloaded && (
                        <span className="text-[9px] bg-[#d4ff00]/10 border border-[#d4ff00]/30 text-[#d4ff00] px-1.5 py-0.2 rounded font-mono flex items-center gap-0.5 font-bold">
                          <ShieldCheck className="w-2.5 h-2.5" /> {isZh ? "防護保全快取" : "SECURED"}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{rangeCovered}</p>
                    
                    {/* Stats line */}
                    <div className="flex gap-2 text-[9px] text-slate-400 font-bold mt-2">
                      <span className="bg-[#121c12] border border-white/5 px-1.5 py-0.5 rounded text-gray-300">
                        ⛰️ {pack.peaksCount} {isZh ? "座百名山" : "PEAKS"}
                      </span>
                      <span className="bg-[#121c12] border border-white/5 px-1.5 py-0.5 rounded text-[#d4ff00] font-mono">
                        💾 {pack.sizeMb} MB
                      </span>
                    </div>
                  </div>

                  {downloadingId === pack.id ? (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#d4ff00] font-semibold font-mono">
                        <Loader2 className="w-3 h-3 text-[#d4ff00] animate-spin" />
                        {progress}%
                      </div>
                    </div>
                  ) : pack.downloaded ? (
                    <button
                      onClick={() => deletePack(pack.id)}
                      className="p-2 rounded-xl bg-[#1a0e0e] border border-red-950/45 text-red-400 hover:bg-rose-950/20 active:bg-rose-900/30 transition-colors shrink-0"
                      title={isZh ? "刪除此快取包" : "Remove cached package"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      disabled={downloadingId !== null}
                      onClick={() => startDownload(pack.id)}
                      className={`p-2 rounded-xl bg-[#d4ff00] text-black hover:bg-[#c3eb00] active:bg-[#a6ca00] transition-colors shrink-0 shadow-[0_4px_12px_rgba(212,255,0,0.15)] ${
                        downloadingId !== null ? "opacity-30 cursor-not-allowed" : ""
                      }`}
                      title={isZh ? "下載至瀏覽器快取" : "Download pack for offline storage"}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Progress Bar for active download */}
                {downloadingId === pack.id && (
                  <div className="w-full bg-[#050705] h-1.5 rounded-full overflow-hidden mt-3 border border-white/5">
                    <div 
                      className="bg-[#d4ff00] h-full transition-all duration-150 shadow-[0_0_8px_#d4ff00]"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disk Space usage indicator line */}
      <div className="bg-black/50 p-4 rounded-3xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider font-bold">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            {isZh ? "行動存儲磁碟遙測" : "Device memory telemetry"}
          </span>
          <span className="font-mono text-slate-350">
            {(64 - (totalCachedMb / 1024)).toFixed(2)} {isZh ? "GB 剩餘容量 / 64 GB 總體已載" : "GB FREE / 64 GB"}
          </span>
        </div>
        <div className="w-full bg-black h-2.5 rounded-full overflow-hidden flex border border-white/5 p-px">
          <div className="bg-[#d4ff00] h-full rounded-full shadow-[0_0_8px_#d4ff00]" style={{ width: `${(totalCachedMb / (64 * 1024)) * 100}%` }}></div>
          <div className="h-full flex-1"></div>
        </div>
      </div>

    </div>
  );
}
