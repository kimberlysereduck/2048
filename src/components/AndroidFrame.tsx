import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  accentColor: string;
  themeBackground: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isPhoneFrame,
  setIsPhoneFrame,
  accentColor,
  themeBackground,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 relative select-none"
      style={{ backgroundColor: isPhoneFrame ? '#0f0e13' : themeBackground }}
    >
      {/* Phone Viewport Wrapper */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[420px] h-[92vh] max-h-[880px] my-4 rounded-[44px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-[6px] border-[#2b2930] overflow-hidden relative'
            : 'max-w-md min-h-screen'
        }`}
        style={{ backgroundColor: themeBackground }}
      >
        {/* Android Material Status Bar */}
        <div className="w-full px-6 pt-3 pb-2 flex items-center justify-between text-xs font-medium z-30 select-none opacity-85">
          <span className="tracking-tight font-semibold">{currentTime}</span>

          {/* Android Punch Hole Camera (in phone frame mode) */}
          {isPhoneFrame && (
            <div className="w-3.5 h-3.5 bg-black rounded-full ring-1 ring-white/10 mx-auto" />
          )}

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1 rounded bg-black/20">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* Android Gesture Navigation Bar (Pill) */}
        {isPhoneFrame && (
          <div className="w-full py-2 flex items-center justify-center z-30 bg-transparent">
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        )}
      </div>

      {/* Frame Mode Floating Toggle Button */}
      <button
        onClick={() => setIsPhoneFrame(!isPhoneFrame)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md bg-black/70 text-white/90 border border-white/15 hover:bg-black/90 active:scale-95 transition-all"
        title={isPhoneFrame ? 'Expand to Fullscreen' : 'Switch to Android Pixel Frame'}
      >
        {isPhoneFrame ? (
          <>
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full View</span>
          </>
        ) : (
          <>
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Android Frame</span>
          </>
        )}
      </button>
    </div>
  );
};
