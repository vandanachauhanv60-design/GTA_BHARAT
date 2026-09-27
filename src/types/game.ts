export type WeatherType = 'sunny' | 'sunset' | 'rain' | 'night' | 'fog';

export interface VehicleDef {
  id: string;
  name: string;
  category: 'Sports' | 'Classic Taxi' | 'Rickshaw' | 'SUV' | 'Police' | 'Bike';
  price: number;
  topSpeed: number; // km/h
  acceleration: number;
  handling: number;
  braking: number;
  color: string;
  unlocked: boolean;
  description: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  category: 'Melee' | 'Handgun' | 'Assault' | 'Heavy' | 'Special';
  price: number;
  damage: number;
  fireRate: number; // ms
  range: number;
  ammo: number;
  maxAmmo: number;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface CityLocation {
  id: string;
  name: string;
  hindiName: string;
  type: 'dealership' | 'gunshop' | 'hospital' | 'police' | 'monument' | 'plaza' | 'bazaar';
  x: number;
  z: number;
  radius: number;
  color: string;
  icon: string;
  description: string;
}

export interface NPCData {
  id: number;
  meshIndex: number;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  heading: number;
  color: string;
  isScared: boolean;
}

export interface TrafficCarData {
  id: number;
  x: number;
  z: number;
  direction: 'north' | 'south' | 'east' | 'west';
  speed: number;
  targetSpeed: number;
  color: string;
  type: 'sedan' | 'tuktuk' | 'suv' | 'cab';
}
