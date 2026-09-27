import * as THREE from 'three';
import { CityLocation } from '../types/game';
import {
  createRoadTexture,
  createSidewalkTexture,
  createZebraTexture,
  createBuildingFacadeTexture,
  createBillboardTexture,
  createIndiaFlagTexture,
  createStoreSignTexture,
} from './proceduralTextures';

export interface CityBundle {
  cityGroup: THREE.Group;
  colliders: THREE.Box3[];
  locations: CityLocation[];
  streetLampLights: THREE.PointLight[];
  setNightLights: (isNight: boolean) => void;
}

export function buildIndianCity(scene: THREE.Scene): CityBundle {
  const cityGroup = new THREE.Group();
  const colliders: THREE.Box3[] = [];
  const streetLampLights: THREE.PointLight[] = [];

  const locations: CityLocation[] = [
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
  ];

  // Textures
  const roadTex = createRoadTexture(4);
  const roadTex2Lanes = createRoadTexture(2);
  const sidewalkTex = createSidewalkTexture();
  const zebraTex = createZebraTexture();
  const modernFacade = createBuildingFacadeTexture('modern');
  const warmFacade = createBuildingFacadeTexture('warm');
  const heritageFacade = createBuildingFacadeTexture('heritage');
  const indiaFlagTex = createIndiaFlagTexture();

  // Materials
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.9 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ map: sidewalkTex, roughness: 0.8 });
  const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.7 });
  const zebraMat = new THREE.MeshStandardMaterial({ map: zebraTex, roughness: 0.7 });
  const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xd49b6a, roughness: 0.75 }); // Jaisalmer sandstone

  // 1. Base Ground / Grass
  const groundGeo = new THREE.PlaneGeometry(600, 600);
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.05;
  groundMesh.receiveShadow = true;
  cityGroup.add(groundMesh);

  // Helper to add road segment
  const addRoad = (x: number, z: number, w: number, l: number, isVertical: boolean = false) => {
    const geo = new THREE.PlaneGeometry(w, l);
    const mesh = new THREE.Mesh(geo, roadMat);
    mesh.rotation.x = -Math.PI / 2;
    if (isVertical) mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, 0.01, z);
    mesh.receiveShadow = true;
    cityGroup.add(mesh);
  };

  // Helper to add Sidewalk
  const addSidewalk = (x: number, z: number, w: number, l: number) => {
    const geo = new THREE.BoxGeometry(w, 0.22, l);
    const mesh = new THREE.Mesh(geo, sidewalkMat);
    mesh.position.set(x, 0.11, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    cityGroup.add(mesh);
  };

  // Helper to register collider box
  const addCollider = (mesh: THREE.Mesh | THREE.Box3, margin: number = 0) => {
    if (mesh instanceof THREE.Box3) {
      colliders.push(mesh);
    } else {
      const box = new THREE.Box3().setFromObject(mesh);
      if (margin !== 0) {
        box.expandByScalar(margin);
      }
      colliders.push(box);
    }
  };

  // 2. Road Network:
  // Grand East-West Main Arterial (width 24m)
  addRoad(0, 0, 480, 24);
  // Grand North-South Main Arterial (width 24m)
  addRoad(0, 0, 480, 24, true);

  // Ring/Parallel Roads at z = 110, z = -110, x = 110, x = -110
  addRoad(0, 110, 480, 18);
  addRoad(0, -110, 480, 18);
  addRoad(110, 0, 480, 18, true);
  addRoad(-110, 0, 480, 18, true);

  // Sidewalks along main avenues
  // East-West sidewalks
  addSidewalk(0, 15, 480, 4);
  addSidewalk(0, -15, 480, 4);
  // North-South sidewalks
  addSidewalk(15, 0, 4, 480);
  addSidewalk(-15, 0, 4, 480);

  // Pedestrian Zebra Crossings at intersections
  const zebraPositions = [
    { x: 18, z: 0, rot: true },
    { x: -18, z: 0, rot: true },
    { x: 0, z: 18, rot: false },
    { x: 0, z: -18, rot: false },
    { x: 110, z: 18, rot: false },
    { x: 110, z: -18, rot: false },
    { x: -110, z: 18, rot: false },
    { x: -110, z: -18, rot: false },
  ];
  zebraPositions.forEach((zp) => {
    const zm = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), zebraMat);
    zm.rotation.x = -Math.PI / 2;
    if (zp.rot) zm.rotation.z = Math.PI / 2;
    zm.position.set(zp.x, 0.02, zp.z);
    cityGroup.add(zm);
  });

  // 3. Central Plaza: India Gate / Victory Arch Monument (x: 0, z: 0 - raised plaza)
  const plazaIsland = new THREE.Mesh(
    new THREE.CylinderGeometry(24, 25, 0.4, 32),
    new THREE.MeshStandardMaterial({ color: 0x3d7042, roughness: 0.85 }) // Lush lawn
  );
  plazaIsland.position.set(0, 0.2, 0);
  cityGroup.add(plazaIsland);

  // Monument Sandstone Arch
  const archGroup = new THREE.Group();
  archGroup.position.set(0, 0.4, 0);

  // Left pillar
  const pillarL = new THREE.Mesh(new THREE.BoxGeometry(3, 14, 4), sandstoneMat);
  pillarL.position.set(-5, 7, 0);
  pillarL.castShadow = true;
  archGroup.add(pillarL);
  addCollider(pillarL);

  // Right pillar
  const pillarR = pillarL.clone();
  pillarR.position.set(5, 7, 0);
  archGroup.add(pillarR);
  addCollider(pillarR);

  // Top Arch Span
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(15, 4, 4.5), sandstoneMat);
  archTop.position.set(0, 14, 0);
  archTop.castShadow = true;
  archGroup.add(archTop);

  // Cornice decorative roof
  const archRoof = new THREE.Mesh(new THREE.BoxGeometry(17, 1.2, 5.2), sandstoneMat);
  archRoof.position.set(0, 16.5, 0);
  archRoof.castShadow = true;
  archGroup.add(archRoof);

  // Indian Tricolor Flagpole & Flag
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 })
  );
  pole.position.set(0, 12, 6);
  pole.castShadow = true;
  archGroup.add(pole);

  // Flag mesh
  const flagMat = new THREE.MeshStandardMaterial({
    map: indiaFlagTex,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3), flagMat);
  flagMesh.position.set(2.3, 21.5, 6);
  flagMesh.castShadow = true;
  archGroup.add(flagMesh);

  cityGroup.add(archGroup);

  // 4. Overpass / Metro Viaduct (Elevated Rail)
  const metroGroup = new THREE.Group();
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.7 });
  const railBeamMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.6 });

  // Elevated track along z = -32 across entire city (x from -200 to 200)
  for (let x = -200; x <= 200; x += 35) {
    // Pillar
    const metroPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 12, 16), concreteMat);
    metroPillar.position.set(x, 6, -32);
    metroPillar.castShadow = true;
    metroGroup.add(metroPillar);
    addCollider(metroPillar);
  }

  // Viaduct Deck Beam
  const viaductDeck = new THREE.Mesh(new THREE.BoxGeometry(420, 1.5, 7), railBeamMat);
  viaductDeck.position.set(0, 12.2, -32);
  viaductDeck.castShadow = true;
  metroGroup.add(viaductDeck);

  // Overhead Metro Train
  const trainMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.3 }); // Delhi/Mumbai metro blue
  const trainBody = new THREE.Mesh(new THREE.BoxGeometry(45, 3.2, 3.6), trainMat);
  trainBody.position.set(30, 14.5, -32);
  trainBody.castShadow = true;
  metroGroup.add(trainBody);

  cityGroup.add(metroGroup);

  // 5. LANDMARK BUILDING 1: BHARAT MOTORS (Car Dealership at 75, 55)
  const dealerGroup = new THREE.Group();
  dealerGroup.position.set(75, 0, 55);

  // Showroom base
  const dealerBase = new THREE.Mesh(
    new THREE.BoxGeometry(26, 8, 22),
    new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.2 })
  );
  dealerBase.position.y = 4;
  dealerBase.castShadow = true;
  dealerGroup.add(dealerBase);
  addCollider(dealerBase);

  // Huge Glass facade
  const dealerGlass = new THREE.Mesh(
    new THREE.BoxGeometry(22, 6, 0.4),
    new THREE.MeshPhysicalMaterial({ color: 0x64b5f6, transparent: true, opacity: 0.65, roughness: 0.1 })
  );
  dealerGlass.position.set(0, 3.5, 11.1);
  dealerGroup.add(dealerGlass);

  // Glowing Dealership Signboard
  const dealerSignTex = createStoreSignTexture('BHARAT MOTORS', 'LUXURY SUPERCARS & AUTOS', '#d32f2f', '#ffffff');
  const dealerSign = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 3.5),
    new THREE.MeshStandardMaterial({ map: dealerSignTex, emissive: 0x220000, emissiveIntensity: 0.6 })
  );
  dealerSign.position.set(0, 9.2, 11.2);
  dealerGroup.add(dealerSign);

  // Entrance Beacon Circle on Ground
  const dealerMarker = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 3.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xff3b30, side: THREE.DoubleSide })
  );
  dealerMarker.rotation.x = -Math.PI / 2;
  dealerMarker.position.set(0, 0.05, 14);
  dealerGroup.add(dealerMarker);

  cityGroup.add(dealerGroup);

  // 6. LANDMARK BUILDING 2: SHREE RAM TACTICAL & ARMORY (Gun Dealership at -75, 55)
  const gunGroup = new THREE.Group();
  gunGroup.position.set(-75, 0, 55);

  const gunBase = new THREE.Mesh(
    new THREE.BoxGeometry(24, 7.5, 20),
    new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.7 })
  );
  gunBase.position.y = 3.75;
  gunBase.castShadow = true;
  gunGroup.add(gunBase);
  addCollider(gunBase);

  const gunSignTex = createStoreSignTexture('SHREE RAM ARMORY', 'TACTICAL GEAR & WEAPONS', '#ff6f00', '#ffffff');
  const gunSign = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 3.5),
    new THREE.MeshStandardMaterial({ map: gunSignTex, emissive: 0x331100, emissiveIntensity: 0.6 })
  );
  gunSign.position.set(0, 8.8, 10.2);
  gunGroup.add(gunSign);

  const gunMarker = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 3.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xff9500, side: THREE.DoubleSide })
  );
  gunMarker.rotation.x = -Math.PI / 2;
  gunMarker.position.set(0, 0.05, 13);
  gunGroup.add(gunMarker);

  cityGroup.add(gunGroup);

  // 7. LANDMARK BUILDING 3: CITY CARE HOSPITAL (at -75, -55)
  const hospGroup = new THREE.Group();
  hospGroup.position.set(-75, 0, -55);

  // Main white & blue hospital building
  const hospBase = new THREE.Mesh(
    new THREE.BoxGeometry(28, 14, 24),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 })
  );
  hospBase.position.y = 7;
  hospBase.castShadow = true;
  hospGroup.add(hospBase);
  addCollider(hospBase);

  // Emergency Red Cross symbol
  const crossH = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.4, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xd32f2f, emissive: 0x440000 })
  );
  crossH.position.set(0, 11, 12.2);
  const crossV = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xd32f2f, emissive: 0x440000 })
  );
  crossV.position.set(0, 11, 12.2);
  hospGroup.add(crossH, crossV);

  const hospSignTex = createStoreSignTexture('CITY CARE HOSPITAL', '24/7 EMERGENCY & TRAUMA', '#2e7d32', '#ffffff');
  const hospSign = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 3),
    new THREE.MeshStandardMaterial({ map: hospSignTex })
  );
  hospSign.position.set(0, 6.5, 12.2);
  hospGroup.add(hospSign);

  // Hospital entrance circle
  const hospMarker = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 3.2, 32),
    new THREE.MeshBasicMaterial({ color: 0x34c759, side: THREE.DoubleSide })
  );
  hospMarker.rotation.x = -Math.PI / 2;
  hospMarker.position.set(0, 0.05, 15);
  hospGroup.add(hospMarker);

  cityGroup.add(hospGroup);

  // 8. LANDMARK BUILDING 4: CENTRAL POLICE CHOWKI (at 75, -55)
  const policeGroup = new THREE.Group();
  policeGroup.position.set(75, 0, -55);

  const policeBase = new THREE.Mesh(
    new THREE.BoxGeometry(26, 9, 22),
    new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.6 }) // Khaki police stone
  );
  policeBase.position.y = 4.5;
  policeBase.castShadow = true;
  policeGroup.add(policeBase);
  addCollider(policeBase);

  // Police Blue Ribbon Trim
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(26.2, 1.2, 22.2),
    new THREE.MeshStandardMaterial({ color: 0x0d47a1 })
  );
  trim.position.y = 8.5;
  policeGroup.add(trim);

  // Police Sign
  const policeSignTex = createStoreSignTexture('CENTRAL POLICE CHOWKI', 'DIAL 100 / 112 HEADQUARTERS', '#0d47a1', '#ffffff');
  const policeSign = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 3.2),
    new THREE.MeshStandardMaterial({ map: policeSignTex })
  );
  policeSign.position.set(0, 6.5, 11.2);
  policeGroup.add(policeSign);

  // Police beacon on roof
  const polRoofLight = new THREE.PointLight(0x0055ff, 1.5, 15);
  polRoofLight.position.set(0, 10, 0);
  policeGroup.add(polRoofLight);

  // Police marker
  const polMarker = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 3.2, 32),
    new THREE.MeshBasicMaterial({ color: 0x007aff, side: THREE.DoubleSide })
  );
  polMarker.rotation.x = -Math.PI / 2;
  polMarker.position.set(0, 0.05, 14);
  policeGroup.add(polMarker);

  cityGroup.add(policeGroup);

  // 9. CHANDNI CHOWK BAZAAR & STREET FOOD MARKET (at 0, 110)
  const bazaarGroup = new THREE.Group();
  bazaarGroup.position.set(0, 0, 110);

  // Bazaar arched gate
  const bzGateTex = createStoreSignTexture('CHANDNI CHOWK', 'VIBRANT BAZAAR & CHAI TAPRI', '#6a1b9a', '#ffeb3b');
  const bzGate = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 3),
    new THREE.MeshStandardMaterial({ map: bzGateTex })
  );
  bzGate.position.set(0, 6.5, 0);
  bazaarGroup.add(bzGate);

  // Canopy Stalls (Chai, Samosa, Flowers)
  const canopyColors = [0xe91e63, 0xff9800, 0x4caf50, 0x00bcd4, 0x9c27b0];
  [-18, -9, 0, 9, 18].forEach((xPos, idx) => {
    const stall = new THREE.Group();
    stall.position.set(xPos, 0, 8);

    // Table
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 1.0, 2),
      new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
    );
    table.position.y = 0.5;
    stall.add(table);

    // Colorful Canopy Tent
    const tent = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 1.4, 4),
      new THREE.MeshStandardMaterial({ color: canopyColors[idx % canopyColors.length] })
    );
    tent.rotation.y = Math.PI / 4;
    tent.position.y = 2.8;
    stall.add(tent);

    // Poles
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    p1.position.set(-1.4, 1.2, -0.8);
    const p2 = p1.clone();
    p2.position.set(1.4, 1.2, -0.8);
    stall.add(p1, p2);

    bazaarGroup.add(stall);
    addCollider(table);
  });

  cityGroup.add(bazaarGroup);

  // 10. Commercial Highrises & Residential City Blocks
  const buildingLayouts = [
    // North-East Block
    { x: 50, z: 155, w: 28, h: 42, d: 24, style: 'modern' as const },
    { x: 95, z: 155, w: 26, h: 32, d: 22, style: 'warm' as const },
    { x: 145, z: 155, w: 32, h: 54, d: 26, style: 'modern' as const },
    { x: 155, z: 105, w: 26, h: 36, d: 24, style: 'heritage' as const },
    { x: 155, z: 50, w: 28, h: 48, d: 26, style: 'modern' as const },

    // North-West Block
    { x: -50, z: 155, w: 28, h: 38, d: 24, style: 'warm' as const },
    { x: -95, z: 155, w: 26, h: 46, d: 22, style: 'modern' as const },
    { x: -145, z: 155, w: 30, h: 30, d: 26, style: 'heritage' as const },
    { x: -155, z: 105, w: 26, h: 52, d: 24, style: 'modern' as const },
    { x: -155, z: 50, w: 28, h: 36, d: 26, style: 'warm' as const },

    // South-East Block
    { x: 50, z: -155, w: 28, h: 45, d: 24, style: 'modern' as const },
    { x: 95, z: -155, w: 26, h: 34, d: 22, style: 'heritage' as const },
    { x: 145, z: -155, w: 32, h: 50, d: 26, style: 'modern' as const },
    { x: 155, z: -105, w: 26, h: 40, d: 24, style: 'warm' as const },
    { x: 155, z: -50, w: 28, h: 35, d: 26, style: 'modern' as const },

    // South-West Block
    { x: -50, z: -155, w: 28, h: 36, d: 24, style: 'heritage' as const },
    { x: -95, z: -155, w: 26, h: 48, d: 22, style: 'modern' as const },
    { x: -145, z: -155, w: 30, h: 32, d: 26, style: 'warm' as const },
    { x: -155, z: -105, w: 26, h: 42, d: 24, style: 'modern' as const },
    { x: -155, z: -50, w: 28, h: 50, d: 26, style: 'modern' as const },
  ];

  buildingLayouts.forEach((b) => {
    const facadeTex = b.style === 'modern' ? modernFacade : b.style === 'warm' ? warmFacade : heritageFacade;
    const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
    const bMat = new THREE.MeshStandardMaterial({
      map: facadeTex,
      roughness: 0.6,
      metalness: b.style === 'modern' ? 0.4 : 0.1,
    });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(b.x, b.h / 2, b.z);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    cityGroup.add(bMesh);
    addCollider(bMesh);

    // Roof Water Tank (Iconic Indian rooftop Syntex water tank)
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x1565c0 }) // Blue plastic water tank
    );
    tank.position.set(b.x + (Math.random() - 0.5) * 8, b.h + 1.25, b.z + (Math.random() - 0.5) * 8);
    cityGroup.add(tank);
  });

  // 11. Bollywood & Brand Billboards on Select Rooftops
  const billboardData = [
    { x: 50, y: 44, z: 155, title: 'DILWALE 3D', sub: 'IN CINEMAS THIS DIWALI', bg: '#c2185b', ac: '#ffd700' },
    { x: -95, y: 48, z: 155, title: 'BHARAT T20 LEAGUE', sub: 'SEASON FINALE LIVE', bg: '#0d47a1', ac: '#00e676' },
    { x: 145, y: 56, z: -155, title: 'ROYAL RAJPUTANA JEWELS', sub: 'PURE 24K GOLD & DIAMONDS', bg: '#b71c1c', ac: '#ffe082' },
    { x: -155, y: 52, z: 105, title: 'DESI CHAI TAPRI', sub: 'KADAK MASALA CHAI & SAMOSA', bg: '#e65100', ac: '#ffffff' },
  ];

  billboardData.forEach((bb) => {
    const bbTex = createBillboardTexture(bb.title, bb.sub, bb.bg, bb.ac);
    const bbBoard = new THREE.Mesh(
      new THREE.BoxGeometry(16, 8, 0.4),
      new THREE.MeshStandardMaterial({ map: bbTex, emissive: 0x222222, emissiveIntensity: 0.5 })
    );
    bbBoard.position.set(bb.x, bb.y + 4.5, bb.z);
    cityGroup.add(bbBoard);

    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    legL.position.set(bb.x - 6, bb.y + 1.5, bb.z);
    const legR = legL.clone();
    legR.position.x = bb.x + 6;
    cityGroup.add(legL, legR);
  });

  // 12. Indian Street Lamps & Streetlights
  const lampPositions = [
    // Along Main East-West
    { x: -160, z: 14 }, { x: -100, z: 14 }, { x: -40, z: 14 }, { x: 40, z: 14 }, { x: 100, z: 14 }, { x: 160, z: 14 },
    { x: -160, z: -14 }, { x: -100, z: -14 }, { x: -40, z: -14 }, { x: 40, z: -14 }, { x: 100, z: -14 }, { x: 160, z: -14 },
    // Along Main North-South
    { x: 14, z: -160 }, { x: 14, z: -100 }, { x: 14, z: -40 }, { x: 14, z: 40 }, { x: 14, z: 100 }, { x: 14, z: 160 },
    { x: -14, z: -160 }, { x: -14, z: -100 }, { x: -14, z: -40 }, { x: -14, z: 40 }, { x: -14, z: 100 }, { x: -14, z: 160 },
  ];

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });

  lampPositions.forEach((lp) => {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(lp.x, 0, lp.z);

    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.5;
    lampGroup.add(pole);

    // Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), poleMat);
    arm.position.set(lp.x > 0 ? -0.8 : 0.8, 6.9, 0);
    lampGroup.add(arm);

    // Light fixture
    const fixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.2, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe082, emissiveIntensity: 0.8 })
    );
    fixture.position.set(lp.x > 0 ? -1.4 : 1.4, 6.7, 0);
    lampGroup.add(fixture);

    // Warm PointLight for night
    const pl = new THREE.PointLight(0xfffaed, 0, 28, 1.2);
    pl.position.set(lp.x > 0 ? -1.4 : 1.4, 6.5, 0);
    lampGroup.add(pl);
    streetLampLights.push(pl);

    cityGroup.add(lampGroup);
  });

  // 13. Palm Trees & Gulmohar Trees
  const treePositions = [
    { x: -30, z: 25 }, { x: 30, z: 25 }, { x: -30, z: -25 }, { x: 30, z: -25 },
    { x: -90, z: 25 }, { x: 90, z: 25 }, { x: -90, z: -25 }, { x: 90, z: -25 },
    { x: -130, z: 25 }, { x: 130, z: 25 }, { x: -130, z: -25 }, { x: 130, z: -25 },
    { x: -25, z: 80 }, { x: 25, z: 80 }, { x: -25, z: -80 }, { x: 25, z: -80 },
  ];

  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 6, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });
  const foliageGeo = new THREE.DodecahedronGeometry(3.2, 1);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7, flatShading: true });
  const gulmoharMat = new THREE.MeshStandardMaterial({ color: 0xd84315, roughness: 0.7, flatShading: true }); // Red-orange Gulmohar blossoms

  treePositions.forEach((tp, i) => {
    const tree = new THREE.Group();
    tree.position.set(tp.x, 0, tp.z);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(foliageGeo, i % 3 === 0 ? gulmoharMat : foliageMat);
    foliage.position.y = 7;
    foliage.scale.set(1.1, 0.85, 1.1);
    foliage.castShadow = true;
    tree.add(foliage);

    cityGroup.add(tree);
  });

  const setNightLights = (isNight: boolean) => {
    streetLampLights.forEach((l) => {
      l.intensity = isNight ? 2.5 : 0;
    });
  };

  scene.add(cityGroup);

  return {
    cityGroup,
    colliders,
    locations,
    streetLampLights,
    setNightLights,
  };
}
