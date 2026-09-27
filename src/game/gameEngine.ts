import * as THREE from 'three';
import { buildIndianCity, CityBundle } from './cityBuilder';
import { createWeatherSystem, WeatherSystemBundle } from './weatherSystem';
import { createTrafficAndNpcs, TrafficAndNpcBundle } from './trafficAndNpc';
import { createCharacterModel, CharacterBundle } from './characterModel';
import {
  createSportsCarMesh,
  createTukTukMesh,
  createAmbassadorMesh,
  createSuvMesh,
  createPoliceCarMesh,
  VehicleMeshBundle,
} from './vehicleModels';
import { sound } from '../audio/soundEngine';
import { VehicleDef, WeaponDef, WeatherType } from '../types/game';

export interface GameEngineCallbacks {
  onSpeedChange: (speedKmh: number, rpm: number, gear: number) => void;
  onVehicleStateChange: (inVehicle: boolean, vehicleName: string, headlightsOn: boolean) => void;
  onHealthChange: (hp: number) => void;
  onCashChange: (cash: number) => void;
  onWantedChange: (stars: number) => void;
  onLocationPrompt: (location: string | null, actionKey: string | null) => void;
  onNpcDialogue: (quote: string | null) => void;
  onEnterLocationModal: (locationId: string) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number = 0;
  private clock: THREE.Clock;

  // Subsystems
  private cityBundle: CityBundle;
  private weatherBundle: WeatherSystemBundle;
  private trafficBundle: TrafficAndNpcBundle;
  private playerCharacter: CharacterBundle;

  // Player state
  private isPlayerInVehicle: boolean = false;
  private activeVehicleIndex: number = 0;
  private vehicles: { bundle: VehicleMeshBundle; def: VehicleDef; speed: number; steerAngle: number }[] = [];

  // Foot movement state
  private playerPos = new THREE.Vector3(0, 0.22, 10);
  private playerVel = new THREE.Vector3();
  private playerHeading: number = 0;
  private isGrounded: boolean = true;
  private playerHealth: number = 100;
  private playerCash: number = 55000;
  private wantedStars: number = 0;
  private wantedTimer: number = 0;

  // Weapons
  private equippedWeaponId: string = 'pistol';
  private ammoCounts: Record<string, number> = {
    bat: 999,
    pistol: 60,
    ak47: 180,
    shotgun: 32,
  };
  private isShooting: boolean = false;
  private shootCooldown: number = 0;

  // Camera modes
  private cameraMode: 'chase' | 'hood' | 'top' = 'chase';
  private cameraAngleH: number = 0;
  private cameraAngleV: number = 0.25;

  // Input states
  private keys: Record<string, boolean> = {};
  private virtualControls = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
    sprint: false,
    jump: false,
    action: false,
  };

  // Particles
  private tireSmokeParticles: THREE.Points;
  private smokeGeo: THREE.BufferGeometry;
  private smokeCount = 120;
  private smokeIndex = 0;

  // Callbacks
  private callbacks: GameEngineCallbacks;

  // Vehicle headlights toggle
  private headlightsOn: boolean = false;
  private activeLocationId: string | null = null;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.2, 800);
    this.camera.position.set(0, 5, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // Subsystems
    this.cityBundle = buildIndianCity(this.scene);
    this.weatherBundle = createWeatherSystem(this.scene);
    this.trafficBundle = createTrafficAndNpcs(this.scene);

    // Player Character
    this.playerCharacter = createCharacterModel(true, 0xc68642);
    this.playerCharacter.group.position.copy(this.playerPos);
    this.scene.add(this.playerCharacter.group);

    // Vehicles Setup
    this.initVehicles();

    // Tire Smoke Particles
    this.smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(this.smokeCount * 3);
    this.smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    this.tireSmokeParticles = new THREE.Points(
      this.smokeGeo,
      new THREE.PointsMaterial({
        color: 0xcccccc,
        size: 0.8,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
    );
    this.scene.add(this.tireSmokeParticles);

    // Listeners
    this.setupInputs();
    window.addEventListener('resize', this.onResize);

    // Start loop
    this.loop();
  }

  private initVehicles() {
    // 1. Initial Player Supercar (Red Racer GT) parked at (4, 0, 10)
    const sportsCar = createSportsCarMesh('#e53935');
    sportsCar.group.position.set(4, 0, 10);
    this.scene.add(sportsCar.group);

    // 2. Desi Auto-Rickshaw parked at (-8, 0, 10)
    const tuktuk = createTukTukMesh();
    tuktuk.group.position.set(-8, 0, 10);
    this.scene.add(tuktuk.group);

    // 3. Vintage Ambassador Taxi parked at (12, 0, -20)
    const taxi = createAmbassadorMesh(true);
    taxi.group.position.set(12, 0, -20);
    this.scene.add(taxi.group);

    // 4. Heavy SUV parked at (-14, 0, -20)
    const suv = createSuvMesh('#1a237e');
    suv.group.position.set(-14, 0, -20);
    this.scene.add(suv.group);

    // 5. Police Interceptor parked at Police Chowki (70, 0, -42)
    const police = createPoliceCarMesh();
    police.group.position.set(70, 0, -42);
    this.scene.add(police.group);

    this.vehicles = [
      {
        bundle: sportsCar,
        def: {
          id: 'sports_racer',
          name: 'Racer GT V8',
          category: 'Sports',
          price: 150000,
          topSpeed: 195,
          acceleration: 85,
          handling: 90,
          braking: 88,
          color: '#e53935',
          unlocked: true,
          description: 'High performance coupe with rapid acceleration and aerodynamic bodywork.',
        },
        speed: 0,
        steerAngle: 0,
      },
      {
        bundle: tuktuk,
        def: {
          id: 'desi_tuktuk',
          name: 'Desi Auto Rickshaw',
          category: 'Rickshaw',
          price: 25000,
          topSpeed: 75,
          acceleration: 60,
          handling: 95,
          braking: 70,
          color: '#008037',
          unlocked: true,
          description: 'Iconic Indian three-wheeler with unbeatable nimbleness in tight city bazaars.',
        },
        speed: 0,
        steerAngle: 0,
      },
      {
        bundle: taxi,
        def: {
          id: 'royal_ambassador',
          name: 'Royal Ambassador Taxi',
          category: 'Classic Taxi',
          price: 45000,
          topSpeed: 120,
          acceleration: 55,
          handling: 65,
          braking: 72,
          color: '#ffcc00',
          unlocked: true,
          description: 'The beloved classic Indian road king with vintage chrome curves.',
        },
        speed: 0,
        steerAngle: 0,
      },
      {
        bundle: suv,
        def: {
          id: 'beast_suv',
          name: 'Fortuner Scorpio Beast',
          category: 'SUV',
          price: 85000,
          topSpeed: 160,
          acceleration: 75,
          handling: 78,
          braking: 82,
          color: '#1a237e',
          unlocked: false,
          description: 'Rugged muscular 4x4 SUV built to dominate every street and flyover.',
        },
        speed: 0,
        steerAngle: 0,
      },
      {
        bundle: police,
        def: {
          id: 'police_interceptor',
          name: 'Police Interceptor Patrol',
          category: 'Police',
          price: 120000,
          topSpeed: 210,
          acceleration: 92,
          handling: 92,
          braking: 90,
          color: '#ffffff',
          unlocked: false,
          description: 'High-speed law enforcement cruiser with functioning strobe beacons & siren.',
        },
        speed: 0,
        steerAngle: 0,
      },
    ];
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Toggle Enter / Exit Vehicle [E]
      if (e.code === 'KeyE') {
        if (this.isPlayerInVehicle) {
          this.exitVehicle();
        } else {
          // Check if near an interactive location first
          if (this.activeLocationId) {
            this.callbacks.onEnterLocationModal(this.activeLocationId);
          } else {
            this.tryEnterNearestVehicle();
          }
        }
      }

      // Horn [H]
      if (e.code === 'KeyH') {
        this.honkHorn();
      }

      // Headlights [L]
      if (e.code === 'KeyL') {
        this.toggleHeadlights();
      }

      // Switch Camera [C]
      if (e.code === 'KeyC') {
        this.cycleCamera();
      }

      // Fire weapon [KeyF or Space when on foot with weapon]
      if (e.code === 'KeyF' && !this.isPlayerInVehicle) {
        this.fireWeapon();
      }

      // Weapon slots 1 to 4
      if (e.code === 'Digit1') this.switchWeapon('bat');
      if (e.code === 'Digit2') this.switchWeapon('pistol');
      if (e.code === 'Digit3') this.switchWeapon('ak47');
      if (e.code === 'Digit4') this.switchWeapon('shotgun');
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse click to shoot when on foot
    window.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && !this.isPlayerInVehicle && !(e.target as HTMLElement).closest('button, input, select, .hud-interactive')) {
        this.fireWeapon();
      }
    });
  }

  public setVirtualControl(action: keyof typeof this.virtualControls, state: boolean) {
    this.virtualControls[action] = state;
  }

  public honkHorn() {
    if (this.isPlayerInVehicle) {
      const v = this.vehicles[this.activeVehicleIndex];
      sound.playHorn(v.def.category === 'Rickshaw' ? 'tuktuk' : 'car');
    }
  }

  public toggleHeadlights() {
    this.headlightsOn = !this.headlightsOn;
    this.vehicles.forEach((v) => {
      v.bundle.headlights.forEach((spot) => {
        spot.intensity = this.headlightsOn ? 4.5 : 0;
      });
    });
    const curName = this.isPlayerInVehicle ? this.vehicles[this.activeVehicleIndex].def.name : 'On Foot';
    this.callbacks.onVehicleStateChange(this.isPlayerInVehicle, curName, this.headlightsOn);
  }

  public cycleCamera() {
    if (this.cameraMode === 'chase') this.cameraMode = 'hood';
    else if (this.cameraMode === 'hood') this.cameraMode = 'top';
    else this.cameraMode = 'chase';
  }

  public switchWeapon(weaponId: string) {
    this.equippedWeaponId = weaponId;
    this.playerCharacter.setWeapon(weaponId);
  }

  public fireWeapon() {
    if (this.isPlayerInVehicle) return;
    if (this.shootCooldown > 0) return;

    const ammo = this.ammoCounts[this.equippedWeaponId] ?? 0;
    if (this.equippedWeaponId !== 'bat' && ammo <= 0) {
      return;
    }

    if (this.equippedWeaponId !== 'bat') {
      this.ammoCounts[this.equippedWeaponId] = ammo - 1;
    }

    this.isShooting = true;
    this.shootCooldown = this.equippedWeaponId === 'ak47' ? 0.12 : this.equippedWeaponId === 'shotgun' ? 0.6 : 0.25;

    sound.playWeaponShot(this.equippedWeaponId);

    // Muzzle flash
    this.playerCharacter.muzzleLight.intensity = 4.0;
    setTimeout(() => {
      this.playerCharacter.muzzleLight.intensity = 0;
    }, 60);

    // Hitscan bullet raycast
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerHeading);
    const ray = new THREE.Ray(
      new THREE.Vector3(this.playerPos.x, 1.3, this.playerPos.z),
      forward
    );

    const hit = this.trafficBundle.checkBulletHit(ray);
    if (hit.hit) {
      sound.playImpact();
      this.addWanted(1); // Crime detected!
    }

    setTimeout(() => {
      this.isShooting = false;
    }, 150);
  }

  public tryEnterNearestVehicle() {
    let nearestIdx = -1;
    let minDist = 4.5;

    this.vehicles.forEach((v, idx) => {
      const d = v.bundle.group.position.distanceTo(this.playerPos);
      if (d < minDist) {
        minDist = d;
        nearestIdx = idx;
      }
    });

    if (nearestIdx !== -1) {
      this.enterVehicle(nearestIdx);
    }
  }

  public enterVehicle(idx: number) {
    this.isPlayerInVehicle = true;
    this.activeVehicleIndex = idx;
    this.playerCharacter.group.visible = false;
    sound.playDoorThud();

    const v = this.vehicles[idx];
    if (v.bundle.policeStrobe) {
      sound.setPoliceSiren(true);
    }

    this.callbacks.onVehicleStateChange(true, v.def.name, this.headlightsOn);
  }

  public exitVehicle() {
    this.isPlayerInVehicle = false;
    const v = this.vehicles[this.activeVehicleIndex];
    v.speed = 0;
    sound.updateEngineSound(false, 0);

    if (v.bundle.policeStrobe) {
      sound.setPoliceSiren(false);
    }

    sound.playDoorThud();

    // Place character just beside driver side door
    const sideOffset = new THREE.Vector3(1.8, 0.22, 0).applyQuaternion(v.bundle.group.quaternion);
    this.playerPos.copy(v.bundle.group.position).add(sideOffset);
    this.playerCharacter.group.position.copy(this.playerPos);
    this.playerCharacter.group.visible = true;

    this.callbacks.onVehicleStateChange(false, 'On Foot', this.headlightsOn);
    this.callbacks.onSpeedChange(0, 800, 1);
  }

  public spawnPurchasedCar(def: VehicleDef) {
    let bundle: VehicleMeshBundle;
    if (def.category === 'Rickshaw') {
      bundle = createTukTukMesh();
    } else if (def.category === 'Classic Taxi') {
      bundle = createAmbassadorMesh(false);
    } else if (def.category === 'SUV') {
      bundle = createSuvMesh(def.color);
    } else if (def.category === 'Police') {
      bundle = createPoliceCarMesh();
    } else {
      bundle = createSportsCarMesh(def.color);
    }

    // Spawn right outside Bharat Motors showroom at (75, 0, 42)
    bundle.group.position.set(75, 0, 42);
    bundle.group.rotation.y = Math.PI;
    this.scene.add(bundle.group);

    const newVehicle = {
      bundle,
      def,
      speed: 0,
      steerAngle: 0,
    };
    this.vehicles.push(newVehicle);
    this.enterVehicle(this.vehicles.length - 1);
    sound.playCashSound();
  }

  public repaintCurrentCar(newColor: string) {
    if (this.isPlayerInVehicle) {
      const v = this.vehicles[this.activeVehicleIndex];
      v.def.color = newColor;
      const c = parseInt(newColor.replace('#', '0x'), 16);
      (v.bundle.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(c);
      sound.playCashSound();
    }
  }

  public setWeather(type: WeatherType) {
    this.weatherBundle.setWeather(type);
    const isNight = type === 'night';
    this.cityBundle.setNightLights(isNight);
    if (isNight && !this.headlightsOn) {
      this.toggleHeadlights();
    }
  }

  public addCash(amount: number) {
    this.playerCash += amount;
    this.callbacks.onCashChange(this.playerCash);
  }

  public spendCash(amount: number): boolean {
    if (this.playerCash >= amount) {
      this.playerCash -= amount;
      this.callbacks.onCashChange(this.playerCash);
      return true;
    }
    return false;
  }

  public healPlayer(amount: number) {
    this.playerHealth = Math.min(100, this.playerHealth + amount);
    this.callbacks.onHealthChange(this.playerHealth);
  }

  public addWanted(stars: number) {
    this.wantedStars = Math.min(5, this.wantedStars + stars);
    this.wantedTimer = 25;
    this.callbacks.onWantedChange(this.wantedStars);
    sound.setPoliceSiren(this.wantedStars > 0);
  }

  public clearWanted() {
    this.wantedStars = 0;
    this.callbacks.onWantedChange(0);
    sound.setPoliceSiren(false);
  }

  public teleportTo(x: number, z: number) {
    if (this.isPlayerInVehicle) {
      const v = this.vehicles[this.activeVehicleIndex];
      v.bundle.group.position.set(x, 0, z);
      v.speed = 0;
    } else {
      this.playerPos.set(x, 0.22, z);
      this.playerCharacter.group.position.set(x, 0.22, z);
    }
  }

  private updateVehiclePhysics(delta: number) {
    const v = this.vehicles[this.activeVehicleIndex];
    const topSpeedMs = (v.def.topSpeed * 1000) / 3600;
    const accelRate = (v.def.acceleration / 100) * 22;
    const brakeRate = (v.def.braking / 100) * 35;
    const isDrifting = this.keys['Space'] || this.virtualControls.handbrake;

    const isFwd = this.keys['KeyW'] || this.keys['ArrowUp'] || this.virtualControls.forward;
    const isBwd = this.keys['KeyS'] || this.keys['ArrowDown'] || this.virtualControls.backward;
    const isLeft = this.keys['KeyA'] || this.keys['ArrowLeft'] || this.virtualControls.left;
    const isRight = this.keys['KeyD'] || this.keys['ArrowRight'] || this.virtualControls.right;

    // Acceleration & Reverse
    if (isFwd) {
      v.speed = Math.min(topSpeedMs, v.speed + accelRate * delta);
    } else if (isBwd) {
      if (v.speed > 0.5) {
        v.speed = Math.max(0, v.speed - brakeRate * delta);
      } else {
        v.speed = Math.max(-12, v.speed - accelRate * 0.6 * delta);
      }
    } else {
      // Natural rolling friction
      if (v.speed > 0) v.speed = Math.max(0, v.speed - 6 * delta);
      if (v.speed < 0) v.speed = Math.min(0, v.speed + 6 * delta);
    }

    if (isDrifting && v.speed > 8) {
      v.speed = Math.max(4, v.speed - brakeRate * 0.4 * delta);
      this.spawnTireSmoke(v.bundle.group.position);
    }

    // Steering
    const maxSteer = 0.55;
    const steerSpeed = 2.4;
    if (isLeft) {
      v.steerAngle = Math.min(maxSteer, v.steerAngle + steerSpeed * delta);
    } else if (isRight) {
      v.steerAngle = Math.max(-maxSteer, v.steerAngle - steerSpeed * delta);
    } else {
      // Re-center wheel
      v.steerAngle *= 0.85;
    }

    // Turn front wheel pivots
    v.bundle.frontWheelPivots.forEach((p) => {
      p.rotation.y = v.steerAngle;
    });

    // Vehicle Heading Rotation
    if (Math.abs(v.speed) > 0.1) {
      const turnFactor = (v.def.handling / 100) * 1.8;
      const turnAmount = (v.steerAngle * turnFactor * (v.speed / topSpeedMs)) * delta * 2.5;
      v.bundle.group.rotation.y += turnAmount;
    }

    // Move Forward in Car Direction
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.bundle.group.rotation.y);
    const newPos = v.bundle.group.position.clone().add(forward.clone().multiplyScalar(v.speed * delta));

    // Boundary & Collisions
    if (Math.abs(newPos.x) < 235 && Math.abs(newPos.z) < 235) {
      v.bundle.group.position.copy(newPos);
    } else {
      v.speed = -v.speed * 0.4; // Bounce on city edge
      sound.playImpact();
    }

    // Spin wheels
    v.bundle.wheels.forEach((w) => {
      w.rotation.x += (v.speed / 0.35) * delta;
    });

    // Police Strobe Flashing (if police interceptor)
    if (v.bundle.policeStrobe) {
      const time = this.clock.getElapsedTime();
      const flash = Math.sin(time * 12) > 0;
      v.bundle.policeStrobe.redLight.intensity = flash ? 3.0 : 0;
      v.bundle.policeStrobe.blueLight.intensity = !flash ? 3.0 : 0;
    }

    // Sound
    const speedKmh = Math.abs(Math.round(v.speed * 3.6));
    const speedRatio = Math.min(1, Math.abs(v.speed) / topSpeedMs);
    sound.updateEngineSound(true, speedRatio, isDrifting);

    // Speedometer Callback
    const rpm = 900 + speedRatio * 6500;
    const gear = Math.max(1, Math.min(6, Math.floor(speedRatio * 6) + 1));
    this.callbacks.onSpeedChange(speedKmh, rpm, gear);
  }

  private updateOnFootPhysics(delta: number) {
    if (this.shootCooldown > 0) this.shootCooldown -= delta;

    const isFwd = this.keys['KeyW'] || this.keys['ArrowUp'] || this.virtualControls.forward;
    const isBwd = this.keys['KeyS'] || this.keys['ArrowDown'] || this.virtualControls.backward;
    const isLeft = this.keys['KeyA'] || this.keys['ArrowLeft'] || this.virtualControls.left;
    const isRight = this.keys['KeyD'] || this.keys['ArrowRight'] || this.virtualControls.right;
    const isSprint = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.virtualControls.sprint;

    let moveX = 0;
    let moveZ = 0;
    if (isFwd) moveZ += 1;
    if (isBwd) moveZ -= 1;
    if (isLeft) moveX += 1;
    if (isRight) moveX -= 1;

    const isMoving = moveX !== 0 || moveZ !== 0;

    if (isMoving) {
      const inputAngle = Math.atan2(moveX, moveZ);
      this.playerHeading = this.cameraAngleH + inputAngle;
      const walkSpeed = isSprint ? 8.5 : 4.5;

      this.playerPos.x += Math.sin(this.playerHeading) * walkSpeed * delta;
      this.playerPos.z += Math.cos(this.playerHeading) * walkSpeed * delta;
    }

    this.playerCharacter.group.position.x = this.playerPos.x;
    this.playerCharacter.group.position.z = this.playerPos.z;
    this.playerCharacter.group.rotation.y = this.playerHeading;
    this.playerCharacter.updateAnimation(isMoving, isSprint, delta, this.isShooting);

    sound.updateEngineSound(false, 0);
    this.callbacks.onSpeedChange(0, 0, 0);
  }

  private updateCamera() {
    const targetPos = this.isPlayerInVehicle
      ? this.vehicles[this.activeVehicleIndex].bundle.group.position
      : this.playerPos;

    const targetRotY = this.isPlayerInVehicle
      ? this.vehicles[this.activeVehicleIndex].bundle.group.rotation.y
      : this.playerHeading;

    if (this.cameraMode === 'chase') {
      const dist = this.isPlayerInVehicle ? 8.5 : 5.0;
      const height = this.isPlayerInVehicle ? 3.5 : 2.5;

      const idealOffset = new THREE.Vector3(0, height, -dist);
      idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotY);
      idealOffset.add(targetPos);

      this.camera.position.lerp(idealOffset, 0.12);
      this.camera.lookAt(targetPos.x, targetPos.y + (this.isPlayerInVehicle ? 1.2 : 1.5), targetPos.z);
    } else if (this.cameraMode === 'hood') {
      // First person / hood view
      const hoodOffset = new THREE.Vector3(0, 1.4, 0.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotY).add(targetPos);
      this.camera.position.copy(hoodOffset);
      const lookTarget = new THREE.Vector3(0, 1.2, 15).applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotY).add(targetPos);
      this.camera.lookAt(lookTarget);
    } else {
      // Top down eagle view
      this.camera.position.set(targetPos.x, targetPos.y + 40, targetPos.z - 10);
      this.camera.lookAt(targetPos.x, targetPos.y, targetPos.z);
    }
  }

  private checkProximityInteractions() {
    const curPos = this.isPlayerInVehicle
      ? this.vehicles[this.activeVehicleIndex].bundle.group.position
      : this.playerPos;

    // Check nearest landmark
    let activeLoc: string | null = null;
    let promptText: string | null = null;
    let actionKey: string | null = null;

    for (const loc of this.cityBundle.locations) {
      const dist = Math.hypot(loc.x - curPos.x, loc.z - curPos.z);
      if (dist <= loc.radius) {
        activeLoc = loc.id;
        promptText = `${loc.name} (${loc.hindiName})`;
        actionKey = '[E] Enter / Interact';
        break;
      }
    }

    this.activeLocationId = activeLoc;

    if (!activeLoc && !this.isPlayerInVehicle) {
      // Check if near any car to enter
      let nearCar = false;
      this.vehicles.forEach((v) => {
        if (v.bundle.group.position.distanceTo(curPos) < 4.5) {
          nearCar = true;
          promptText = `Drive ${v.def.name}`;
          actionKey = '[E] Enter Vehicle';
        }
      });
      if (!nearCar) {
        promptText = null;
        actionKey = null;
      }
    }

    this.callbacks.onLocationPrompt(promptText, actionKey);

    // Nearby NPC dialogue check
    const quote = this.trafficBundle.getNearbyNpcDialogue(curPos);
    this.callbacks.onNpcDialogue(quote);
  }

  private spawnTireSmoke(pos: THREE.Vector3) {
    const attr = this.smokeGeo.attributes.position as THREE.BufferAttribute;
    const array = attr.array as Float32Array;

    const idx = (this.smokeIndex % this.smokeCount) * 3;
    array[idx] = pos.x + (Math.random() - 0.5) * 1.5;
    array[idx + 1] = 0.2 + Math.random() * 0.4;
    array[idx + 2] = pos.z + (Math.random() - 0.5) * 1.5;
    this.smokeIndex++;
    attr.needsUpdate = true;
  }

  private loop = () => {
    this.animFrameId = requestAnimationFrame(this.loop);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.isPlayerInVehicle) {
      this.updateVehiclePhysics(delta);
    } else {
      this.updateOnFootPhysics(delta);
    }

    this.updateCamera();

    // Subsystem updates
    this.weatherBundle.update(delta);
    const isHonk = this.keys['KeyH'];
    const pPos = this.isPlayerInVehicle
      ? this.vehicles[this.activeVehicleIndex].bundle.group.position
      : this.playerPos;
    this.trafficBundle.update(delta, pPos, isHonk);

    this.checkProximityInteractions();

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  public destroy() {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    sound.updateEngineSound(false, 0);
    sound.setRainActive(false);
    sound.setPoliceSiren(false);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
