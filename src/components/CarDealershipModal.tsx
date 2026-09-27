import React, { useState } from 'react';
import { X, Check, DollarSign, Zap, Shield, ArrowRight } from 'lucide-react';
import { VehicleDef } from '../types/game';

interface CarDealershipModalProps {
  onClose: () => void;
  cash: number;
  onPurchase: (def: VehicleDef) => void;
  onRepaint: (colorHex: string) => void;
  inVehicle: boolean;
}

const AVAILABLE_CARS: VehicleDef[] = [
  {
    id: 'sports_racer',
    name: 'Racer GT V8',
    category: 'Sports',
    price: 150000,
    topSpeed: 195,
    acceleration: 88,
    handling: 92,
    braking: 85,
    color: '#e53935',
    unlocked: true,
    description: 'Track-tuned aerodynamic sports coupe built for raw straight-line speed on city expressways.',
  },
  {
    id: 'desi_tuktuk',
    name: 'Desi Auto Rickshaw',
    category: 'Rickshaw',
    price: 25000,
    topSpeed: 75,
    acceleration: 60,
    handling: 96,
    braking: 70,
    color: '#008037',
    unlocked: true,
    description: 'The heartbeat of Indian streets. Extremely nimble turning radius to slip through crowded bazaars.',
  },
  {
    id: 'royal_ambassador',
    name: 'Royal Ambassador Taxi',
    category: 'Classic Taxi',
    price: 45000,
    topSpeed: 120,
    acceleration: 58,
    handling: 68,
    braking: 75,
    color: '#ffcc00',
    unlocked: true,
    description: 'Iconic heritage sedan with vintage chrome aesthetics, heavy steel build, and legendary comfort.',
  },
  {
    id: 'beast_suv',
    name: 'Fortuner Scorpio Beast',
    category: 'SUV',
    price: 85000,
    topSpeed: 165,
    acceleration: 78,
    handling: 80,
    braking: 82,
    color: '#1a237e',
    unlocked: false,
    description: 'High-clearance muscular 4x4 SUV built to crush bumps, curbs, and dominate highway traffic.',
  },
  {
    id: 'police_interceptor',
    name: 'Police Interceptor Patrol',
    category: 'Police',
    price: 120000,
    topSpeed: 210,
    acceleration: 92,
    handling: 90,
    braking: 90,
    color: '#ffffff',
    unlocked: false,
    description: 'Pursuit-spec police cruiser with functional blue/red emergency strobes and high-torque engine.',
  },
];

const COLOR_PALETTE = [
  { name: 'Indian Saffron', hex: '#ff9933' },
  { name: 'Crimson Red', hex: '#e53935' },
  { name: 'Royal Navy', hex: '#0d47a1' },
  { name: 'Golden Yellow', hex: '#ffb300' },
  { name: 'Emerald Green', hex: '#138808' },
  { name: 'Jet Black', hex: '#111111' },
  { name: 'Pearl White', hex: '#ffffff' },
];

export const CarDealershipModal: React.FC<CarDealershipModalProps> = ({
  onClose,
  cash,
  onPurchase,
  onRepaint,
  inVehicle,
}) => {
  const [selectedCar, setSelectedCar] = useState<VehicleDef>(AVAILABLE_CARS[0]);
  const [chosenColor, setChosenColor] = useState<string>(AVAILABLE_CARS[0].color);

  const canAfford = cash >= selectedCar.price;

  const handleBuy = () => {
    onPurchase({ ...selectedCar, color: chosenColor });
    onClose();
  };

  const handleRepaint = () => {
    onRepaint(chosenColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Vehicle List */}
        <div className="w-full md:w-2/5 p-6 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col overflow-y-auto">
          <div className="mb-4">
            <span className="text-[11px] font-bold tracking-widest text-red-500 uppercase">
              SHOWROOM & MOTORS
            </span>
            <h2 className="text-2xl font-black text-white">BHARAT MOTORS</h2>
            <p className="text-xs text-neutral-400">Select your ride to test drive or purchase</p>
          </div>

          <div className="flex flex-col gap-2.5 flex-1">
            {AVAILABLE_CARS.map((car) => {
              const isSelected = selectedCar.id === car.id;
              return (
                <button
                  key={car.id}
                  onClick={() => {
                    setSelectedCar(car);
                    setChosenColor(car.color);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 border-red-500 shadow-md ring-1 ring-red-500/50'
                      : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/50'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-white">{car.name}</div>
                    <div className="text-xs text-neutral-400">{car.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-amber-400">
                      ₹{car.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Player Balance Card */}
          <div className="mt-4 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">YOUR BALANCE</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              ₹{cash.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right Side: Selected Vehicle Details & Customizer */}
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between overflow-y-auto bg-neutral-900/50">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  {selectedCar.category} CLASS
                </span>
                <h3 className="text-3xl font-black text-white">{selectedCar.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400">PRICE</span>
                <div className="text-2xl font-black text-amber-400">
                  ₹{selectedCar.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              {selectedCar.description}
            </p>

            {/* Performance Stats */}
            <div className="space-y-3 mb-6 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                PERFORMANCE SPECIFICATIONS
              </span>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                  <span>TOP SPEED</span>
                  <span className="font-mono text-amber-400">{selectedCar.topSpeed} KM/H</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${(selectedCar.topSpeed / 220) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                  <span>ACCELERATION</span>
                  <span className="font-mono text-sky-400">{selectedCar.acceleration}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all"
                    style={{ width: `${selectedCar.acceleration}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                  <span>HANDLING & DRIFT</span>
                  <span className="font-mono text-emerald-400">{selectedCar.handling}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${selectedCar.handling}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Paint Customizer */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase block mb-2.5">
                CUSTOM SHOWROOM PAINT
              </span>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_PALETTE.map((col) => {
                  const isCur = chosenColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      onClick={() => setChosenColor(col.hex)}
                      title={col.name}
                      style={{ backgroundColor: col.hex }}
                      className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        isCur
                          ? 'border-white scale-110 shadow-lg ring-2 ring-red-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                    >
                      {isCur && <Check className={`w-4 h-4 ${col.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-800">
            {inVehicle && (
              <button
                onClick={handleRepaint}
                className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                APPLY PAINT TO CURRENT CAR (₹1,500)
              </button>
            )}

            <button
              onClick={handleBuy}
              disabled={!canAfford}
              className={`flex-1 py-3.5 px-6 font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                canAfford
                  ? 'bg-red-600 hover:bg-red-500 text-white active:scale-98'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <span>{canAfford ? 'PURCHASE & DRIVE' : 'INSUFFICIENT FUNDS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
