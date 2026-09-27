import React from 'react';
import { X, Heart, Shield, Activity, PlusCircle, Check } from 'lucide-react';

interface HospitalModalProps {
  onClose: () => void;
  health: number;
  cash: number;
  onHeal: (amount: number, cost: number) => void;
}

export const HospitalModal: React.FC<HospitalModalProps> = ({
  onClose,
  health,
  cash,
  onHeal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-emerald-500 uppercase">
              24/7 TRAUMA & ICU EMERGENCY
            </span>
            <h2 className="text-2xl font-black text-white">CITY CARE HOSPITAL</h2>
            <p className="text-xs text-neutral-400">सिटी केयर मल्टी-स्पेशियलिटी अस्पताल</p>
          </div>
        </div>

        {/* Current Health Status */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-neutral-400">PATIENT VITAL SIGNS</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{health}% HP</span>
          </div>
          <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                health < 30 ? 'bg-red-500' : health < 60 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        {/* Medical Treatment Packages */}
        <div className="space-y-3 mb-6">
          {/* Full Heal */}
          <div className="p-4 bg-neutral-800/60 hover:bg-neutral-800 rounded-2xl border border-neutral-700 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">Emergency Trauma Resuscitation</div>
                <div className="text-xs text-neutral-400">Instantly restores health to 100% full capacity</div>
              </div>
            </div>
            <button
              onClick={() => onHeal(100, 2000)}
              disabled={health >= 100 || cash < 2000}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {health >= 100 ? 'FULL HEALTH' : 'HEAL ₹2,000'}
            </button>
          </div>

          {/* First Aid Kit */}
          <div className="p-4 bg-neutral-800/60 hover:bg-neutral-800 rounded-2xl border border-neutral-700 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <PlusCircle className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">Rapid First-Aid Kit & Bandages</div>
                <div className="text-xs text-neutral-400">Replenishes +35% health points</div>
              </div>
            </div>
            <button
              onClick={() => onHeal(35, 1000)}
              disabled={health >= 100 || cash < 1000}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              APPLY ₹1,000
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <div className="text-xs text-neutral-400">
            YOUR BALANCE:{' '}
            <span className="font-mono font-bold text-emerald-400">₹{cash.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            CLOSE DISPENSARY
          </button>
        </div>
      </div>
    </div>
  );
};
