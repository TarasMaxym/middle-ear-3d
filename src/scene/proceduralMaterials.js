import * as THREE from 'three';

function makeCanvasTexture(size, drawFn, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createMaterialLibrary() {
  // 1. Subtle architectural room grid + petrous bone micro-grain (great depth cues for FPS flight!)
  const wallTileTex = makeCanvasTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = '#f2eee7';
      ctx.fillRect(0, 0, s, s);

      // Soft organic bone speckle
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const r = 0.6 + Math.random() * 1.8;
        const alpha = 0.025 + Math.random() * 0.04;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(120,100,80,${alpha})` : `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Clean subtle architectural diorama grid lines (gives Minecraft-like spatial scale)
      ctx.strokeStyle = 'rgba(60, 50, 40, 0.14)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, s - 2, s - 2);

      ctx.strokeStyle = 'rgba(60, 50, 40, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s / 2, 0);
      ctx.lineTo(s / 2, s);
      ctx.moveTo(0, s / 2);
      ctx.lineTo(s, s / 2);
      ctx.stroke();
    },
    4,
    4
  );

  // 2. Pearly radially-striated Tympanic Membrane texture with Pars Flaccida & Cone of Light
  const eardrumTex = makeCanvasTexture(512, (ctx, s) => {
    const cx = s / 2;
    const cy = s * 0.54; // Umbo slightly below geometric center
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, s / 2, s * 0.5);
    grad.addColorStop(0, 'rgba(255, 243, 218, 0.96)');
    grad.addColorStop(0.35, 'rgba(232, 212, 184, 0.85)');
    grad.addColorStop(0.82, 'rgba(206, 182, 152, 0.88)');
    grad.addColorStop(1, 'rgba(240, 226, 204, 0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, s, s);

    // Anteroinferior Cone of Light
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, s * 0.46, 0.35, 0.92);
    ctx.closePath();
    const coneGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, s * 0.45);
    coneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    coneGrad.addColorStop(1, 'rgba(255, 252, 235, 0.08)');
    ctx.fillStyle = coneGrad;
    ctx.fill();
    ctx.restore();

    // Radial collagen fibers of Pars Tensa
    ctx.strokeStyle = 'rgba(255, 250, 240, 0.24)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      // Skip upper wedge (Pars Flaccida lacks dense radial fibers!)
      if (a > -Math.PI * 0.68 && a < -Math.PI * 0.32) continue;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10);
      ctx.lineTo(cx + Math.cos(a) * s * 0.48, cy + Math.sin(a) * s * 0.48);
      ctx.stroke();
    }

    // Concentric circular fibers
    ctx.strokeStyle = 'rgba(180, 148, 115, 0.18)';
    for (let r = 28; r < s * 0.48; r += 22) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pars Flaccida (Shrapnell's membrane) subtle pinkish-translucent superior triangle
    ctx.beginPath();
    ctx.moveTo(cx, s * 0.25);
    ctx.lineTo(cx - s * 0.19, s * 0.04);
    ctx.lineTo(cx + s * 0.19, s * 0.04);
    ctx.closePath();
    ctx.fillStyle = 'rgba(244, 186, 178, 0.38)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 235, 215, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // 3. Striated Muscle Texture
  const muscleTex = makeCanvasTexture(
    128,
    (ctx, s) => {
      ctx.fillStyle = '#b93c3c';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 4) {
        ctx.fillStyle = y % 8 === 0 ? 'rgba(255, 190, 180, 0.22)' : 'rgba(90, 15, 15, 0.22)';
        ctx.fillRect(0, y, s, 2);
      }
    },
    2,
    2
  );

  // 4. Honeycomb Mastoid Trabecular Bone Texture
  const mastoidTex = makeCanvasTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = '#cbb393';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 55; i++) {
        const x = Math.random() * s;
        const y = Math.random() * s;
        const r = 8 + Math.random() * 18;
        const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
        g.addColorStop(0, 'rgba(48, 34, 24, 0.72)');
        g.addColorStop(0.75, 'rgba(95, 72, 52, 0.42)');
        g.addColorStop(1, 'rgba(225, 205, 175, 0.15)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    2,
    2
  );

  return {
    wallTileTex,
    eardrumTex,
    muscleTex,
    mastoidTex
  };
}
