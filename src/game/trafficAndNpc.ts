import * as THREE from 'three';
import { createCharacterModel, CharacterBundle } from './characterModel';
import { createTukTukMesh, createAmbassadorMesh, createSportsCarMesh, VehicleMeshBundle } from './vehicleModels';
import { NPCData, TrafficCarData } from '../types/game';

export interface TrafficAndNpcBundle {
  update: (delta: number, playerPos: THREE.Vector3, isHonking: boolean) => void;
  npcList: NPCData[];
  checkBulletHit: (ray: THREE.Ray) => { hit: boolean; npcId?: number; point?: THREE.Vector3 };
  getNearbyNpcDialogue: (playerPos: THREE.Vector3) => string | null;
}

export function createTrafficAndNpcs(scene: THREE.Scene): TrafficAndNpcBundle {
  const npcGroup = new THREE.Group();
  const trafficGroup = new THREE.Group();

  // 1. NPC Pedestrians
  const npcModels: CharacterBundle[] = [];
  const npcList: NPCData[] = [];

  const npcColors = [
    { skin: 0xc68642, jacket: 0x1565c0 }, // Blue kurta
    { skin: 0x8d5524, jacket: 0x2e7d32 }, // Green jacket
    { skin: 0xe0ac69, jacket: 0xd84315 }, // Saffron kurta
    { skin: 0xc68642, jacket: 0x6a1b9a }, // Purple shirt
    { skin: 0x5a3d28, jacket: 0xf57f17 }, // Mustard yellow
    { skin: 0x8d5524, jacket: 0x00838f }, // Teal shirt
  ];

  // Spawn pedestrians on sidewalks
  const spawnPoints = [
    { x: 20, z: 25 }, { x: -25, z: 30 }, { x: 35, z: -25 }, { x: -40, z: -30 },
    { x: 60, z: 20 }, { x: -65, z: 22 }, { x: 80, z: -20 }, { x: -80, z: -22 },
    { x: 15, z: 75 }, { x: -15, z: 85 }, { x: 15, z: -75 }, { x: -15, z: -85 },
    { x: 10, z: 110 }, { x: -10, z: 110 }, { x: 5, z: 120 }, { x: -5, z: 120 },
  ];

  spawnPoints.forEach((sp, idx) => {
    const col = npcColors[idx % npcColors.length];
    const char = createCharacterModel(false, col.skin, col.jacket);
    char.group.position.set(sp.x, 0.22, sp.z);
    scene.add(char.group);
    npcModels.push(char);

    npcList.push({
      id: idx,
      meshIndex: idx,
      x: sp.x,
      z: sp.z,
      targetX: sp.x + (Math.random() - 0.5) * 40,
      targetZ: sp.z + (Math.random() - 0.5) * 40,
      speed: 1.8 + Math.random() * 1.2,
      heading: Math.random() * Math.PI * 2,
      color: `#${col.jacket.toString(16).padStart(6, '0')}`,
      isScared: false,
    });
  });

  // Indian pedestrian quotes for nearby dialogue
  const desiQuotes = [
    'नमस्ते भाई! गाड़ी संभल के चलाओ यार! (Namaste! Drive carefully!)',
    'अरे भाई, चांदनी चौक की चाय पी क्या? (Bro, did you try Chandni Chowk tea?)',
    'क्या मौसम है आज! (What fantastic weather today!)',
    'ऑटो वाला मीटर से नहीं चल रहा यार! (Auto guy refusing the meter again!)',
    'भारत माता की जय! (Hail India!)',
    'पुलिस चौकी पास में ही है, कोई पंगा मत लेना! (Police Chowki is nearby, no drama!)',
    'शानदार गाड़ी है तुम्हारी! (That is a magnificent ride!)',
  ];

  // 2. Traffic Vehicles (AI Cars & Tuk-Tuks driving along lanes)
  const trafficVehicles: { bundle: VehicleMeshBundle; data: TrafficCarData }[] = [];

  const trafficConfigs: TrafficCarData[] = [
    // East-West lanes (z: 6 for Eastbound, z: -6 for Westbound)
    { id: 1, x: -120, z: 6, direction: 'east', speed: 14, targetSpeed: 14, color: '#fbc02d', type: 'cab' },
    { id: 2, x: 40, z: 6, direction: 'east', speed: 12, targetSpeed: 12, color: '#008037', type: 'tuktuk' },
    { id: 3, x: 100, z: -6, direction: 'west', speed: 15, targetSpeed: 15, color: '#1976d2', type: 'sedan' },
    { id: 4, x: -60, z: -6, direction: 'west', speed: 11, targetSpeed: 11, color: '#008037', type: 'tuktuk' },

    // North-South lanes (x: 6 for Southbound, x: -6 for Northbound)
    { id: 5, x: 6, z: -100, direction: 'south', speed: 13, targetSpeed: 13, color: '#fbc02d', type: 'cab' },
    { id: 6, x: 6, z: 50, direction: 'south', speed: 15, targetSpeed: 15, color: '#d32f2f', type: 'sedan' },
    { id: 7, x: -6, z: 120, direction: 'north', speed: 11, targetSpeed: 11, color: '#008037', type: 'tuktuk' },
    { id: 8, x: -6, z: -40, direction: 'north', speed: 14, targetSpeed: 14, color: '#ffffff', type: 'sedan' },
  ];

  trafficConfigs.forEach((cfg) => {
    let bundle: VehicleMeshBundle;
    if (cfg.type === 'tuktuk') {
      bundle = createTukTukMesh();
    } else if (cfg.type === 'cab') {
      bundle = createAmbassadorMesh(true);
    } else {
      bundle = createSportsCarMesh(cfg.color);
    }

    bundle.group.position.set(cfg.x, 0, cfg.z);

    // Initial rotation based on direction
    if (cfg.direction === 'east') bundle.group.rotation.y = Math.PI / 2;
    if (cfg.direction === 'west') bundle.group.rotation.y = -Math.PI / 2;
    if (cfg.direction === 'south') bundle.group.rotation.y = Math.PI;
    if (cfg.direction === 'north') bundle.group.rotation.y = 0;

    trafficGroup.add(bundle.group);
    trafficVehicles.push({ bundle, data: cfg });
  });

  scene.add(trafficGroup);

  // Update loop
  const update = (delta: number, playerPos: THREE.Vector3, isHonking: boolean) => {
    // 1. Update Pedestrians
    npcList.forEach((npc, i) => {
      const model = npcModels[i];
      if (!model) return;

      const distToPlayer = Math.hypot(npc.x - playerPos.x, npc.z - playerPos.z);

      // React to player car honking or speeding close
      if ((isHonking && distToPlayer < 18) || distToPlayer < 3.5) {
        npc.isScared = true;
        // Run away from player
        const dx = npc.x - playerPos.x;
        const dz = npc.z - playerPos.z;
        npc.heading = Math.atan2(dx, dz);
        npc.speed = 4.5; // Sprint!
      } else if (npc.isScared && distToPlayer > 12) {
        npc.isScared = false;
        npc.speed = 1.8;
      }

      // Move toward target
      const dx = npc.targetX - npc.x;
      const dz = npc.targetZ - npc.z;
      const distToTarget = Math.hypot(dx, dz);

      if (distToTarget < 1.5 && !npc.isScared) {
        // Pick new sidewalk destination
        npc.targetX = npc.x + (Math.random() - 0.5) * 35;
        npc.targetZ = npc.z + (Math.random() - 0.5) * 35;
        // Keep within sidewalk bounds approximately
        if (Math.abs(npc.targetX) > 180) npc.targetX *= 0.7;
        if (Math.abs(npc.targetZ) > 180) npc.targetZ *= 0.7;
      } else {
        const moveDist = npc.speed * delta;
        const angle = Math.atan2(dx, dz);
        npc.heading = angle;
        npc.x += Math.sin(angle) * moveDist;
        npc.z += Math.cos(angle) * moveDist;
      }

      model.group.position.x = npc.x;
      model.group.position.z = npc.z;
      model.group.rotation.y = npc.heading;
      model.updateAnimation(true, npc.isScared, delta);
    });

    // 2. Update Traffic Cars
    trafficVehicles.forEach(({ bundle, data }) => {
      const roadLimit = 220;
      const dist = data.speed * delta;

      if (data.direction === 'east') {
        data.x += dist;
        if (data.x > roadLimit) data.x = -roadLimit;
      } else if (data.direction === 'west') {
        data.x -= dist;
        if (data.x < -roadLimit) data.x = roadLimit;
      } else if (data.direction === 'south') {
        data.z += dist;
        if (data.z > roadLimit) data.z = -roadLimit;
      } else if (data.direction === 'north') {
        data.z -= dist;
        if (data.z < -roadLimit) data.z = roadLimit;
      }

      bundle.group.position.x = data.x;
      bundle.group.position.z = data.z;

      // Spin wheels
      bundle.wheels.forEach((w) => {
        w.rotation.x += dist * 1.5;
      });
    });
  };

  const checkBulletHit = (ray: THREE.Ray) => {
    for (let i = 0; i < npcList.length; i++) {
      const npc = npcList[i];
      const sphere = new THREE.Sphere(new THREE.Vector3(npc.x, 1.2, npc.z), 1.0);
      const hitPoint = new THREE.Vector3();
      if (ray.intersectSphere(sphere, hitPoint)) {
        return { hit: true, npcId: npc.id, point: hitPoint };
      }
    }
    return { hit: false };
  };

  const getNearbyNpcDialogue = (playerPos: THREE.Vector3): string | null => {
    for (let i = 0; i < npcList.length; i++) {
      const npc = npcList[i];
      const d = Math.hypot(npc.x - playerPos.x, npc.z - playerPos.z);
      if (d < 4.0) {
        return desiQuotes[i % desiQuotes.length];
      }
    }
    return null;
  };

  return {
    update,
    npcList,
    checkBulletHit,
    getNearbyNpcDialogue,
  };
}
