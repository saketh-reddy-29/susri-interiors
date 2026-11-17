import * as THREE from 'three';
import { FloorMaterialId } from '../data/studioData';

export interface ProceduralTextureSet {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

function createCanvas(size = 512): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function configureTexture(
  canvas: HTMLCanvasElement,
  isColorMap: boolean,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  if (isColorMap) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

export function createFloorTextures(
  floorId: FloorMaterialId,
  maxAnisotropy = 4
): ProceduralTextureSet {
  const size = 512;
  const { canvas: colorCanvas, ctx: cCtx } = createCanvas(size);
  const { canvas: bumpCanvas, ctx: bCtx } = createCanvas(size);

  if (floorId === 'oak-herringbone' || floorId === 'smoked-walnut') {
    const isOak = floorId === 'oak-herringbone';
    const baseR = isOak ? 196 : 86;
    const baseG = isOak ? 172 : 64;
    const baseB = isOak ? 138 : 48;

    cCtx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
    cCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    const cols = isOak ? 4 : 3;
    const rows = isOak ? 16 : 8;
    const plankW = size / cols;
    const plankH = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = c * plankW + ((r % 2) * plankW * (isOak ? 0.25 : 0.45)) % size;
        const py = r * plankH;
        const tone = ((r * 7 + c * 13) % 19) - 9;

        const drawPlank = (xPos: number) => {
          cCtx.fillStyle = `rgb(${baseR + tone},${baseG + tone},${baseB + Math.round(tone * 0.8)})`;
          cCtx.fillRect(xPos + 1, py + 1, plankW - 2, plankH - 2);

          // Fine wood grain streaks
          for (let g = 0; g < 10; g++) {
            const gy = py + 3 + ((g * 7 + c * 5) % Math.max(4, plankH - 6));
            cCtx.fillStyle = `rgba(${isOak ? 130 : 40}, ${isOak ? 105 : 28}, ${isOak ? 76 : 18}, 0.14)`;
            cCtx.fillRect(xPos + 2, gy, plankW - 4, 1.5);
            bCtx.fillStyle = g % 2 === 0 ? '#747474' : '#8c8c8c';
            bCtx.fillRect(xPos + 2, gy, plankW - 4, 1.5);
          }

          // Seam groove
          cCtx.strokeStyle = `rgba(${isOak ? 95 : 28}, ${isOak ? 78 : 20}, ${isOak ? 56 : 14}, 0.42)`;
          cCtx.lineWidth = 2;
          cCtx.strokeRect(xPos, py, plankW, plankH);

          bCtx.strokeStyle = '#252525';
          bCtx.lineWidth = 2;
          bCtx.strokeRect(xPos, py, plankW, plankH);
        };

        drawPlank(px);
        if (px + plankW > size) {
          drawPlank(px - size);
        }
      }
    }
  } else if (floorId === 'honed-travertine') {
    cCtx.fillStyle = '#ddd3c2';
    cCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = '#848484';
    bCtx.fillRect(0, 0, size, size);

    const tile = size / 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const tx = c * tile;
        const ty = r * tile;
        const shift = (r + c * 2) * 3 - 4;
        cCtx.fillStyle = `rgb(${220 + shift}, ${210 + shift}, ${193 + shift})`;
        cCtx.fillRect(tx + 1, ty + 1, tile - 2, tile - 2);

        // Travertine sedimentary veining
        for (let v = 0; v < 24; v++) {
          const vy = ty + ((v * 23 + r * 11) % tile);
          cCtx.fillStyle = v % 3 === 0 ? 'rgba(176, 162, 140, 0.22)' : 'rgba(248, 244, 236, 0.2)';
          cCtx.fillRect(tx + 2, vy, tile - 4, 2 + (v % 3));
          bCtx.fillStyle = v % 4 === 0 ? '#6b6b6b' : '#8d8d8d';
          bCtx.fillRect(tx + 2, vy, tile - 4, 2);
        }

        // Grout line
        cCtx.strokeStyle = 'rgba(130, 118, 102, 0.35)';
        cCtx.lineWidth = 2;
        cCtx.strokeRect(tx, ty, tile, tile);
        bCtx.strokeStyle = '#383838';
        bCtx.lineWidth = 2;
        bCtx.strokeRect(tx, ty, tile, tile);
      }
    }
  } else {
    // Charcoal microcement
    cCtx.fillStyle = '#3d3c3a';
    cCtx.fillRect(0, 0, size, size);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 120; i++) {
      const rx = (i * 73) % size;
      const ry = (i * 137) % size;
      const rad = 24 + (i % 40);
      const grad = cCtx.createRadialGradient(rx, ry, 2, rx, ry, rad);
      const shade = i % 2 === 0 ? 'rgba(78, 76, 72, 0.16)' : 'rgba(42, 41, 39, 0.16)';
      grad.addColorStop(0, shade);
      grad.addColorStop(1, 'rgba(61, 60, 58, 0)');
      cCtx.fillStyle = grad;
      cCtx.beginPath();
      cCtx.arc(rx, ry, rad, 0, Math.PI * 2);
      cCtx.fill();

      bCtx.fillStyle = i % 2 === 0 ? '#8c8c8c' : '#767676';
      bCtx.beginPath();
      bCtx.arc(rx, ry, rad * 0.4, 0, Math.PI * 2);
      bCtx.fill();
    }
  }

  return {
    map: configureTexture(colorCanvas, true, 4, 3.5, maxAnisotropy),
    bumpMap: configureTexture(bumpCanvas, false, 4, 3.5, maxAnisotropy),
  };
}

export function createPlasterWallBumpMap(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 256;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 160; i++) {
    const x = (i * 53) % size;
    const y = (i * 97) % size;
    const r = 10 + (i % 18);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return configureTexture(canvas, false, 3, 2, maxAnisotropy);
}

export function createBoucleFabricTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 256;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#ebe5dc';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const n = ((x * 13 + y * 29) % 24) - 12;
      const v = 228 + n;
      ctx.fillStyle = `rgb(${v},${v - 4},${v - 11})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  return configureTexture(canvas, true, 4, 4, maxAnisotropy);
}

export function createWoolRugTexture(maxAnisotropy = 4): ProceduralTextureSet {
  const size = 256;
  const { canvas: cCanvas, ctx: cCtx } = createCanvas(size);
  const { canvas: bCanvas, ctx: bCtx } = createCanvas(size);

  cCtx.fillStyle = '#bfb4a2';
  cCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#787878';
  bCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 6) {
      const even = ((x / 6 + y / 4) | 0) % 2 === 0;
      cCtx.fillStyle = even ? '#c8beae' : '#b2a693';
      cCtx.fillRect(x, y, 5, 3);
      bCtx.fillStyle = even ? '#a2a2a2' : '#5e5e5e';
      bCtx.fillRect(x, y, 5, 3);
    }
  }

  return {
    map: configureTexture(cCanvas, true, 6, 4, maxAnisotropy),
    bumpMap: configureTexture(bCanvas, false, 6, 4, maxAnisotropy),
  };
}

export function createTravertineTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 256;
  const { canvas, ctx } = createCanvas(size);
  ctx.fillStyle = '#cfc3b0';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 42; i++) {
    const y = (i * 19) % size;
    const h = 2 + (i % 4);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(150, 134, 114, 0.28)' : 'rgba(235, 227, 214, 0.25)';
    ctx.fillRect(0, y, size, h);
  }

  return configureTexture(canvas, true, 2, 2, maxAnisotropy);
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const { canvas, ctx } = createCanvas(size);
  const grad = ctx.createRadialGradient(size / 2, size / 2, 6, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(20, 18, 15, 0.6)');
  grad.addColorStop(0.55, 'rgba(20, 18, 15, 0.25)');
  grad.addColorStop(1, 'rgba(20, 18, 15, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
