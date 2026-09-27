import * as THREE from 'three';
import { WeatherType } from '../types/game';
import { sound } from '../audio/soundEngine';

export interface WeatherSystemBundle {
  update: (delta: number) => void;
  setWeather: (type: WeatherType) => void;
  setTimeOfDay: (hour: number) => void;
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  rainParticles: THREE.Points;
  cloudsGroup: THREE.Group;
}

export function createWeatherSystem(scene: THREE.Scene): WeatherSystemBundle {
  // 1. Lights
  const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
  sunLight.position.set(120, 200, 80);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 400;
  const shadowRange = 120;
  sunLight.shadow.camera.left = -shadowRange;
  sunLight.shadow.camera.right = shadowRange;
  sunLight.shadow.camera.top = shadowRange;
  sunLight.shadow.camera.bottom = -shadowRange;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d352e, 1.2);
  scene.add(hemiLight);

  // 2. Clouds Group
  const cloudsGroup = new THREE.Group();
  const cloudGeo = new THREE.DodecahedronGeometry(12, 1);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    flatShading: true,
    transparent: true,
    opacity: 0.8,
  });

  for (let i = 0; i < 24; i++) {
    const cluster = new THREE.Group();
    const cx = (Math.random() - 0.5) * 500;
    const cz = (Math.random() - 0.5) * 500;
    const cy = 80 + Math.random() * 35;
    cluster.position.set(cx, cy, cz);

    const puffs = 3 + Math.floor(Math.random() * 4);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      puff.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 20);
      const s = 0.8 + Math.random() * 1.4;
      puff.scale.set(s, s * 0.6, s);
      cluster.add(puff);
    }
    cloudsGroup.add(cluster);
  }
  scene.add(cloudsGroup);

  // 3. Monsoon Rain Particles
  const rainCount = 4500;
  const rainGeo = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);
  const rainSpeeds = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 160;
    rainPositions[i * 3 + 1] = Math.random() * 80;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    rainSpeeds[i] = 45 + Math.random() * 35;
  }

  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

  // Rain texture canvas
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(8, 0, 8, 64);
  grad.addColorStop(0, 'rgba(200, 230, 255, 0.9)');
  grad.addColorStop(1, 'rgba(150, 200, 255, 0.1)');
  ctx.fillStyle = grad;
  ctx.fillRect(6, 0, 4, 64);
  const rainTex = new THREE.CanvasTexture(canvas);

  const rainMat = new THREE.PointsMaterial({
    color: 0xbed6ee,
    size: 1.2,
    map: rainTex,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const rainParticles = new THREE.Points(rainGeo, rainMat);
  rainParticles.visible = false;
  scene.add(rainParticles);

  // 4. Fog
  scene.fog = new THREE.FogExp2(0xd6e5f3, 0.0035);

  let currentWeather: WeatherType = 'sunny';
  let thunderTimer = 0;
  let isThunderFlashing = false;

  const setWeather = (type: WeatherType) => {
    currentWeather = type;

    if (type === 'sunny') {
      scene.background = new THREE.Color(0x76b6e4);
      if (scene.fog) {
        scene.fog.color.setHex(0xb2d9f7);
        (scene.fog as THREE.FogExp2).density = 0.0025;
      }
      sunLight.color.setHex(0xfffaed);
      sunLight.intensity = 2.4;
      hemiLight.color.setHex(0x87ceeb);
      hemiLight.groundColor.setHex(0x4a3b32);
      hemiLight.intensity = 1.2;
      rainParticles.visible = false;
      sound.setRainActive(false);
    } else if (type === 'sunset') {
      // Golden Indian Sunset
      scene.background = new THREE.Color(0xe65c36);
      if (scene.fog) {
        scene.fog.color.setHex(0xf58b54);
        (scene.fog as THREE.FogExp2).density = 0.0035;
      }
      sunLight.color.setHex(0xff7722);
      sunLight.intensity = 2.0;
      hemiLight.color.setHex(0xff9966);
      hemiLight.groundColor.setHex(0x3d1a24);
      hemiLight.intensity = 1.0;
      rainParticles.visible = false;
      sound.setRainActive(false);
    } else if (type === 'rain') {
      // Dark Indian Monsoon
      scene.background = new THREE.Color(0x273746);
      if (scene.fog) {
        scene.fog.color.setHex(0x34495e);
        (scene.fog as THREE.FogExp2).density = 0.007;
      }
      sunLight.color.setHex(0x85929e);
      sunLight.intensity = 0.8;
      hemiLight.color.setHex(0x566573);
      hemiLight.groundColor.setHex(0x1c2833);
      hemiLight.intensity = 0.6;
      rainParticles.visible = true;
      sound.setRainActive(true);
    } else if (type === 'night') {
      // Midnight Neon
      scene.background = new THREE.Color(0x080c16);
      if (scene.fog) {
        scene.fog.color.setHex(0x0c1322);
        (scene.fog as THREE.FogExp2).density = 0.0045;
      }
      sunLight.color.setHex(0x4a69bd);
      sunLight.intensity = 0.35;
      hemiLight.color.setHex(0x1e293b);
      hemiLight.groundColor.setHex(0x0a0e17);
      hemiLight.intensity = 0.45;
      rainParticles.visible = false;
      sound.setRainActive(false);
    } else if (type === 'fog') {
      // Morning Winter Smog / Mist
      scene.background = new THREE.Color(0xd5dbdb);
      if (scene.fog) {
        scene.fog.color.setHex(0xd5dbdb);
        (scene.fog as THREE.FogExp2).density = 0.014;
      }
      sunLight.color.setHex(0xfad7a0);
      sunLight.intensity = 1.1;
      hemiLight.color.setHex(0xccd1d1);
      hemiLight.groundColor.setHex(0x7f8c8d);
      hemiLight.intensity = 0.9;
      rainParticles.visible = false;
      sound.setRainActive(false);
    }
  };

  const setTimeOfDay = (hour: number) => {
    // 0 to 24
    if (hour >= 6 && hour < 16) {
      setWeather('sunny');
    } else if (hour >= 16 && hour < 19) {
      setWeather('sunset');
    } else if (hour >= 19 || hour < 5) {
      setWeather('night');
    } else {
      setWeather('fog');
    }
  };

  const update = (delta: number) => {
    // Slowly drift clouds
    cloudsGroup.children.forEach((c) => {
      c.position.x += delta * 2;
      if (c.position.x > 250) c.position.x = -250;
    });

    // Monsoon rain animation
    if (currentWeather === 'rain') {
      const pos = rainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        pos[i * 3 + 1] -= rainSpeeds[i] * delta;
        pos[i * 3] += delta * 12; // Wind slant
        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 75;
          pos[i * 3] = (Math.random() - 0.5) * 160;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 160;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;

      // Occasional thunder lightning flash
      thunderTimer -= delta;
      if (thunderTimer <= 0) {
        thunderTimer = 7 + Math.random() * 12;
        isThunderFlashing = true;
        sound.playThunder();
        setTimeout(() => {
          sunLight.intensity = 3.5;
          hemiLight.intensity = 2.5;
          setTimeout(() => {
            sunLight.intensity = 0.8;
            hemiLight.intensity = 0.6;
            setTimeout(() => {
              sunLight.intensity = 2.8;
              setTimeout(() => {
                sunLight.intensity = 0.8;
                isThunderFlashing = false;
              }, 60);
            }, 80);
          }, 80);
        }, 100);
      }
    }
  };

  // Start with vibrant sunny day
  setWeather('sunny');

  return {
    update,
    setWeather,
    setTimeOfDay,
    sunLight,
    hemiLight,
    rainParticles,
    cloudsGroup,
  };
}
