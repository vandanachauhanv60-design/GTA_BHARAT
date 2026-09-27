import * as THREE from 'three';

export interface VehicleMeshBundle {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  frontWheelPivots: THREE.Group[];
  headlights: THREE.SpotLight[];
  taillights: THREE.Mesh[];
  bodyMesh: THREE.Mesh;
  policeStrobe?: { redLight: THREE.PointLight; blueLight: THREE.PointLight; barGroup: THREE.Group };
  type: string;
}

// Helper: Wheel creation
function createWheel(radius: number, width: number, rimColor: number = 0xd0d0d0): THREE.Mesh {
  const group = new THREE.Group();
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 16);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const tireMesh = new THREE.Mesh(tireGeo, tireMat);
  tireMesh.castShadow = true;
  group.add(tireMesh);

  // Rim
  const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width * 1.05, 12);
  rimGeo.rotateZ(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({ color: rimColor, metalness: 0.8, roughness: 0.2 });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  group.add(rimMesh);

  // Hub cap center
  const hubGeo = new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, width * 1.1, 8);
  hubGeo.rotateZ(Math.PI / 2);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.9, roughness: 0.1 });
  const hubMesh = new THREE.Mesh(hubGeo, hubMat);
  group.add(hubMesh);

  return group as unknown as THREE.Mesh;
}

// 1. SPORTS CAR
export function createSportsCarMesh(colorHex: string = '#e53935'): VehicleMeshBundle {
  const group = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const frontPivots: THREE.Group[] = [];
  const headlights: THREE.SpotLight[] = [];
  const taillights: THREE.Mesh[] = [];

  const mainColor = parseInt(colorHex.replace('#', '0x'), 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    metalness: 0.6,
    roughness: 0.2,
  });

  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.5,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x112233,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  // Lower chassis
  const chassisGeo = new THREE.BoxGeometry(1.9, 0.45, 4.4);
  const bodyMesh = new THREE.Mesh(chassisGeo, bodyMat);
  bodyMesh.position.y = 0.5;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Hood taper & nose
  const noseGeo = new THREE.BoxGeometry(1.85, 0.3, 1.4);
  const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
  noseMesh.position.set(0, 0.52, 1.5);
  noseMesh.castShadow = true;
  group.add(noseMesh);

  // Cabin / Roof
  const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.0);
  const cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
  cabinMesh.position.set(0, 0.98, -0.2);
  cabinMesh.castShadow = true;
  group.add(cabinMesh);

  // Windshield & Windows
  const windGeo = new THREE.BoxGeometry(1.52, 0.55, 1.9);
  const windMesh = new THREE.Mesh(windGeo, glassMat);
  windMesh.position.set(0, 1.0, -0.2);
  group.add(windMesh);

  // Rear spoiler
  const spoilerWingGeo = new THREE.BoxGeometry(1.8, 0.08, 0.4);
  const spoilerWing = new THREE.Mesh(spoilerWingGeo, darkTrimMat);
  spoilerWing.position.set(0, 1.05, -2.0);
  group.add(spoilerWing);

  const strut1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), darkTrimMat);
  strut1.position.set(0.6, 0.85, -2.0);
  const strut2 = strut1.clone();
  strut2.position.set(-0.6, 0.85, -2.0);
  group.add(strut1, strut2);

  // Front Splitter
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.08, 0.4), darkTrimMat);
  splitter.position.set(0, 0.28, 2.2);
  group.add(splitter);

  // Headlights
  [-0.65, 0.65].forEach((xPos) => {
    const lampMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.14, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0c0, emissiveIntensity: 0.8 })
    );
    lampMesh.position.set(xPos, 0.58, 2.22);
    group.add(lampMesh);

    const spot = new THREE.SpotLight(0xfff3d6, 0, 45, Math.PI / 6, 0.4, 1.5);
    spot.position.set(xPos, 0.6, 2.2);
    const target = new THREE.Object3D();
    target.position.set(xPos, 0.1, 15);
    group.add(target);
    spot.target = target;
    group.add(spot);
    headlights.push(spot);
  });

  // Taillights
  [-0.65, 0.65].forEach((xPos) => {
    const tailMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.12, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff1111, emissiveIntensity: 0.8 })
    );
    tailMesh.position.set(xPos, 0.6, -2.22);
    group.add(tailMesh);
    taillights.push(tailMesh);
  });

  // Wheels
  const wheelR = 0.38;
  const wheelW = 0.28;
  const wheelPositions = [
    { x: -0.98, y: 0.38, z: 1.35, isFront: true },
    { x: 0.98, y: 0.38, z: 1.35, isFront: true },
    { x: -0.98, y: 0.38, z: -1.35, isFront: false },
    { x: 0.98, y: 0.38, z: -1.35, isFront: false },
  ];

  wheelPositions.forEach((pos) => {
    const wheel = createWheel(wheelR, wheelW, 0xffd700);
    if (pos.isFront) {
      const pivot = new THREE.Group();
      pivot.position.set(pos.x, pos.y, pos.z);
      pivot.add(wheel);
      group.add(pivot);
      frontPivots.push(pivot);
    } else {
      wheel.position.set(pos.x, pos.y, pos.z);
      group.add(wheel);
    }
    wheels.push(wheel);
  });

  return {
    group,
    wheels,
    frontWheelPivots: frontPivots,
    headlights,
    taillights,
    bodyMesh,
    type: 'sports',
  };
}

// 2. INDIAN AUTO-RICKSHAW (TUK-TUK)
export function createTukTukMesh(): VehicleMeshBundle {
  const group = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const frontPivots: THREE.Group[] = [];
  const headlights: THREE.SpotLight[] = [];
  const taillights: THREE.Mesh[] = [];

  // Authentic yellow roof + green lower body
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x008037, roughness: 0.4 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffc400, roughness: 0.3 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.7 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

  // Lower chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 2.6), greenMat);
  chassis.position.y = 0.55;
  chassis.castShadow = true;
  group.add(chassis);

  // Front cabin tapering
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, 0.8, 8), greenMat);
  nose.position.set(0, 0.7, 1.25);
  group.add(nose);

  // Yellow Curved Roof
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.75, 2.2, 10, 1, false, 0, Math.PI), yellowMat);
  roof.rotation.z = Math.PI;
  roof.rotation.y = Math.PI / 2;
  roof.position.set(0, 1.75, -0.1);
  roof.scale.set(1.0, 0.5, 0.95);
  roof.castShadow = true;
  group.add(roof);

  // Canopy side frames & pillars
  const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1);
  [-0.65, 0.65].forEach((x) => {
    [-1.0, 0.0, 0.8].forEach((z) => {
      const p = new THREE.Mesh(pillarGeo, blackMat);
      p.position.set(x, 1.15, z);
      group.add(p);
    });
  });

  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.6, 0.05),
    new THREE.MeshPhysicalMaterial({ color: 0x334455, transparent: true, opacity: 0.7 })
  );
  windshield.position.set(0, 1.25, 0.85);
  windshield.rotation.x = -0.15;
  group.add(windshield);

  // Handlebar & Meter Console
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7), chromeMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.95, 0.65);
  group.add(bar);

  // Driver Bench Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 0.4), blackMat);
  seat.position.set(0, 0.7, 0.35);
  group.add(seat);

  // Rear Passenger Bench Seat
  const rearSeat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.6), blackMat);
  rearSeat.position.set(0, 0.75, -0.65);
  group.add(rearSeat);

  // Single Front Wheel
  const frontWheel = createWheel(0.3, 0.18, 0x888888);
  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, 0.3, 1.2);
  frontPivot.add(frontWheel);
  group.add(frontPivot);
  frontPivots.push(frontPivot);
  wheels.push(frontWheel);

  // Two Rear Wheels
  [-0.68, 0.68].forEach((x) => {
    const rearWheel = createWheel(0.32, 0.2, 0x888888);
    rearWheel.position.set(x, 0.32, -0.75);
    group.add(rearWheel);
    wheels.push(rearWheel);
  });

  // Front Center Round Headlight
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfffae0, emissiveIntensity: 1 })
  );
  lamp.rotation.x = Math.PI / 2;
  lamp.position.set(0, 0.85, 1.45);
  group.add(lamp);

  const spot = new THREE.SpotLight(0xfff3d6, 0, 35, Math.PI / 5, 0.3, 1.5);
  spot.position.set(0, 0.85, 1.45);
  const target = new THREE.Object3D();
  target.position.set(0, 0.1, 12);
  group.add(target);
  spot.target = target;
  group.add(spot);
  headlights.push(spot);

  // Taillights
  [-0.45, 0.45].forEach((x) => {
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 })
    );
    tail.position.set(x, 0.6, -1.32);
    group.add(tail);
    taillights.push(tail);
  });

  return {
    group,
    wheels,
    frontWheelPivots: frontPivots,
    headlights,
    taillights,
    bodyMesh: chassis,
    type: 'tuktuk',
  };
}

// 3. CLASSIC INDIAN AMBASSADOR TAXI / SEDAN
export function createAmbassadorMesh(isTaxi: boolean = true): VehicleMeshBundle {
  const group = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const frontPivots: THREE.Group[] = [];
  const headlights: THREE.SpotLight[] = [];
  const taillights: THREE.Mesh[] = [];

  const mainColor = isTaxi ? 0xffcc00 : 0xf2f4f7;
  const roofColor = isTaxi ? 0x111111 : 0xf2f4f7;

  const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, metalness: 0.3, roughness: 0.3 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, metalness: 0.3, roughness: 0.3 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.1 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x223344, transparent: true, opacity: 0.75 });

  // Curved chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 4.3), bodyMat);
  chassis.position.y = 0.55;
  chassis.castShadow = true;
  group.add(chassis);

  // Rounded Vintage Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.65, 2.3), roofMat);
  cabin.position.set(0, 1.1, -0.1);
  cabin.castShadow = true;
  group.add(cabin);

  // Rounded Hood & Trunk Curves
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.3, 1.4), bodyMat);
  hood.position.set(0, 0.7, 1.45);
  group.add(hood);

  // Chrome Grille front
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.1), chromeMat);
  grille.position.set(0, 0.6, 2.2);
  group.add(grille);

  // Front & Rear Chrome Bumpers
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.18, 0.2), chromeMat);
  frontBumper.position.set(0, 0.38, 2.22);
  const rearBumper = frontBumper.clone();
  rearBumper.position.set(0, 0.38, -2.22);
  group.add(frontBumper, rearBumper);

  // Glass Windows
  const windows = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.55, 2.1), glassMat);
  windows.position.set(0, 1.12, -0.1);
  group.add(windows);

  // Taxi Roof Board (if taxi)
  if (isTaxi) {
    const taxiSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.2, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xfff0aa, emissive: 0xffaa00, emissiveIntensity: 0.6 })
    );
    taxiSign.position.set(0, 1.5, 0.1);
    group.add(taxiSign);
  }

  // Classic Round Headlights
  [-0.68, 0.68].forEach((x) => {
    const lamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6dd, emissiveIntensity: 0.9 })
    );
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(x, 0.65, 2.2);
    group.add(lamp);

    const spot = new THREE.SpotLight(0xfff3d6, 0, 40, Math.PI / 6, 0.3, 1.5);
    spot.position.set(x, 0.65, 2.2);
    const target = new THREE.Object3D();
    target.position.set(x, 0.1, 14);
    group.add(target);
    spot.target = target;
    group.add(spot);
    headlights.push(spot);
  });

  // Taillights
  [-0.68, 0.68].forEach((x) => {
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff1100, emissiveIntensity: 0.8 })
    );
    tail.position.set(x, 0.65, -2.18);
    group.add(tail);
    taillights.push(tail);
  });

  // Wheels
  const wheelPositions = [
    { x: -0.92, y: 0.38, z: 1.3, isFront: true },
    { x: 0.92, y: 0.38, z: 1.3, isFront: true },
    { x: -0.92, y: 0.38, z: -1.3, isFront: false },
    { x: 0.92, y: 0.38, z: -1.3, isFront: false },
  ];

  wheelPositions.forEach((pos) => {
    const wheel = createWheel(0.38, 0.25, 0xcccccc);
    if (pos.isFront) {
      const pivot = new THREE.Group();
      pivot.position.set(pos.x, pos.y, pos.z);
      pivot.add(wheel);
      group.add(pivot);
      frontPivots.push(pivot);
    } else {
      wheel.position.set(pos.x, pos.y, pos.z);
      group.add(wheel);
    }
    wheels.push(wheel);
  });

  return {
    group,
    wheels,
    frontWheelPivots: frontPivots,
    headlights,
    taillights,
    bodyMesh: chassis,
    type: 'ambassador',
  };
}

// 4. POLICE INTERCEPTOR (CHOWKI PATROL CAR)
export function createPoliceCarMesh(): VehicleMeshBundle {
  const bundle = createSportsCarMesh('#ffffff');
  const group = bundle.group;

  // Add blue decals on sides
  const decalGeo = new THREE.BoxGeometry(0.04, 0.25, 3.0);
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x0044cc });
  const decalL = new THREE.Mesh(decalGeo, blueMat);
  decalL.position.set(-0.96, 0.55, 0);
  const decalR = decalL.clone();
  decalR.position.x = 0.96;
  group.add(decalL, decalR);

  // Roof Strobe Light Bar
  const barGroup = new THREE.Group();
  barGroup.position.set(0, 1.35, -0.2);

  const mount = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.08, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  barGroup.add(mount);

  // Red beacon (Left)
  const redCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.12, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 })
  );
  redCap.position.x = -0.35;
  barGroup.add(redCap);

  const redLight = new THREE.PointLight(0xff0000, 0, 12);
  redLight.position.set(-0.35, 0.1, 0);
  barGroup.add(redLight);

  // Blue beacon (Right)
  const blueCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.12, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x0066ff, emissive: 0x0066ff, emissiveIntensity: 1 })
  );
  blueCap.position.x = 0.35;
  barGroup.add(blueCap);

  const blueLight = new THREE.PointLight(0x0066ff, 0, 12);
  blueLight.position.set(0.35, 0.1, 0);
  barGroup.add(blueLight);

  group.add(barGroup);

  bundle.policeStrobe = { redLight, blueLight, barGroup };
  bundle.type = 'police';
  return bundle;
}

// 5. HEAVY SUV (SCORPIO / FORTUNER BEAST)
export function createSuvMesh(colorHex: string = '#1a237e'): VehicleMeshBundle {
  const group = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const frontPivots: THREE.Group[] = [];
  const headlights: THREE.SpotLight[] = [];
  const taillights: THREE.Mesh[] = [];

  const mainColor = parseInt(colorHex.replace('#', '0x'), 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, metalness: 0.5, roughness: 0.3 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x112233, transparent: true, opacity: 0.8 });

  // High chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 4.6), bodyMat);
  chassis.position.y = 0.75;
  chassis.castShadow = true;
  group.add(chassis);

  // Tall cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.85, 3.0), bodyMat);
  cabin.position.set(0, 1.45, -0.4);
  cabin.castShadow = true;
  group.add(cabin);

  // Front muscular hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 1.4), bodyMat);
  hood.position.set(0, 0.95, 1.6);
  group.add(hood);

  // Roof Rails
  [-0.85, 0.85].forEach((x) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 2.6), trimMat);
    rail.position.set(x, 1.92, -0.4);
    group.add(rail);
  });

  // Windows
  const windows = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 2.9), glassMat);
  windows.position.set(0, 1.47, -0.4);
  group.add(windows);

  // Rear Mounted Spare Wheel
  const spare = createWheel(0.42, 0.28, 0x111111);
  spare.rotation.y = Math.PI / 2;
  spare.position.set(0, 1.0, -2.4);
  group.add(spare);

  // Heavy Front Bumper Bullbar
  const bullbar = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.3, 0.25), trimMat);
  bullbar.position.set(0, 0.5, 2.35);
  group.add(bullbar);

  // Headlights
  [-0.78, 0.78].forEach((x) => {
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.22, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 })
    );
    lamp.position.set(x, 0.9, 2.32);
    group.add(lamp);

    const spot = new THREE.SpotLight(0xfff5e6, 0, 50, Math.PI / 5, 0.4, 1.5);
    spot.position.set(x, 0.9, 2.3);
    const target = new THREE.Object3D();
    target.position.set(x, 0.2, 16);
    group.add(target);
    spot.target = target;
    group.add(spot);
    headlights.push(spot);
  });

  // Taillights
  [-0.8, 0.8].forEach((x) => {
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 })
    );
    tail.position.set(x, 1.1, -2.32);
    group.add(tail);
    taillights.push(tail);
  });

  // Big SUV Wheels
  const wheelPositions = [
    { x: -1.08, y: 0.48, z: 1.4, isFront: true },
    { x: 1.08, y: 0.48, z: 1.4, isFront: true },
    { x: -1.08, y: 0.48, z: -1.4, isFront: false },
    { x: 1.08, y: 0.48, z: -1.4, isFront: false },
  ];

  wheelPositions.forEach((pos) => {
    const wheel = createWheel(0.48, 0.32, 0x333333);
    if (pos.isFront) {
      const pivot = new THREE.Group();
      pivot.position.set(pos.x, pos.y, pos.z);
      pivot.add(wheel);
      group.add(pivot);
      frontPivots.push(pivot);
    } else {
      wheel.position.set(pos.x, pos.y, pos.z);
      group.add(wheel);
    }
    wheels.push(wheel);
  });

  return {
    group,
    wheels,
    frontWheelPivots: frontPivots,
    headlights,
    taillights,
    bodyMesh: chassis,
    type: 'suv',
  };
}
