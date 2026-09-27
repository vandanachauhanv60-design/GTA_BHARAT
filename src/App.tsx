import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/gameEngine';
import { HUD } from './components/HUD';
import { CarDealershipModal } from './components/CarDealershipModal';
import { GunShopModal } from './components/GunShopModal';
import { HospitalModal } from './components/HospitalModal';
import { PoliceStationModal } from './components/PoliceStationModal';
import { FullMapModal } from './components/FullMapModal';
import { MobileControls } from './components/MobileControls';
import { sound } from './audio/soundEngine';
import { WeatherType, VehicleDef } from './types/game';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI States
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [rpm, setRpm] = useState<number>(800);
  const [gear, setGear] = useState<number>(1);
  const [inVehicle, setInVehicle] = useState<boolean>(false);
  const [vehicleName, setVehicleName] = useState<string>('On Foot');
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(false);
  const [health, setHealth] = useState<number>(100);
  const [cash, setCash] = useState<number>(55000);
  const [wantedStars, setWantedStars] = useState<number>(0);
  const [locationPrompt, setLocationPrompt] = useState<string | null>(null);
  const [actionKeyPrompt, setActionKeyPrompt] = useState<string | null>(null);
  const [npcDialogue, setNpcDialogue] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('sunny');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentWeapon, setCurrentWeapon] = useState<string>('pistol');

  // Modals
  const [activeModal, setActiveModal] = useState<
    'dealership' | 'gunshop' | 'hospital' | 'police' | 'map' | null
  >(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onSpeedChange: (speed, rpmVal, gearVal) => {
        setSpeedKmh(speed);
        setRpm(rpmVal);
        setGear(gearVal);
      },
      onVehicleStateChange: (isInCar, vName, lights) => {
        setInVehicle(isInCar);
        setVehicleName(vName);
        setHeadlightsOn(lights);
      },
      onHealthChange: (hp) => setHealth(hp),
      onCashChange: (newCash) => setCash(newCash),
      onWantedChange: (stars) => setWantedStars(stars),
      onLocationPrompt: (loc, actKey) => {
        setLocationPrompt(loc);
        setActionKeyPrompt(actKey);
      },
      onNpcDialogue: (quote) => setNpcDialogue(quote),
      onEnterLocationModal: (locId) => {
        if (locId === 'dealership') setActiveModal('dealership');
        else if (locId === 'gunshop') setActiveModal('gunshop');
        else if (locId === 'hospital') setActiveModal('hospital');
        else if (locId === 'police') setActiveModal('police');
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  // Global key listener for Map modal [KeyM]
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setActiveModal((prev) => (prev === 'map' ? null : 'map'));
      }
      if (e.code === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Handlers
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handleSetWeather = (w: WeatherType) => {
    setCurrentWeather(w);
    engineRef.current?.setWeather(w);
  };

  const handleHonk = () => {
    engineRef.current?.honkHorn();
  };

  const handleToggleLights = () => {
    engineRef.current?.toggleHeadlights();
  };

  const handleCycleCamera = () => {
    engineRef.current?.cycleCamera();
  };

  const handleActionClick = () => {
    if (inVehicle) {
      engineRef.current?.exitVehicle();
    } else {
      if (locationPrompt?.includes('Bharat Motors')) setActiveModal('dealership');
      else if (locationPrompt?.includes('Armory')) setActiveModal('gunshop');
      else if (locationPrompt?.includes('Hospital')) setActiveModal('hospital');
      else if (locationPrompt?.includes('Police')) setActiveModal('police');
      else engineRef.current?.tryEnterNearestVehicle();
    }
  };

  const handleSwitchWeapon = (wId: string) => {
    setCurrentWeapon(wId);
    engineRef.current?.switchWeapon(wId);
  };

  // Car Dealership
  const handlePurchaseVehicle = (def: VehicleDef) => {
    if (engineRef.current?.spendCash(def.price)) {
      engineRef.current.spawnPurchasedCar(def);
    }
  };

  const handleRepaint = (colorHex: string) => {
    if (engineRef.current?.spendCash(1500)) {
      engineRef.current.repaintCurrentCar(colorHex);
    }
  };

  // Gun Shop
  const handleBuyWeapon = (weaponId: string, price: number) => {
    if (engineRef.current?.spendCash(price)) {
      sound.playCashSound();
      handleSwitchWeapon(weaponId);
    }
  };

  const handleBuyAmmo = (weaponId: string, price: number) => {
    if (engineRef.current?.spendCash(price)) {
      sound.playCashSound();
    }
  };

  // Hospital
  const handleHeal = (amount: number, cost: number) => {
    if (engineRef.current?.spendCash(cost)) {
      sound.playCashSound();
      engineRef.current.healPlayer(amount);
    }
  };

  // Police Station
  const handleClearWanted = (cost: number) => {
    if (engineRef.current?.spendCash(cost)) {
      sound.playCashSound();
      engineRef.current.clearWanted();
    }
  };

  // Full Map
  const handleTeleport = (x: number, z: number) => {
    engineRef.current?.teleportTo(x, z);
  };

  const handleMobileControl = (
    action: 'forward' | 'backward' | 'left' | 'right' | 'handbrake' | 'sprint' | 'jump' | 'action',
    state: boolean
  ) => {
    engineRef.current?.setVirtualControl(action, state);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Heads-Up Display */}
      <HUD
        speedKmh={speedKmh}
        rpm={rpm}
        gear={gear}
        inVehicle={inVehicle}
        vehicleName={vehicleName}
        headlightsOn={headlightsOn}
        health={health}
        cash={cash}
        wantedStars={wantedStars}
        locationPrompt={locationPrompt}
        actionKeyPrompt={actionKeyPrompt}
        npcDialogue={npcDialogue}
        currentWeather={currentWeather}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSetWeather={handleSetWeather}
        onOpenMap={() => setActiveModal('map')}
        onHonk={handleHonk}
        onToggleLights={handleToggleLights}
        onCycleCamera={handleCycleCamera}
        onActionClick={handleActionClick}
        onSwitchWeapon={handleSwitchWeapon}
        currentWeapon={currentWeapon}
      />

      {/* Mobile Touch Virtual Controls */}
      <MobileControls
        inVehicle={inVehicle}
        onControlChange={handleMobileControl}
        onHonkOrShoot={() => {
          if (inVehicle) handleHonk();
          else engineRef.current?.fireWeapon();
        }}
        onEnterExit={handleActionClick}
      />

      {/* Interactive Location Modals */}
      {activeModal === 'dealership' && (
        <CarDealershipModal
          onClose={() => setActiveModal(null)}
          cash={cash}
          onPurchase={handlePurchaseVehicle}
          onRepaint={handleRepaint}
          inVehicle={inVehicle}
        />
      )}

      {activeModal === 'gunshop' && (
        <GunShopModal
          onClose={() => setActiveModal(null)}
          cash={cash}
          onBuyWeapon={handleBuyWeapon}
          onBuyAmmo={handleBuyAmmo}
          onEquipWeapon={handleSwitchWeapon}
          currentWeapon={currentWeapon}
        />
      )}

      {activeModal === 'hospital' && (
        <HospitalModal
          onClose={() => setActiveModal(null)}
          health={health}
          cash={cash}
          onHeal={handleHeal}
        />
      )}

      {activeModal === 'police' && (
        <PoliceStationModal
          onClose={() => setActiveModal(null)}
          wantedStars={wantedStars}
          cash={cash}
          onClearWanted={handleClearWanted}
        />
      )}

      {activeModal === 'map' && (
        <FullMapModal
          onClose={() => setActiveModal(null)}
          onTeleport={handleTeleport}
          locations={[
            {
              id: 'dealership',
              name: 'Bharat Motors (Car Dealership)',
              hindiName: 'भारत मोटर्स',
              type: 'dealership',
              x: 75,
              z: 55,
              radius: 9,
              color: '#e53935',
              icon: '🏎️',
              description: 'Buy supercars, SUVs, vintage taxis & tuk-tuks, customize colors!',
            },
            {
              id: 'gunshop',
              name: 'Shree Ram Armory (Gun Shop)',
              hindiName: 'श्री राम आर्मरी',
              type: 'gunshop',
              x: -75,
              z: 55,
              radius: 9,
              color: '#fb8c00',
              icon: '🎯',
              description: 'Purchase handguns, assault rifles, shotguns, cricket bats & ammo.',
            },
            {
              id: 'hospital',
              name: 'City Care Hospital',
              hindiName: 'सिटी केयर हॉस्पिटल',
              type: 'hospital',
              x: -75,
              z: -55,
              radius: 9,
              color: '#43a047',
              icon: '🏥',
              description: 'Recover health, buy first-aid kits, ambulance emergency rescue.',
            },
            {
              id: 'police',
              name: 'Central Police Chowki',
              hindiName: 'केंद्रीय पुलिस चौकी',
              type: 'police',
              x: 75,
              z: -55,
              radius: 9,
              color: '#1e88e5',
              icon: '🚔',
              description: 'Pay bail, clear wanted stars, view city law enforcement.',
            },
            {
              id: 'monument',
              name: 'Rashtriya Smarak (Victory Monument)',
              hindiName: 'राष्ट्रीय स्मारक',
              type: 'monument',
              x: 0,
              z: 0,
              radius: 12,
              color: '#ffd54f',
              icon: '🏛️',
              description: 'Historic monument inspired by India Gate with national tricolor flag.',
            },
            {
              id: 'bazaar',
              name: 'Chandni Chowk Market & Food Bazaar',
              hindiName: 'चांदनी चौक बाज़ार',
              type: 'bazaar',
              x: 0,
              z: 110,
              radius: 14,
              color: '#8e24aa',
              icon: '☕',
              description: 'Chai tapri, samosa stall, fresh coconut water, souvenir market.',
            },
          ]}
        />
      )}
    </div>
  );
}
