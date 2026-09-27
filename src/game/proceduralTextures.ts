import * as THREE from 'three';

// Helper to create a canvas-based THREE.CanvasTexture
function createCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, canvas);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 1. Asphalt Road Texture with Lane Markings
export function createRoadTexture(lanes: number = 2): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    // Base dark asphalt
    ctx.fillStyle = '#222328';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt grain
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(25 + Math.random() * 30);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Outer white edges
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(16, 0, 8, 512);
    ctx.fillRect(512 - 24, 0, 8, 512);

    // Double yellow center divider
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(252, 0, 4, 512);
    ctx.fillRect(260, 0, 4, 512);

    // White dashed lane markers if multiple lanes
    if (lanes > 2) {
      ctx.fillStyle = '#f5f5f5';
      for (let y = 0; y < 512; y += 48) {
        ctx.fillRect(130, y, 4, 28);
        ctx.fillRect(380, y, 4, 28);
      }
    }
  });
}

// 2. Zebra Crossings Texture
export function createZebraTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#222328';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#ffffff';
    for (let x = 16; x < 256; x += 40) {
      ctx.fillRect(x, 20, 24, 216);
    }
  });
}

// 3. Sidewalk / Pavement Pavers
export function createSidewalkTexture(): THREE.CanvasTexture {
  return createCanvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#9e9992';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#7c766f';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    // Kerb yellow/black alternating curb pattern
    for (let x = 0; x < 256; x += 32) {
      ctx.fillStyle = (x / 32) % 2 === 0 ? '#ffb300' : '#1c1b1a';
      ctx.fillRect(x, 0, 32, 10);
    }
  });
}

// 4. Modern Glass Skyscraper Facade
export function createBuildingFacadeTexture(style: 'modern' | 'warm' | 'heritage' = 'modern'): THREE.CanvasTexture {
  return createCanvasTexture(512, 512, (ctx) => {
    const baseColor = style === 'modern' ? '#1c2833' : style === 'warm' ? '#4a3525' : '#8d6e63';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    const rows = 16;
    const cols = 8;
    const w = 512 / cols;
    const h = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Window
        const isLit = Math.random() > 0.45;
        if (style === 'modern') {
          ctx.fillStyle = isLit ? '#aed6f1' : '#17202a';
        } else {
          ctx.fillStyle = isLit ? '#fdebd0' : '#2c1e14';
        }
        ctx.fillRect(c * w + 6, r * h + 6, w - 12, h - 12);

        // Window frame
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.strokeRect(c * w + 6, r * h + 6, w - 12, h - 12);
      }
    }
  });
}

// 5. Billboard / Signage Textures (Indian Theme)
export function createBillboardTexture(title: string, subtitle: string, bgColor: string, accentColor: string): THREE.CanvasTexture {
  return createCanvasTexture(512, 256, (ctx) => {
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#0b0c10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 496, 240);

    // Decorative Indian motifs / banners
    ctx.fillStyle = accentColor;
    ctx.fillRect(16, 20, 480, 8);
    ctx.fillRect(16, 228, 480, 8);

    // Text Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.fillText(title, 256, 100);

    // Subtitle
    ctx.fillStyle = '#ffecb3';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.shadowBlur = 4;
    ctx.fillText(subtitle, 256, 160);
  });
}

// 6. Indian Tricolor Flag Texture
export function createIndiaFlagTexture(): THREE.CanvasTexture {
  return createCanvasTexture(300, 200, (ctx) => {
    // Saffron top
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(0, 0, 300, 66.6);

    // White middle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 66.6, 300, 66.6);

    // Green bottom
    ctx.fillStyle = '#138808';
    ctx.fillRect(0, 133.3, 300, 66.6);

    // Ashoka Chakra (Navy Blue 24 spokes)
    const cx = 150;
    const cy = 100;
    const radius = 24;

    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();
    }
  });
}

// 7. Storefront Signs
export function createStoreSignTexture(name: string, sub: string, bg: string, textCol: string): THREE.CanvasTexture {
  return createCanvasTexture(384, 96, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 384, 96);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 376, 88);

    ctx.fillStyle = textCol;
    ctx.font = 'bold 26px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 192, 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText(sub, 192, 75);
  });
}
