import * as THREE from 'three';

/**
 * Renders a live 6-axis 3D Anatomical Compass (SUP, INF, MED, LAT, ANT, POST)
 * synced to camera rotation and earSide (Right vs Left), plus computes the
 * user's current anatomical zone and facing wall in plain English.
 */
export class AnatomicalCompassGizmo {
  constructor(canvas, facingLabelEl, zoneLabelEl) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.facingLabelEl = facingLabelEl;
    this.zoneLabelEl = zoneLabelEl;

    const dpr = window.devicePixelRatio || 1;
    this.size = 116;
    this.canvas.width = this.size * dpr;
    this.canvas.height = this.size * dpr;
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.ctx.scale(dpr, dpr);

    this._invQuat = new THREE.Quaternion();
    this._lookDir = new THREE.Vector3();
  }

  getAxes(earSide) {
    const sx = earSide === 'right' ? 1 : -1;
    return [
      { code: 'MED', full: 'MEDIAL (Labyrinthine Wall)', dir: new THREE.Vector3(0, 0, -1), color: '#fb7185', primary: true },
      { code: 'LAT', full: 'LATERAL (Membranous Wall / Eardrum)', dir: new THREE.Vector3(0, 0, 1), color: '#38bdf8', primary: false },
      { code: 'SUP', full: 'SUPERIOR (Roof / Tegmen Tympani)', dir: new THREE.Vector3(0, 1, 0), color: '#a3e635', primary: true },
      { code: 'INF', full: 'INFERIOR (Floor / Jugular Wall)', dir: new THREE.Vector3(0, -1, 0), color: '#34d399', primary: false },
      { code: 'ANT', full: 'ANTERIOR (Carotid Wall)', dir: new THREE.Vector3(sx, 0, 0), color: '#60a5fa', primary: true },
      { code: 'POST', full: 'POSTERIOR (Mastoid Wall)', dir: new THREE.Vector3(-sx, 0, 0), color: '#facc15', primary: true }
    ];
  }

  computeZoneName(pos, earSide) {
    const sx = earSide === 'right' ? 1 : -1;
    const insideX = pos.x >= -8.2 && pos.x <= 8.2;
    const insideY = pos.y >= -5.2 && pos.y <= 9.2;
    const insideZ = pos.z >= -6.7 && pos.z <= 6.7;

    if (insideX && insideY && insideZ) {
      if (pos.y >= 4.4) return 'Epitympanic Recess (Attic)';
      if (pos.y <= -2.6) return 'Hypotympanum (Lower Cavity)';
      return 'Tympanic Cavity (Mesotympanum)';
    }

    // Check specific neighboring regions outside the 6 walls
    if ((sx === 1 && pos.x < -8.2) || (sx === -1 && pos.x > 8.2)) {
      if (pos.y > 1.8 && pos.z > -4.8 && pos.z < 3.2 && Math.abs(pos.x) < 15.5) {
        return 'Mastoid Antrum & Air Cells';
      }
      return 'Exterior — Posterior (Mastoid Side)';
    }
    if ((sx === 1 && pos.x > 8.2) || (sx === -1 && pos.x < -8.2)) {
      return 'Exterior — Anterior (Carotid / Eustachian Side)';
    }
    if (pos.z < -6.7) return 'Inner Ear Region (Medial / Labyrinth)';
    if (pos.z > 6.7) return 'Outer Ear Canal (Lateral to Eardrum)';
    if (pos.y > 9.2) return 'Middle Cranial Fossa (Above Roof)';
    if (pos.y < -5.2) return 'Jugular Fossa (Below Floor)';
    return 'Diorama Exterior';
  }

  update(camera, earSide = 'right') {
    const ctx = this.ctx;
    const s = this.size;
    const cx = s / 2;
    const cy = s / 2;
    const radius = 38;

    ctx.clearRect(0, 0, s, s);

    // Subtle circular compass dial backdrop
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    this._invQuat.copy(camera.quaternion).invert();
    const axes = this.getAxes(earSide);

    // Transform world anatomical directions into camera view space
    const projected = axes.map((ax) => {
      const v = ax.dir.clone().applyQuaternion(this._invQuat);
      return {
        ...ax,
        vx: v.x,
        vy: -v.y, // Canvas Y grows downward
        vz: v.z // In Three.js camera space, -Z is straight into screen, +Z is toward viewer
      };
    });

    // Sort back-to-front by vz so closer axis pills draw cleanly over distant ones
    projected.sort((a, b) => a.vz - b.vz);

    projected.forEach((p) => {
      const endX = cx + p.vx * radius;
      const endY = cy + p.vy * radius;
      const depthAlpha = THREE.MathUtils.mapLinear(p.vz, -1, 1, 0.38, 1.0);

      // Axis spoke
      ctx.save();
      ctx.globalAlpha = depthAlpha;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.vz > 0 ? 2.2 : 1.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Axis tip badge
      const pillR = p.code.length > 3 ? 11.5 : 10.5;
      ctx.beginPath();
      ctx.arc(endX, endY, pillR, 0, Math.PI * 2);
      ctx.fillStyle = p.vz >= -0.1 ? p.color : 'rgba(15, 23, 42, 0.92)';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = p.color;
      ctx.stroke();

      ctx.font = '700 8.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = p.vz >= -0.1 ? '#0f172a' : p.color;
      ctx.fillText(p.code, endX, endY + 0.5);
      ctx.restore();
    });

    // Determine primary anatomical direction camera is currently facing
    camera.getWorldDirection(this._lookDir);
    let bestAxis = axes[0];
    let bestDot = -2;
    axes.forEach((ax) => {
      const d = this._lookDir.dot(ax.dir);
      if (d > bestDot) {
        bestDot = d;
        bestAxis = ax;
      }
    });

    if (this.facingLabelEl) {
      this.facingLabelEl.textContent = bestAxis.full;
      this.facingLabelEl.style.color = bestAxis.color;
    }
    if (this.zoneLabelEl) {
      this.zoneLabelEl.textContent = this.computeZoneName(camera.position, earSide);
    }
  }
}
