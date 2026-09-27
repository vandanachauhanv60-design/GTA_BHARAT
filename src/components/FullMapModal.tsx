import React from 'react';
import { X, Navigation, MapPin } from 'lucide-react';
import { CityLocation } from '../types/game';

interface FullMapModalProps {
  onClose: () => void;
  onTeleport: (x: number, z: number) => void;
  locations: CityLocation[];
}

export const FullMapModal: React.FC<FullMapModalProps> = ({
  onClose,
  onTeleport,
  locations,
}) => {
  const mapSize = 400; // coordinate space from -200 to +200

  const toMapCoord = (val: number) => {
    // converts -200..200 to 0%..100%
    return ((val + 200) / 400) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">BHARAT CITY GPS NAVIGATION MAP</h2>
              <p className="text-xs text-neutral-400">
                Tap or click any district landmark to Fast Travel or explore
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2D Interactive Blueprint Map */}
        <div className="relative my-4 w-full aspect-square max-h-[500px] bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

          {/* Main East-West Highway */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 bg-neutral-800/80 border-y border-amber-500/30 flex items-center justify-center">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              MAHATMA GANDHI EXPRESSWAY (EAST-WEST)
            </span>
          </div>

          {/* Main North-South Highway */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-neutral-800/80 border-x border-amber-500/30 flex items-center justify-center [writing-mode:vertical-rl]">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              BHARAT MARG ARTERIAL
            </span>
          </div>

          {/* Elevated Metro Rail Corridor */}
          <div
            className="absolute left-0 right-0 h-3 bg-sky-900/60 border-y border-sky-400/50"
            style={{ top: `${toMapCoord(-32)}%` }}
          >
            <span className="absolute left-4 -top-4 text-[9px] font-bold text-sky-400 tracking-wider">
              METRO VIADUCT LINE 1 🚊
            </span>
          </div>

          {/* Ring Roads */}
          <div
            className="absolute left-0 right-0 h-4 bg-neutral-800/50"
            style={{ top: `${toMapCoord(110)}%` }}
          />
          <div
            className="absolute left-0 right-0 h-4 bg-neutral-800/50"
            style={{ top: `${toMapCoord(-110)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-4 bg-neutral-800/50"
            style={{ left: `${toMapCoord(110)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-4 bg-neutral-800/50"
            style={{ left: `${toMapCoord(-110)}%` }}
          />

          {/* Interactive Landmark Pins */}
          {locations.map((loc) => {
            const xPercent = toMapCoord(loc.x);
            const yPercent = toMapCoord(loc.z);
            return (
              <button
                key={loc.id}
                onClick={() => {
                  onTeleport(loc.x, loc.z);
                  onClose();
                }}
                style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center z-10 transition-transform hover:scale-110 active:scale-95"
              >
                <div
                  className="w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-lg shadow-xl backdrop-blur-md transition-all group-hover:ring-4 group-hover:ring-white/20"
                  style={{
                    backgroundColor: `${loc.color}25`,
                    borderColor: loc.color,
                  }}
                >
                  {loc.icon}
                </div>
                <div className="mt-1 px-2.5 py-0.5 rounded-md bg-neutral-900/95 border border-white/10 text-[10px] font-bold text-white whitespace-nowrap shadow-lg">
                  {loc.name.split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Fast-Travel List */}
        <div className="flex flex-wrap gap-2 pt-2">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                onTeleport(loc.x, loc.z);
                onClose();
              }}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-xl text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{loc.icon}</span>
              <span>{loc.name.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
