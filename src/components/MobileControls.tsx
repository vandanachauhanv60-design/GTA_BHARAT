import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Disc, Volume2, Crosshair, LogOut, LogIn } from 'lucide-react';

interface MobileControlsProps {
  inVehicle: boolean;
  onControlChange: (action: 'forward' | 'backward' | 'left' | 'right' | 'handbrake' | 'sprint' | 'jump' | 'action', state: boolean) => void;
  onHonkOrShoot: () => void;
  onEnterExit: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  inVehicle,
  onControlChange,
  onHonkOrShoot,
  onEnterExit,
}) => {
  // Prevent default touch behaviors
  const handleTouch = (action: 'forward' | 'backward' | 'left' | 'right' | 'handbrake' | 'sprint' | 'jump' | 'action', state: boolean) => {
    onControlChange(action, state);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none z-20 flex justify-between items-end select-none md:hidden">
      {/* Left: Steering D-Pad */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        <button
          onTouchStart={() => handleTouch('forward', true)}
          onTouchEnd={() => handleTouch('forward', false)}
          onMouseDown={() => handleTouch('forward', true)}
          onMouseUp={() => handleTouch('forward', false)}
          className="w-14 h-14 bg-neutral-900/80 active:bg-amber-500 border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-xl"
        >
          <ArrowUp className="w-7 h-7" />
        </button>

        <div className="flex gap-2">
          <button
            onTouchStart={() => handleTouch('left', true)}
            onTouchEnd={() => handleTouch('left', false)}
            onMouseDown={() => handleTouch('left', true)}
            onMouseUp={() => handleTouch('left', false)}
            className="w-14 h-14 bg-neutral-900/80 active:bg-amber-500 border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-xl"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          <button
            onTouchStart={() => handleTouch('backward', true)}
            onTouchEnd={() => handleTouch('backward', false)}
            onMouseDown={() => handleTouch('backward', true)}
            onMouseUp={() => handleTouch('backward', false)}
            className="w-14 h-14 bg-neutral-900/80 active:bg-amber-500 border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-xl"
          >
            <ArrowDown className="w-7 h-7" />
          </button>

          <button
            onTouchStart={() => handleTouch('right', true)}
            onTouchEnd={() => handleTouch('right', false)}
            onMouseDown={() => handleTouch('right', true)}
            onMouseUp={() => handleTouch('right', false)}
            className="w-14 h-14 bg-neutral-900/80 active:bg-amber-500 border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-xl"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Right: Pedals & Action Buttons */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        <div className="flex gap-2">
          {/* Enter / Exit Vehicle */}
          <button
            onClick={onEnterExit}
            className="w-13 h-13 bg-amber-500 active:bg-amber-400 text-neutral-950 rounded-2xl flex items-center justify-center shadow-xl font-bold"
          >
            {inVehicle ? <LogOut className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </button>

          {/* Horn (driving) or Fire/Attack (on foot) */}
          <button
            onClick={onHonkOrShoot}
            className="w-13 h-13 bg-neutral-900/80 active:bg-red-500 border border-white/20 text-white rounded-2xl flex items-center justify-center shadow-xl"
          >
            {inVehicle ? <Volume2 className="w-6 h-6 text-amber-400" /> : <Crosshair className="w-6 h-6 text-red-400" />}
          </button>
        </div>

        {/* Handbrake / Sprint */}
        <button
          onTouchStart={() => handleTouch('handbrake', true)}
          onTouchEnd={() => handleTouch('handbrake', false)}
          onMouseDown={() => handleTouch('handbrake', true)}
          onMouseUp={() => handleTouch('handbrake', false)}
          className="px-6 py-3 bg-red-600/90 active:bg-red-500 text-white font-black text-xs tracking-wider rounded-2xl border border-white/20 shadow-xl"
        >
          {inVehicle ? 'DRIFT / HANDBRAKE' : 'SPRINT (SHIFT)'}
        </button>
      </div>
    </div>
  );
};
