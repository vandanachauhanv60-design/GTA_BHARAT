import * as THREE from 'three';

export interface CharacterBundle {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Mesh;
  weaponMount: THREE.Group;
  muzzleLight: THREE.PointLight;
  updateAnimation: (isMoving: boolean, isRunning: boolean, delta: number, isShooting?: boolean) => void;
  setWeapon: (weaponId: string) => void;
}

export function createCharacterModel(isPlayer: boolean = true, skinTone: number = 0xc68642, jacketColor: number = 0x1f2937): CharacterBundle {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 });
  const jacketMat = new THREE.MeshStandardMaterial({
    color: isPlayer ? 0xe65100 : jacketColor, // Vibrant saffron/orange bomber jacket for player
    roughness: 0.4,
  });
  const jeansMat = new THREE.MeshStandardMaterial({ color: 0x1a365d, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

  // 1. Torso & Jacket
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.28), jacketMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  group.add(torso);

  // Inner shirt collar
  const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.08), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  shirt.position.set(0, 1.28, 0.12);
  group.add(shirt);

  // 2. Head & Hair
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.55, 0);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.26), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.28), hairMat);
  hair.position.y = 0.16;
  headGroup.add(hair);

  // Cool sunglasses if player
  if (isPlayer) {
    const glasses = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.07, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.9 })
    );
    glasses.position.set(0, 0.04, 0.14);
    headGroup.add(glasses);
  }

  group.add(headGroup);

  // 3. Legs
  const legGeo = new THREE.BoxGeometry(0.18, 0.7, 0.2);
  const shoeGeo = new THREE.BoxGeometry(0.2, 0.14, 0.26);

  // Left Leg Pivot
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.7, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, jeansMat);
  leftLegMesh.position.y = -0.32;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.66, 0.03);
  leftShoe.castShadow = true;
  leftLeg.add(leftShoe);
  group.add(leftLeg);

  // Right Leg Pivot
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.7, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, jeansMat);
  rightLegMesh.position.y = -0.32;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.66, 0.03);
  rightShoe.castShadow = true;
  rightLeg.add(rightShoe);
  group.add(rightLeg);

  // 4. Arms
  const armGeo = new THREE.BoxGeometry(0.14, 0.6, 0.16);
  const handGeo = new THREE.BoxGeometry(0.12, 0.14, 0.12);

  // Left Arm Pivot
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 1.3, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, jacketMat);
  leftArmMesh.position.y = -0.28;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.58;
  leftArm.add(leftHand);
  group.add(leftArm);

  // Right Arm Pivot (Holds Weapon)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 1.3, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, jacketMat);
  rightArmMesh.position.y = -0.28;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.58;
  rightArm.add(rightHand);

  // Weapon Mount in Right Hand
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.58, 0.1);
  rightArm.add(weaponMount);

  // Muzzle light for shooting
  const muzzleLight = new THREE.PointLight(0xffaa22, 0, 8);
  muzzleLight.position.set(0, 0, 0.4);
  weaponMount.add(muzzleLight);

  group.add(rightArm);

  // Weapon Models Cache
  const weaponMeshes: Record<string, THREE.Group> = {};

  // Cricket Bat
  const batGroup = new THREE.Group();
  const batBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.65, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.6 })
  );
  batBlade.position.set(0, 0.25, 0);
  const batHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  batHandle.position.set(0, -0.15, 0);
  batGroup.add(batBlade, batHandle);
  batGroup.rotation.x = Math.PI / 4;
  weaponMeshes['bat'] = batGroup;

  // Pistol
  const pistolGroup = new THREE.Group();
  const pBarrel = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.08, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 })
  );
  pBarrel.position.set(0, 0.05, 0.1);
  const pGrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.14, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x5a2d0c })
  );
  pGrip.position.set(0, -0.05, 0);
  pistolGroup.add(pBarrel, pGrip);
  weaponMeshes['pistol'] = pistolGroup;

  // AK47
  const rifleGroup = new THREE.Group();
  const rBarrel = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.09, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 })
  );
  rBarrel.position.set(0, 0.06, 0.25);
  const rStock = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.12, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  rStock.position.set(0, 0, -0.15);
  const rMag = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  rMag.position.set(0, -0.12, 0.1);
  rMag.rotation.x = -0.3;
  rifleGroup.add(rBarrel, rStock, rMag);
  weaponMeshes['ak47'] = rifleGroup;

  // Shotgun
  const shotGroup = new THREE.Group();
  const sBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 })
  );
  sBarrel.rotation.x = Math.PI / 2;
  sBarrel.position.set(0, 0.05, 0.25);
  const sGrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.12, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x5c4033 })
  );
  sGrip.position.set(0, -0.02, -0.05);
  shotGroup.add(sBarrel, sGrip);
  weaponMeshes['shotgun'] = shotGroup;

  // Initial weapon: bat or none
  let currentWeaponId = isPlayer ? 'pistol' : 'unarmed';
  if (weaponMeshes[currentWeaponId]) {
    weaponMount.add(weaponMeshes[currentWeaponId]);
  }

  const setWeapon = (wId: string) => {
    currentWeaponId = wId;
    while (weaponMount.children.length > 1) {
      weaponMount.remove(weaponMount.children[weaponMount.children.length - 1]);
    }
    if (weaponMeshes[wId]) {
      weaponMount.add(weaponMeshes[wId]);
    }
  };

  // Animation cycle
  let animTime = 0;
  const updateAnimation = (isMoving: boolean, isRunning: boolean, delta: number, isShooting: boolean = false) => {
    if (isMoving) {
      const speed = isRunning ? 16 : 9;
      animTime += delta * speed;
      const swing = Math.sin(animTime);

      leftLeg.rotation.x = swing * 0.65;
      rightLeg.rotation.x = -swing * 0.65;

      if (!isShooting) {
        leftArm.rotation.x = -swing * 0.55;
        if (currentWeaponId === 'unarmed') {
          rightArm.rotation.x = swing * 0.55;
        } else {
          // Keep weapon raised slightly
          rightArm.rotation.x = -Math.PI / 4 + swing * 0.1;
        }
      }
    } else {
      // Idle breathing
      animTime += delta * 2;
      const breath = Math.sin(animTime) * 0.02;
      torso.position.y = 1.05 + breath;
      headGroup.position.y = 1.55 + breath;

      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = 0;

      if (!isShooting) {
        if (currentWeaponId === 'unarmed') {
          rightArm.rotation.x = 0;
        } else {
          rightArm.rotation.x = -Math.PI / 4;
        }
      }
    }

    if (isShooting) {
      // Aim forward
      rightArm.rotation.x = -Math.PI / 2;
      leftArm.rotation.x = -Math.PI / 2.3;
    }
  };

  return {
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    head,
    weaponMount,
    muzzleLight,
    updateAnimation,
    setWeapon,
  };
}
