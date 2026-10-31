import * as THREE from 'three';

/**
 * Parallel-Transport (Bishop Frame) Variable-Profile 3D Lofting & Anatomical Sculptor.
 * Avoids Frenet-frame twist flips on inflection points and allows organic bone/muscle/vessel
 * tapering, elliptical flattening, joint flaring, and smooth hemispherical end-caps.
 *
 * @param {THREE.Curve<THREE.Vector3>} curve - 3D centerline curve
 * @param {number} tubularSegments - Longitudinal subdivisions
 * @param {number} radialSegments - Cross-sectional subdivisions
 * @param {(t: number, theta: number) => { rx: number, ry: number, offX?: number, offY?: number }} profileFn
 * @param {boolean} capEnds - Close start and end with smooth rounded fans
 * @returns {THREE.BufferGeometry}
 */
export function buildSculptedSweep(
  curve,
  tubularSegments = 32,
  radialSegments = 16,
  profileFn,
  capEnds = true
) {
  const pts = [];
  const tangents = [];
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    pts.push(curve.getPointAt(t));
    tangents.push(curve.getTangentAt(t).normalize());
  }

  // Parallel transport frames (normals & binormals without twist singularities)
  const normals = [];
  const binormals = [];

  const t0 = tangents[0];
  const seed = Math.abs(t0.y) < 0.88 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  let nCurr = new THREE.Vector3().crossVectors(t0, seed).normalize();
  let bCurr = new THREE.Vector3().crossVectors(t0, nCurr).normalize();
  normals.push(nCurr.clone());
  binormals.push(bCurr.clone());

  const rotAxis = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  for (let i = 1; i <= tubularSegments; i++) {
    const prevT = tangents[i - 1];
    const currT = tangents[i];
    rotAxis.crossVectors(prevT, currT);
    const sinA = rotAxis.length();
    if (sinA > 1e-6) {
      rotAxis.normalize();
      const cosA = THREE.MathUtils.clamp(prevT.dot(currT), -1, 1);
      const angle = Math.atan2(sinA, cosA);
      quat.setFromAxisAngle(rotAxis, angle);
      nCurr = nCurr.clone().applyQuaternion(quat).normalize();
    }
    // Re-orthogonalize against currT
    nCurr.addScaledVector(currT, -nCurr.dot(currT)).normalize();
    bCurr = new THREE.Vector3().crossVectors(currT, nCurr).normalize();
    normals.push(nCurr.clone());
    binormals.push(bCurr.clone());
  }

  const positions = [];
  const uvs = [];
  const indices = [];

  // Optional tiny rounded cap rings at t=0 and t=1
  const slices = [];
  if (capEnds) {
    slices.push({ t: 0, capScale: 0.02, axialPush: -0.35 });
    slices.push({ t: 0, capScale: 0.65, axialPush: -0.15 });
  }
  for (let i = 0; i <= tubularSegments; i++) {
    slices.push({ t: i / tubularSegments, idx: i, capScale: 1.0, axialPush: 0 });
  }
  if (capEnds) {
    slices.push({ t: 1, capScale: 0.65, axialPush: 0.15 });
    slices.push({ t: 1, capScale: 0.02, axialPush: 0.35 });
  }

  slices.forEach((sl, sIdx) => {
    const baseIdx =
      sl.idx !== undefined ? sl.idx : sl.t === 0 ? 0 : tubularSegments;
    const center = pts[baseIdx];
    const T = tangents[baseIdx];
    const N = normals[baseIdx];
    const B = binormals[baseIdx];

    // Estimate mean radius for cap axial push
    const pSample = profileFn(sl.t, 0);
    const meanR = 0.5 * (pSample.rx + pSample.ry);

    for (let j = 0; j <= radialSegments; j++) {
      const u = j / radialSegments;
      const theta = u * Math.PI * 2;
      const prof = profileFn(sl.t, theta);
      const rx = prof.rx * sl.capScale;
      const ry = prof.ry * sl.capScale;
      const ox = (prof.offX || 0) * sl.capScale;
      const oy = (prof.offY || 0) * sl.capScale;

      const localX = Math.cos(theta) * rx + ox;
      const localY = Math.sin(theta) * ry + oy;
      const push = sl.axialPush * meanR;

      const vx = center.x + N.x * localX + B.x * localY + T.x * push;
      const vy = center.y + N.y * localX + B.y * localY + T.y * push;
      const vz = center.z + N.z * localX + B.z * localY + T.z * push;

      positions.push(vx, vy, vz);
      uvs.push(u, sIdx / (slices.length - 1));
    }
  });

  const stride = radialSegments + 1;
  for (let i = 0; i < slices.length - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = a + stride;
      indices.push(a, a + 1, b);
      indices.push(b, a + 1, b + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Slices a continuous parallel-transport curve into seamless sub-region meshes (e.g. Malleus Head -> Neck -> Manubrium,
 * or Incus Body -> Long Limb -> Lenticular Process) sharing identical boundary frames & vertices with zero seam!
 */
export function buildSculptedSubSections(
  curve,
  totalTubularSegments = 60,
  radialSegments = 18,
  profileFn,
  sections = [] // Array of { startIdx, endIdx, capStart, capEnd }
) {
  const pts = [];
  const tangents = [];
  for (let i = 0; i <= totalTubularSegments; i++) {
    const t = i / totalTubularSegments;
    pts.push(curve.getPointAt(t));
    tangents.push(curve.getTangentAt(t).normalize());
  }

  const normals = [];
  const binormals = [];
  const t0 = tangents[0];
  const seed = Math.abs(t0.y) < 0.88 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  let nCurr = new THREE.Vector3().crossVectors(t0, seed).normalize();
  let bCurr = new THREE.Vector3().crossVectors(t0, nCurr).normalize();
  normals.push(nCurr.clone());
  binormals.push(bCurr.clone());

  const rotAxis = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  for (let i = 1; i <= totalTubularSegments; i++) {
    const prevT = tangents[i - 1];
    const currT = tangents[i];
    rotAxis.crossVectors(prevT, currT);
    const sinA = rotAxis.length();
    if (sinA > 1e-6) {
      rotAxis.normalize();
      const cosA = THREE.MathUtils.clamp(prevT.dot(currT), -1, 1);
      quat.setFromAxisAngle(rotAxis, Math.atan2(sinA, cosA));
      nCurr = nCurr.clone().applyQuaternion(quat).normalize();
    }
    nCurr.addScaledVector(currT, -nCurr.dot(currT)).normalize();
    bCurr = new THREE.Vector3().crossVectors(currT, nCurr).normalize();
    normals.push(nCurr.clone());
    binormals.push(bCurr.clone());
  }

  return sections.map(({ startIdx, endIdx, capStart = false, capEnd = false }) => {
    const positions = [];
    const uvs = [];
    const indices = [];
    const slices = [];

    const tStart = startIdx / totalTubularSegments;
    const tEnd = endIdx / totalTubularSegments;
    if (capStart) {
      slices.push({ t: tStart, idx: startIdx, capScale: 0.02, axialPush: -0.35 });
      slices.push({ t: tStart, idx: startIdx, capScale: 0.65, axialPush: -0.15 });
    }
    for (let i = startIdx; i <= endIdx; i++) {
      slices.push({ t: i / totalTubularSegments, idx: i, capScale: 1.0, axialPush: 0 });
    }
    if (capEnd) {
      slices.push({ t: tEnd, idx: endIdx, capScale: 0.65, axialPush: 0.15 });
      slices.push({ t: tEnd, idx: endIdx, capScale: 0.02, axialPush: 0.35 });
    }

    slices.forEach((sl, sIdx) => {
      const center = pts[sl.idx];
      const T = tangents[sl.idx];
      const N = normals[sl.idx];
      const B = binormals[sl.idx];
      const pSample = profileFn(sl.t, 0);
      const meanR = 0.5 * (pSample.rx + pSample.ry);

      for (let j = 0; j <= radialSegments; j++) {
        const u = j / radialSegments;
        const theta = u * Math.PI * 2;
        const prof = profileFn(sl.t, theta);
        const rx = prof.rx * sl.capScale;
        const ry = prof.ry * sl.capScale;
        const localX = Math.cos(theta) * rx + (prof.offX || 0) * sl.capScale;
        const localY = Math.sin(theta) * ry + (prof.offY || 0) * sl.capScale;
        const push = sl.axialPush * meanR;

        positions.push(
          center.x + N.x * localX + B.x * localY + T.x * push,
          center.y + N.y * localX + B.y * localY + T.y * push,
          center.z + N.z * localX + B.z * localY + T.z * push
        );
        uvs.push(u, sIdx / Math.max(1, slices.length - 1));
      }
    });

    const stride = radialSegments + 1;
    for (let i = 0; i < slices.length - 1; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * stride + j;
        const b = a + stride;
        indices.push(a, a + 1, b);
        indices.push(b, a + 1, b + 1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  });
}

/**
 * Builds a specimen-realistic kidney-shaped (reniform) Stapes Footplate or Annular Ligament.
 * Real stapes footplate has a convex superior margin and a straight/slightly concave inferior margin.
 */
export function buildReniformPlateGeometry(rx = 0.96, ry = 0.52, thickness = 0.16) {
  const shape = new THREE.Shape();
  const segs = 40;
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    // Flatten / gently indent inferior border (sin(a) < 0) while arching superior border
    const sinA = Math.sin(a);
    const kidneyIndent = sinA < 0 ? 0.72 + 0.16 * Math.cos(a * 2) : 1.06;
    const y = sinA * ry * kidneyIndent + 0.06 * Math.pow(Math.cos(a), 2) * (sinA < 0 ? 1 : 0);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.035,
    bevelSegments: 3
  });
  geo.center();
  return geo;
}

/**
 * Builds a realistic tightly-coiled 2.65-turn Snail-Shell Cochlea around a central Modiolus cone,
 * positioned so its large basal turn hugs the Medial Wall to form the Promontory.
 */
export function buildRealisticCochlea(sx, zHalf) {
  const turns = 2.65;
  const pts = [];
  const totalSteps = 120;
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const theta = t * turns * Math.PI * 2 + Math.PI * 0.15;
    // Tightly packed logarithmic-like snail spiral so adjacent turns touch realistically!
    const spiralR = THREE.MathUtils.lerp(2.15, 0.22, Math.pow(t, 0.78));
    const cx = sx * (0.75 + Math.cos(theta) * spiralR * sx);
    const cy = -0.65 + Math.sin(theta) * spiralR;
    // Conical snail cupola projecting anterolaterally/medially along modiolus axis
    const cz = -zHalf - 0.82 - Math.pow(t, 0.9) * 2.55;
    pts.push(new THREE.Vector3(cx, cy, cz));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = buildSculptedSweep(
    curve,
    115,
    18,
    (t, theta) => {
      // Tube cross-section tapers smoothly from wide basal turn (0.78) to fine cupola apex (0.21)
      const baseR = THREE.MathUtils.lerp(0.82, 0.2, Math.pow(t, 0.76));
      // Slight spiral ridge (osseous spiral lamina impression)
      const ridge = 1.0 + 0.06 * Math.cos(theta * 2);
      return { rx: baseR * ridge, ry: baseR * 0.94 };
    },
    true
  );
  return { geo, curve };
}

/**
 * Builds a sculpted anatomical Pinna (Auricle) with Helix, Antihelix + Crura,
 * Concha Bowl, Tragus, and Lobule so the Outer Ear matches real anatomy specimens.
 */
export function buildRealisticPinnaGroup(sx, zBase, cartilageMat, skinLobuleMat) {
  const group = new THREE.Group();

  // 1. Concha Bowl + Scapha backplate (cupped auricular cartilage plate)
  const plateSegW = 28;
  const plateSegH = 36;
  const positions = [];
  const indices = [];
  for (let iy = 0; iy <= plateSegH; iy++) {
    const v = iy / plateSegH; // 0 = bottom lobule, 1 = superior helix dome
    const angY = (v - 0.46) * Math.PI;
    const halfWidth = 2.95 * Math.cos((v - 0.52) * Math.PI * 0.88) * (v < 0.25 ? 0.85 : 1.0);
    const y = (v - 0.48) * 11.4;

    for (let ix = 0; ix <= plateSegW; ix++) {
      const u = ix / plateSegW; // 0 = anterior attachment (near canal/tragus), 1 = posterior free rim
      const localX = THREE.MathUtils.lerp(0.8, -0.8 - halfWidth * 1.45, u);
      // Deep concha depression near u=0.28, v=0.48 funneling into ear canal!
      const dConcha = Math.hypot((u - 0.3) * 2.2, (v - 0.48) * 2.4);
      const conchaDepth = Math.exp(-dConcha * dConcha * 2.6) * 1.75;
      // Lateral flare of pinna (~30° auriculocephalic angle)
      const flareZ = u * 2.15 - conchaDepth + Math.sin(angY) * 0.22;

      positions.push(sx * localX, y, zBase + flareZ);
    }
  }
  const stride = plateSegW + 1;
  for (let iy = 0; iy < plateSegH; iy++) {
    for (let ix = 0; ix < plateSegW; ix++) {
      const a = iy * stride + ix;
      const b = a + stride;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }
  const plateGeo = new THREE.BufferGeometry();
  plateGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  plateGeo.setIndex(indices);
  plateGeo.computeVertexNormals();
  const plateMat = cartilageMat.clone();
  plateMat.side = THREE.DoubleSide;
  group.add(new THREE.Mesh(plateGeo, plateMat));

  // 2. Curled Outer Helix Rim (starting at Crus of Helix above canal -> arching superiorly -> posteriorly -> tail)
  const helixPts = [];
  for (let i = 0; i <= 38; i++) {
    const t = i / 38;
    const a = Math.PI * 0.15 + t * Math.PI * 1.48;
    const rx = 2.75 + 0.45 * Math.sin(t * Math.PI);
    const ry = 5.25;
    const hx = -1.35 + Math.cos(a) * rx;
    const hy = 0.45 + Math.sin(a) * ry;
    const hz = zBase + 0.65 + (1 - Math.cos(a)) * 0.85;
    helixPts.push(new THREE.Vector3(sx * hx, hy, hz));
  }
  const helixGeo = buildSculptedSweep(
    new THREE.CatmullRomCurve3(helixPts),
    38,
    14,
    (t) => {
      const r = THREE.MathUtils.lerp(0.36, 0.56, Math.sin(t * Math.PI * 0.85 + 0.2));
      return { rx: r, ry: r * 0.86 };
    },
    true
  );
  group.add(new THREE.Mesh(helixGeo, cartilageMat));

  // 3. Inner Antihelix Ridge (curving parallel inside helix around the concha bowl)
  const antiPts = [
    new THREE.Vector3(sx * -1.4, -2.1, zBase + 1.05),
    new THREE.Vector3(sx * -2.65, -0.4, zBase + 1.35),
    new THREE.Vector3(sx * -2.75, 1.65, zBase + 1.45),
    new THREE.Vector3(sx * -1.75, 3.35, zBase + 1.25),
    new THREE.Vector3(sx * -0.45, 3.95, zBase + 0.9)
  ];
  const antiGeo = buildSculptedSweep(
    new THREE.CatmullRomCurve3(antiPts),
    24,
    12,
    (t) => {
      const r = 0.34 * (1.0 - 0.25 * Math.abs(t - 0.5));
      return { rx: r, ry: r * 0.8 };
    },
    true
  );
  group.add(new THREE.Mesh(antiGeo, cartilageMat));

  // 4. Anterior Tragus (protective cartilaginous eminence right in front of canal entrance)
  const tragusGeo = new THREE.SphereGeometry(0.85, 16, 14);
  tragusGeo.scale(0.65, 1.18, 0.55);
  const tragusMesh = new THREE.Mesh(tragusGeo, cartilageMat);
  tragusMesh.position.set(sx * 1.15, -0.35, zBase + 0.55);
  group.add(tragusMesh);

  // 5. Soft Inferior Lobule (Earlobe)
  const lobuleGeo = new THREE.SphereGeometry(1.45, 20, 16);
  lobuleGeo.scale(1.1, 1.25, 0.52);
  const lobuleMesh = new THREE.Mesh(lobuleGeo, skinLobuleMat || cartilageMat);
  lobuleMesh.position.set(sx * -1.25, -4.95, zBase + 0.72);
  group.add(lobuleMesh);

  return group;
}
