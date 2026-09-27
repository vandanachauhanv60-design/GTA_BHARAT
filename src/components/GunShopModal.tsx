import React, { useState } from 'react';
import { X, Crosshair, Shield, Zap, DollarSign, Check } from 'lucide-react';
import { WeaponDef } from '../types/game';

interface GunShopModalProps {
  onClose: () => void;
  cash: number;
  onBuyWeapon: (weaponId: string, price: number) => void;
  onBuyAmmo: (weaponId: string, price: number) => void;
  onEquipWeapon: (weaponId: string) => void;
  currentWeapon: string;
}

const WEAPON_CATALOG: WeaponDef[] = [
  {
    id: 'bat',
    name: 'Heavy Willow Cricket Bat',
    category: 'Melee',
    price: 1500,
    damage: 35,
    fireRate: 400,
    range: 3,
    ammo: 999,
    maxAmmo: 999,
    icon: '🏏',
    description: 'Top grade English willow cricket bat. Silent, lethal up close, and 100% legal on Indian streets.',
    unlocked: true,
  },
  {
    id: 'pistol',
    name: '9mm Service Pistol',
    category: 'Handgun',
    price: 15000,
    damage: 45,
    fireRate: 250,
    range: 45,
    ammo: 60,
    maxAmmo: 120,
    icon: '🔫',
    description: 'Reliable semi-automatic sidearm with balanced recoil and quick reload time.',
    unlocked: true,
  },
  {
    id: 'ak47',
    name: 'AK-47 Tactical Rifle',
    category: 'Assault',
    price: 45000,
    damage: 75,
    fireRate: 110,
    range: 85,
    ammo: 180,
    maxAmmo: 300,
    icon: '💥',
    description: 'Iconic high-caliber gas-operated assault rifle with devastating continuous firepower.',
    unlocked: false,
  },
  {
    id: 'shotgun',
    name: 'Combat 12-Gauge Shotgun',
    category: 'Heavy',
    price: 35000,
    damage: 120,
    fireRate: 650,
    range: 25,
    ammo: 32,
    maxAmmo: 64,
    icon: '⚡',
    description: 'Heavy pump-action shotgun designed to stop anything in close quarter street encounters.',
    unlocked: false,
  },
];

export const GunShopModal: React.FC<GunShopModalProps> = ({
  onClose,
  cash,
  onBuyWeapon,
  onBuyAmmo,
  onEquipWeapon,
  currentWeapon,
}) => {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponDef>(WEAPON_CATALOG[1]);

  const canAfford = cash >= selectedWeapon.price;
  const isEquipped = currentWeapon === selectedWeapon.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Weapon List */}
        <div className="w-full md:w-2/5 p-6 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col overflow-y-auto">
          <div className="mb-4">
            <span className="text-[11px] font-bold tracking-widest text-amber-500 uppercase">
              TACTICAL & SECURITY
            </span>
            <h2 className="text-2xl font-black text-white">SHREE RAM ARMORY</h2>
            <p className="text-xs text-neutral-400">Tactical gear and licensed ammunition</p>
          </div>

          <div className="flex flex-col gap-2.5 flex-1">
            {WEAPON_CATALOG.map((w) => {
              const isSelected = selectedWeapon.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeapon(w)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{w.name}</div>
                      <div className="text-xs text-neutral-400">{w.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-amber-400">
                      ₹{w.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Player Balance */}
          <div className="mt-4 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">YOUR BALANCE</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              ₹{cash.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Right Side: Details & Purchasing */}
        <div className="w-full md:w-3/5 p-6 flex flex-col justify-between overflow-y-auto bg-neutral-900/50">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  {selectedWeapon.category} WEAPON
                </span>
                <h3 className="text-3xl font-black text-white">{selectedWeapon.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400">PRICE</span>
                <div className="text-2xl font-black text-amber-400">
                  ₹{selectedWeapon.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-6">
              {selectedWeapon.description}
            </p>

            {/* Weapon Stats */}
            <div className="space-y-3 mb-6 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                FIREARM SPECIFICATIONS
              </span>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                  <span>STOPPING POWER (DAMAGE)</span>
                  <span className="font-mono text-red-400">{selectedWeapon.damage} HP</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${(selectedWeapon.damage / 120) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                  <span>EFFECTIVE RANGE</span>
                  <span className="font-mono text-amber-400">{selectedWeapon.range} METERS</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${(selectedWeapon.range / 100) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                  <span>FIRE RATE</span>
                  <span className="font-mono text-sky-400">{selectedWeapon.fireRate} MS</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(15, 100 - (selectedWeapon.fireRate / 600) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tactical Gear Addon: Kevlar Vest */}
            <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-sky-400" />
                <div>
                  <div className="text-xs font-bold text-white">Heavy Tactical Kevlar Vest</div>
                  <div className="text-[10px] text-neutral-400">+50 Armor protection against bullets & impacts</div>
                </div>
              </div>
              <button
                onClick={() => onBuyAmmo('armor', 8000)}
                disabled={cash < 8000}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                ₹8,000
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-800 mt-4">
            <button
              onClick={() => onEquipWeapon(selectedWeapon.id)}
              className={`flex-1 py-3 px-4 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center ${
                isEquipped ? 'bg-emerald-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              {isEquipped ? 'CURRENTLY EQUIPPED' : 'EQUIP WEAPON'}
            </button>

            <button
              onClick={() => onBuyAmmo(selectedWeapon.id, 2500)}
              disabled={cash < 2500 || selectedWeapon.id === 'bat'}
              className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-amber-400 font-bold text-xs rounded-xl cursor-pointer"
            >
              BUY AMMO PACK (₹2,500)
            </button>

            <button
              onClick={() => {
                onBuyWeapon(selectedWeapon.id, selectedWeapon.price);
                onEquipWeapon(selectedWeapon.id);
              }}
              disabled={!canAfford}
              className={`flex-1 py-3.5 px-6 font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                canAfford
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 active:scale-98'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <span>{canAfford ? 'PURCHASE & ARRANGE' : 'INSUFFICIENT FUNDS'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
