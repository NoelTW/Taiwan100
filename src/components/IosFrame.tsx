import React, { useState, useEffect } from "react";
import { Signal, Wifi, Battery, Power } from "lucide-react";

interface IosFrameProps {
  children: React.ReactNode;
  activeStatusText?: string;
  isGpsActive?: boolean;
}

export default function IosFrame({ children, activeStatusText, isGpsActive }: IosFrameProps) {
  const [time, setTime] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Slowly fluctuate battery level in simulator for supreme fidelity
  useEffect(() => {
    const batteryInterval = setInterval(() => {
      setBatteryLevel((prev) => {
        if (prev <= 10) return 98; // auto reset
        return prev - 1;
      });
    }, 90000);
    return () => clearInterval(batteryInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] py-6 px-2 bg-slate-950 font-sans select-none overflow-hidden select-none">
      {/* Phone container */}
      <div className="relative w-full max-w-[395px] h-[820px] rounded-[52px] border-[10px] border-[#151c15] bg-[#050705] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col ring-8 ring-[#151c15]/30">
        
        {/* Dynamic Island Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          <div className={`h-[28px] bg-black text-white rounded-full flex items-center justify-between px-3.5 transition-all duration-500 ease-in-out ${
            isGpsActive ? "w-[180px] scale-105 border border-[#d4ff00]/30 shadow-[0_0_12px_rgba(212,255,0,0.25)]" : "w-[110px]"
          }`}>
            {isGpsActive ? (
              <div className="flex items-center justify-between w-full text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4ff00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4ff00]"></span>
                  </span>
                  <span className="font-semibold text-[#d4ff00] tracking-tight text-[10px]">RADAR ACTIVE</span>
                </div>
                <div className="text-[10px] font-mono text-[#d4ff00] animate-pulse">
                  🛰️ LIVE
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 w-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800"></div>
                <div className="text-[9px] font-bold text-slate-400 letter-spacing w-[42px] text-center">TAIWAN TOPO</div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-800"></div>
              </div>
            )}
          </div>
        </div>

        {/* Top iOS Status Bar */}
        <div className="h-[44px] bg-[#050705] px-7 flex items-end justify-between pb-1.5 text-xs text-slate-200 font-semibold z-40 select-none border-b border-white/5">
          <div className="text-[11px] font-medium tracking-tight pr-4 text-gray-300">
            {time || "12:00 PM"}
          </div>
          
          <div className="flex items-center gap-1.5 text-[11px]">
            {activeStatusText && (
              <span className="text-[10px] text-[#d4ff00] bg-emerald-950/40 border border-[#d4ff00]/30 px-1.5 py-0.5 rounded-md mr-1.5 animate-pulse font-bold tracking-wide">
                {activeStatusText}
              </span>
            )}
            <Signal className="w-3.5 h-3.5 text-slate-400" />
            <Wifi className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                {batteryLevel}%
              </span>
              <Battery 
                className={`w-4 h-4 cursor-pointer hover:text-[#d4ff00] transition-colors ${
                  isCharging ? "text-[#d4ff00]" : "text-slate-400"
                }`} 
                onClick={() => setIsCharging(!isCharging)}
                title="Toggle Simulator Charging Mode"
              />
            </div>
          </div>
        </div>

        {/* Simulated iOS screen viewport */}
        <div className="flex-1 w-full bg-[#050705] relative flex flex-col overflow-hidden">
          {children}
        </div>

        {/* iOS Bottom Indicator bar */}
        <div className="h-[21px] bg-[#050705] flex items-center justify-center pb-2 z-40">
          <div className="w-32 h-1 bg-[#1a2b1a] rounded-full"></div>
        </div>
      </div>

      {/* Simulator Side hardware descriptive tips */}
      <div className="mt-4 flex flex-col items-center gap-1.5 text-xs text-slate-400 max-w-sm text-center px-4">
        <p className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          Running iOS Web Simulator Frame • Click Battery to toggle charging state.
        </p>
        <p className="text-[11px] text-slate-500">
          Scroll inside the iPhone body to interact, click options to explore trails & track paths.
        </p>
      </div>
    </div>
  );
}
