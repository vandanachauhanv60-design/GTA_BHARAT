import React from 'react';
import { X, Shield, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PoliceStationModalProps {
  onClose: () => void;
  wantedStars: number;
  cash: number;
  onClearWanted: (cost: number) => void;
}

export const PoliceStationModal: React.FC<PoliceStationModalProps> = ({
  onClose,
  wantedStars,
  cash,
  onClearWanted,
}) => {
  const bailCost = wantedStars * 4000;
  const canAfford = cash >= bailCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase">
              CITY LAW ENFORCEMENT & TRAFFIC POLICE
            </span>
            <h2 className="text-2xl font-black text-white">CENTRAL POLICE CHOWKI</h2>
            <p className="text-xs text-neutral-400">केंद्रीय पुलिस चौकी - डायल 100 / 112</p>
          </div>
        </div>

        {/* Current Wanted Level Card */}
        <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400">ACTIVE WANTED STATUS</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= wantedStars ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {wantedStars > 0 ? (
            <div className="flex items-center gap-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                Active police pursuit authorized! High-speed interceptor patrols are scanning the sector.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>No outstanding warrants. Clean law-abiding citizen record.</span>
            </div>
          )}
        </div>

        {/* Bail & Legal Settlement */}
        {wantedStars > 0 && (
          <div className="p-4 bg-neutral-800/60 rounded-2xl border border-neutral-700 flex items-center justify-between mb-6">
            <div>
              <div className="text-sm font-bold text-white">Legal Bail & Fine Settlement</div>
              <div className="text-xs text-neutral-400">
                Clear all {wantedStars} active stars immediately via court bond
              </div>
            </div>
            <button
              onClick={() => onClearWanted(bailCost)}
              disabled={!canAfford}
              className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                canAfford
                  ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                  : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              }`}
            >
              PAY BAIL (₹{bailCost.toLocaleString('en-IN')})
            </button>
          </div>
        )}

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
            EXIT POLICE CHOWKI
          </button>
        </div>
      </div>
    </div>
  );
};
