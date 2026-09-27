import React from 'react';
import {
  Gauge,
  Heart,
  DollarSign,
  Star,
  Map as MapIcon,
  Camera,
  Sun,
  CloudRain,
  Moon,
  Volume2,
  VolumeX,
  Radio,
  Crosshair,
  Lightbulb,
} from 'lucide-react';
import { WeatherType } from '../types/game';

interface HUDProps {
  speedKmh: number;
  rpm: number;
  gear: number;
  inVehicle: boolean;
  vehicleName: string;
  headlightsOn: boolean;
  health: number;
  cash: number;
  wantedStars: number;
  locationPrompt: string | null;
  actionKeyPrompt: string | null;
  npcDialogue: string | null;
  currentWeather: WeatherType;
  isMuted: boolean;
  onToggleMute: () => void;
  onSetWeather: (w: WeatherType) => void;
  onOpenMap: () => void;
  onHonk: () => void;
  onToggleLights: () => void;
  onCycleCamera: () => void;
  onActionClick: () => void;
  onSwitchWeapon: (w: string) => void;
  currentWeapon: string;
}

export const HUD: React.FC<HUDProps> = ({
  speedKmh,
  rpm,
  gear,
  inVehicle,
  vehicleName,
  headlightsOn,
  health,
  cash,
  wantedStars,
  locationPrompt,
  actionKeyPrompt,
  npcDialogue,
  currentWeather,
  isMuted,
  onToggleMute,
  onSetWeather,
  onOpenMap,
  onHonk,
  onToggleLights,
  onCycleCamera,
  onActionClick,
  onSwitchWeapon,
  currentWeapon,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 select-none z-10">
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        {/* Left: Health, Cash, Wanted Stars */}
        <div className="flex flex-col gap-2.5 pointer-events-auto">
          {/* Health Bar */}
          <div className="flex items-center gap-3 bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg min-w-[200px]">
            <Heart className={`w-5 h-5 ${health < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
            <div className="flex-1">
              <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                <span>HEALTH</span>
                <span>{health}%</span>
              </div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    health < 30 ? 'bg-red-500' : health < 60 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cash */}
          <div className="flex items-center gap-2 bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-base font-bold text-emerald-400 tracking-wide">
              ₹ {cash.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Wanted Stars */}
          <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
            <span className="text-[11px] font-bold text-neutral-400 mr-1">POLICE</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 transition-colors ${
                  star <= wantedStars ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-neutral-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center: NPC Dialogue Bubble or Location Prompt */}
        <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
          {npcDialogue && (
            <div className="bg-amber-500/95 text-neutral-950 px-4 py-2 rounded-2xl shadow-xl font-medium text-xs flex items-center gap-2 border border-amber-300 animate-fade-in backdrop-blur-sm">
              <Radio className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>{npcDialogue}</span>
            </div>
          )}

          {locationPrompt && (
            <div className="bg-neutral-950/90 border border-amber-400/50 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex flex-col items-center gap-1 backdrop-blur-md animate-pulse">
              <span className="text-amber-400 font-bold text-sm tracking-wider">{locationPrompt}</span>
              {actionKeyPrompt && (
                <button
                  onClick={onActionClick}
                  className="pointer-events-auto mt-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-transform active:scale-95 cursor-pointer shadow-md"
                >
                  {actionKeyPrompt}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Weather & Utility Bar */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
            <button
              onClick={() => onSetWeather('sunny')}
              title="Sunny Day"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                currentWeather === 'sunny' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetWeather('rain')}
              title="Monsoon Rain"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                currentWeather === 'rain' ? 'bg-blue-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CloudRain className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetWeather('night')}
              title="Night Neon"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                currentWeather === 'night' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onOpenMap}
              title="Open City GPS Map (M)"
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors cursor-pointer ml-1"
            >
              <MapIcon className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Weapon Selector (When on foot) */}
          {!inVehicle && (
            <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
              <span className="text-[10px] font-bold text-neutral-400 px-1">WEAPON</span>
              {[
                { id: 'bat', name: 'Bat' },
                { id: 'pistol', name: 'Pistol' },
                { id: 'ak47', name: 'AK47' },
                { id: 'shotgun', name: 'Shotgun' },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => onSwitchWeapon(w.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentWeapon === w.id
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area: Speedometer (driving) or Controls Help + Radar */}
      <div className="flex items-end justify-between">
        {/* Left Bottom: Quick Controls Reference */}
        <div className="bg-neutral-950/80 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 text-[11px] text-neutral-300 flex flex-col gap-1 max-w-[280px]">
          <span className="font-bold text-amber-400 text-xs tracking-wider">CONTROLS (DESKTOP & TOUCH)</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
            <span>WASD / Arrows: Move</span>
            <span>SPACE: Brake / Jump</span>
            <span>E: Enter / Exit / Shop</span>
            <span>F / Click: Fire / Strike</span>
            <span>H: Indian Horn</span>
            <span>L: Headlights</span>
            <span>C: Camera View</span>
            <span>M: GPS Full Map</span>
          </div>
        </div>

        {/* Center Bottom: Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {inVehicle && (
            <>
              <button
                onClick={onHonk}
                className="px-4 py-2 bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 font-bold text-xs rounded-xl border border-white/10 shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                HORN (H)
              </button>
              <button
                onClick={onToggleLights}
                className={`px-4 py-2 font-bold text-xs rounded-xl border border-white/10 shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5 ${
                  headlightsOn ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900/90 text-neutral-300'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                LIGHTS (L)
              </button>
            </>
          )}

          <button
            onClick={onCycleCamera}
            className="px-3.5 py-2 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl border border-white/10 shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-sky-400" />
            CAM (C)
          </button>

          <button
            onClick={onActionClick}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            {inVehicle ? 'EXIT CAR (E)' : 'ENTER CAR / SHOP (E)'}
          </button>
        </div>

        {/* Right Bottom: High Quality Speedometer Gauge */}
        {inVehicle ? (
          <div className="bg-neutral-950/90 backdrop-blur-md p-4 rounded-2xl border border-white/15 shadow-2xl flex flex-col items-center min-w-[210px]">
            <div className="text-[11px] font-bold text-amber-400 tracking-wider uppercase mb-1">
              {vehicleName}
            </div>

            {/* Digital Speed Number */}
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                {speedKmh}
              </span>
              <span className="text-xs font-semibold text-neutral-400">KM/H</span>
            </div>

            {/* RPM Progress Bar */}
            <div className="w-full mt-2">
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mb-1">
                <span>RPM: {Math.round(rpm)}</span>
                <span>GEAR {gear}</span>
              </div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    rpm > 6000 ? 'bg-red-500' : rpm > 4500 ? 'bg-amber-400' : 'bg-sky-400'
                  }`}
                  style={{ width: `${Math.min(100, (rpm / 7500) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950/90 backdrop-blur-md p-3 rounded-2xl border border-white/15 shadow-2xl flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-amber-400 animate-spin" />
            <div>
              <div className="text-xs font-bold text-white tracking-wider">ON FOOT EXPLORATION</div>
              <div className="text-[10px] text-neutral-400">Walk freely or get in any vehicle</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
