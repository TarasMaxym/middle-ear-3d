import * as THREE from 'three';
import { ANATOMY_DATA } from '../data/anatomyData.js';
import {
  buildSculptedSweep,
  buildSculptedSubSections,
  buildReniformPlateGeometry,
  buildRealisticCochlea,
  buildRealisticPinnaGroup
} from './geometrySculptor.js';

/**
 * Builds the complete interactive 3D Middle Ear Room Diorama (+ Outer & Inner Ear neighbors)
 * with 60 individually raycastable, highlightable, and quizzable anatomical regions:
 * - Separated ossicle sub-parts (Malleus head/neck/handle/lateral process/anterior process/ligaments/IM joint;
 *   Incus body/short limb/long limb/lenticular process; Stapes head-neck/anterior crus/posterior crus/footplate)
 * - Separated Tympanic Membrane zones (Pars Tensa, Pars Flaccida, Umbo, Cone of Light, Annulus & Mallear Folds)
 * - Separated muscle bellies vs. tendons vs. bony pulleys/cones
 * - Separated medial/posterior micro-landmarks (Promontory, Ponticulus, Oval Window, Round Window, Niche Hood, Fossa Incudis)
 * - Separated nerve trunks & branches (CN VII, Geniculate Ganglion & Greater Petrosal, Chorda Tympani, Tympanic Plexus, Lesser Petrosal, Caroticotympanic)
 * - Separated Inner/Outer ear & cranial structures (Cochlea, Vestibule, Semicircular Canals, CN VIII, Pinna, Ear Canal, Temporal Lobe, Dura & MMA, IJV, ICA, Mastoid Cells)
 */
export function buildMiddleEarDiorama({ earSide = 'right', textures }) {
  const sx = earSide === 'right' ? 1 : -1;
  const root = new THREE.Group();
  root.name = `MiddleEarDiorama_${earSide}`;

  const registry = new Map();
  const pickableMeshes = [];

  const wallGroups = {
    roof: new THREE.Group(),
    floor: new THREE.Group(),
    medial: new THREE.Group(),
    lateral: new THREE.Group(),
    anterior: new THREE.Group(),
    posterior: new THREE.Group()
  };
  const layerGroups = {
    ossicles: new THREE.Group(),
    neuromuscular: new THREE.Group(),
    neighbors: new THREE.Group(),
    annotations: new THREE.Group()
  };

  Object.values(wallGroups).forEach((g) => root.add(g));
  Object.values(layerGroups).forEach((g) => root.add(g));

  const wallMaterialRecords = [];
  const contentMaterialRecords = [];

  function registerMesh(structureId, mesh, anchorPos = null) {
    const data = ANATOMY_DATA[structureId];
    if (!data) return mesh;
    mesh.userData.structureId = structureId;
    pickableMeshes.push(mesh);

    if (!registry.has(structureId)) {
      registry.set(structureId, {
        id: structureId,
        data,
        meshes: [],
        anchor: anchorPos ? anchorPos.clone() : new THREE.Vector3()
      });
    }
    const entry = registry.get(structureId);
    entry.meshes.push(mesh);
    if (anchorPos) {
      entry.anchor.copy(anchorPos);
    }
    return mesh;
  }

  function makeWallMaterial(structureId, wallKey, opts = {}) {
    const data = ANATOMY_DATA[structureId];
    const mat = new THREE.MeshPhysicalMaterial({
      color: data.boxColor,
      map: opts.noGrid ? null : textures.wallTileTex,
      roughness: opts.roughness ?? 0.58,
      metalness: opts.metalness ?? 0.03,
      clearcoat: 0.14,
      clearcoatRoughness: 0.45,
      transparent: true,
      opacity: opts.opacity ?? 1.0,
      side: THREE.DoubleSide
    });
    mat.userData.baseColorHex = mat.color.getHex();
    wallMaterialRecords.push({
      mat,
      structureId,
      wallKey,
      baseOpacity: opts.opacity ?? 1.0,
      isMembrane: Boolean(opts.isMembrane)
    });
    return mat;
  }

  function makeContentMaterial(structureId, opts = {}) {
    const data = ANATOMY_DATA[structureId];
    const mat = new THREE.MeshPhysicalMaterial({
      color: opts.overrideColor ?? data.tissueColor,
      map: opts.map ?? null,
      roughness: opts.roughness ?? 0.38,
      metalness: opts.metalness ?? 0.05,
      clearcoat: opts.clearcoat ?? 0.22,
      clearcoatRoughness: opts.clearcoatRoughness ?? 0.35,
      transparent: Boolean(opts.transparent) || (opts.opacity !== undefined && opts.opacity < 1),
      opacity: opts.opacity ?? 1.0,
      side: opts.doubleSide ? THREE.DoubleSide : THREE.FrontSide
    });
    mat.userData.baseColorHex = mat.color.getHex();
    contentMaterialRecords.push({
      mat,
      structureId,
      overrideColor: opts.overrideColor ?? null,
      defaultOpacity: opts.opacity ?? 1.0
    });
    return mat;
  }

  function buildTaperedTube(points, rStart, rEnd, tubularSegs, radialSegs, mat, bulge = 0) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = buildSculptedSweep(
      curve,
      tubularSegs,
      radialSegs,
      (t) => {
        const base = THREE.MathUtils.lerp(rStart, rEnd, t) + bulge * Math.sin(t * Math.PI);
        return { rx: base, ry: base };
      },
      true
    );
    return new THREE.Mesh(geo, mat);
  }

  // Room dimensions
  const X_HALF = 8.0;
  const Y_FLOOR = -5.0;
  const Y_ATTIC_LINE = 4.4;
  const Y_ROOF = 9.0;
  const Z_HALF = 6.5;
  const WALL_T = 0.42;

  // =========================================================================
  // 1. ROOF (TEGMENTAL WALL — TEGMEN TYMPANI)
  // =========================================================================
  {
    const roofMat = makeWallMaterial('tegmen_tympani', 'roof');
    const shape = new THREE.Shape();
    shape.moveTo(-X_HALF - WALL_T, -Z_HALF - WALL_T);
    shape.lineTo(X_HALF + WALL_T, -Z_HALF - WALL_T);
    shape.lineTo(X_HALF + WALL_T, Z_HALF + WALL_T);
    shape.lineTo(-X_HALF - WALL_T, Z_HALF + WALL_T);
    shape.closePath();

    const lpnHole = new THREE.Path();
    lpnHole.absarc(sx * 2.6, -5.8, 0.18, 0, Math.PI * 2, true);
    shape.holes.push(lpnHole);

    const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false });
    roofGeo.rotateX(Math.PI / 2);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, Y_ROOF + WALL_T, 0);
    wallGroups.roof.add(roofMesh);
    registerMesh('tegmen_tympani', roofMesh, new THREE.Vector3(0, Y_ROOF - 0.15, -1.0));
  }

  // =========================================================================
  // 2. FLOOR (JUGULAR WALL + TYMPANIC CANALICULUS)
  // =========================================================================
  {
    const floorMat = makeWallMaterial('jugular_wall', 'floor');
    const shape = new THREE.Shape();
    shape.moveTo(-X_HALF - WALL_T, -Z_HALF - WALL_T);
    shape.lineTo(X_HALF + WALL_T, -Z_HALF - WALL_T);
    shape.lineTo(X_HALF + WALL_T, Z_HALF + WALL_T);
    shape.lineTo(-X_HALF - WALL_T, Z_HALF + WALL_T);
    shape.closePath();

    const hole = new THREE.Path();
    hole.absarc(sx * 0.4, -5.1, 0.24, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const floorGeo = new THREE.ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false });
    floorGeo.rotateX(Math.PI / 2);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, Y_FLOOR, 0);
    wallGroups.floor.add(floorMesh);
    registerMesh('jugular_wall', floorMesh, new THREE.Vector3(0, Y_FLOOR + 0.15, 0.5));
  }

  // =========================================================================
  // 3. MEDIAL WALL (LABYRINTHINE WALL) + SEPARATED MICRO-LANDMARKS
  // =========================================================================
  let roundWindowMembraneMesh = null;
  {
    const medialMat = makeWallMaterial('medial_wall', 'medial');
    const shape = new THREE.Shape();
    shape.moveTo(-X_HALF, Y_FLOOR);
    shape.lineTo(X_HALF, Y_FLOOR);
    shape.lineTo(X_HALF, Y_ROOF);
    shape.lineTo(-X_HALF, Y_ROOF);
    shape.closePath();

    const ovalX = sx * -1.75;
    const ovalY = 1.9;
    const ovalHole = new THREE.Path();
    ovalHole.absellipse(ovalX, ovalY, 1.02, 0.56, 0, Math.PI * 2, true);
    shape.holes.push(ovalHole);

    const roundX = sx * -1.85;
    const roundY = -2.45;
    const roundHole = new THREE.Path();
    roundHole.absarc(roundX, roundY, 0.68, 0, Math.PI * 2, true);
    shape.holes.push(roundHole);

    const medialGeo = new THREE.ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false });
    const medialMesh = new THREE.Mesh(medialGeo, medialMat);
    medialMesh.position.set(0, 0, -Z_HALF - WALL_T);
    wallGroups.medial.add(medialMesh);
    registerMesh('medial_wall', medialMesh, new THREE.Vector3(sx * 4.8, 6.2, -Z_HALF + 0.2));

    // 3a. SCULPTED COCHLEAR PROMONTORY
    const promMat = makeContentMaterial('promontory', { roughness: 0.44, clearcoat: 0.28 });
    const promGeo = new THREE.SphereGeometry(1, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.56);
    promGeo.rotateX(Math.PI / 2);
    const pPos = promGeo.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
      let x = pPos.getX(i) * 3.05;
      let y = pPos.getY(i) * 2.55;
      let z = pPos.getZ(i) * 1.82;
      const anteriorTaper = 1.0 + 0.08 * sx * (x / 3.0);
      const plexusSulcus = 1.0 - 0.045 * Math.exp(-Math.pow(x - sx * 0.05, 2) * 3.5);
      pPos.setXYZ(i, x * anteriorTaper, y, z * plexusSulcus);
    }
    promGeo.computeVertexNormals();
    const promMesh = new THREE.Mesh(promGeo, promMat);
    promMesh.position.set(sx * 0.72, -0.62, -Z_HALF - 0.04);
    wallGroups.medial.add(promMesh);
    registerMesh('promontory', promMesh, new THREE.Vector3(sx * 0.72, -0.55, -Z_HALF + 1.82));

    // 3a-ii. PONTICULUS (Separate landmark bridging Promontory to Pyramidal Eminence!)
    const pontMat = makeContentMaterial('ponticulus', { roughness: 0.42, clearcoat: 0.28 });
    const ponticulusMesh = buildTaperedTube(
      [
        new THREE.Vector3(sx * -1.2, 0.35, -Z_HALF + 0.65),
        new THREE.Vector3(sx * -4.2, 0.85, -Z_HALF + 0.32),
        new THREE.Vector3(sx * -6.6, 1.35, -Z_HALF + 0.18)
      ],
      0.22,
      0.14,
      16,
      10,
      pontMat
    );
    wallGroups.medial.add(ponticulusMesh);
    registerMesh('ponticulus', ponticulusMesh, new THREE.Vector3(sx * -4.1, 0.88, -Z_HALF + 0.45));

    // 3b. OVAL WINDOW FOSSA & FIBROUS ANNULAR COLLAR
    const ovalRimMat = makeContentMaterial('oval_window', {
      overrideColor: 0x38bdf8,
      roughness: 0.32,
      clearcoat: 0.35
    });
    const ovalRimGeo = buildReniformPlateGeometry(1.14, 0.64, 0.18);
    const ovalRimMesh = new THREE.Mesh(ovalRimGeo, ovalRimMat);
    ovalRimMesh.position.set(ovalX, ovalY, -Z_HALF - 0.04);
    wallGroups.medial.add(ovalRimMesh);

    const ovalMemMat = makeContentMaterial('oval_window', {
      overrideColor: 0xbae6fd,
      opacity: 0.78,
      transparent: true,
      doubleSide: true
    });
    const ovalMemGeo = buildReniformPlateGeometry(0.99, 0.53, 0.06);
    const ovalMemMesh = new THREE.Mesh(ovalMemGeo, ovalMemMat);
    ovalMemMesh.position.set(ovalX, ovalY, -Z_HALF - 0.1);
    wallGroups.medial.add(ovalMemMesh);
    registerMesh('oval_window', ovalRimMesh, new THREE.Vector3(ovalX, ovalY + 0.55, -Z_HALF + 0.35));
    registerMesh('oval_window', ovalMemMesh);

    // 3c-i. ROUND WINDOW NICHE & SUBICULUM HOOD (Separated overhanging bony hood!)
    const nicheHoodMat = makeContentMaterial('round_window_niche', { roughness: 0.42, clearcoat: 0.28 });
    const nichePts = [];
    for (let i = 0; i <= 24; i++) {
      const a = -Math.PI * 0.15 + (i / 24) * Math.PI * 1.35;
      nichePts.push(
        new THREE.Vector3(
          roundX + Math.cos(a) * 0.78 * sx,
          roundY + Math.sin(a) * 0.78,
          -Z_HALF + 0.18 + Math.sin(a) * 0.24
        )
      );
    }
    const nicheHoodMesh = new THREE.Mesh(
      buildSculptedSweep(
        new THREE.CatmullRomCurve3(nichePts),
        24,
        12,
        (t) => {
          const r = 0.17 + 0.13 * Math.sin(t * Math.PI);
          return { rx: r, ry: r * 1.2 };
        },
        true
      ),
      nicheHoodMat
    );
    wallGroups.medial.add(nicheHoodMesh);
    registerMesh(
      'round_window_niche',
      nicheHoodMesh,
      new THREE.Vector3(roundX, roundY + 0.82, -Z_HALF + 0.46)
    );

    // 3c-ii. ROUND WINDOW & SECONDARY TYMPANIC MEMBRANE
    const roundRimMat = makeContentMaterial('round_window', {
      overrideColor: 0x2dd4bf,
      roughness: 0.35
    });
    const roundRimGeo = new THREE.TorusGeometry(0.68, 0.13, 16, 32);
    const roundRimMesh = new THREE.Mesh(roundRimGeo, roundRimMat);
    roundRimMesh.position.set(roundX, roundY, -Z_HALF + 0.04);
    wallGroups.medial.add(roundRimMesh);

    const secMemMat = makeContentMaterial('round_window', {
      overrideColor: 0x5eead4,
      opacity: 0.88,
      transparent: true,
      doubleSide: true,
      roughness: 0.2,
      clearcoat: 0.55
    });
    const secMemGeo = new THREE.SphereGeometry(0.68, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.38);
    secMemGeo.rotateX(Math.PI / 2);
    roundWindowMembraneMesh = new THREE.Mesh(secMemGeo, secMemMat);
    roundWindowMembraneMesh.position.set(roundX, roundY, -Z_HALF - 0.18);
    wallGroups.medial.add(roundWindowMembraneMesh);
    registerMesh('round_window', roundRimMesh, new THREE.Vector3(roundX, roundY - 0.15, -Z_HALF + 0.35));
    registerMesh('round_window', roundWindowMembraneMesh);

    // 3d. PROMINENCE OF FACIAL NERVE CANAL
    const facialPromMat = makeContentMaterial('facial_canal_prominence', {
      opacity: 0.74,
      transparent: true,
      roughness: 0.42
    });
    const facialPromCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 2.8, 3.85, -Z_HALF - 0.08),
      new THREE.Vector3(sx * 0.4, 3.45, -Z_HALF + 0.3),
      new THREE.Vector3(sx * -2.0, 3.02, -Z_HALF + 0.38),
      new THREE.Vector3(sx * -5.2, 2.72, -Z_HALF + 0.3),
      new THREE.Vector3(sx * -7.88, 2.35, -Z_HALF + 0.08)
    ]);
    const facialPromMesh = new THREE.Mesh(
      buildSculptedSweep(
        facialPromCurve,
        40,
        16,
        (t) => ({ rx: 0.46, ry: 0.42 + 0.06 * Math.sin(t * Math.PI) }),
        true
      ),
      facialPromMat
    );
    wallGroups.medial.add(facialPromMesh);
    registerMesh(
      'facial_canal_prominence',
      facialPromMesh,
      new THREE.Vector3(sx * -2.1, 3.25, -Z_HALF + 0.76)
    );

    // 3e. PROMINENCE OF LATERAL SEMICIRCULAR CANAL
    const lsccPromMat = makeContentMaterial('lateral_scc_prominence', { roughness: 0.42 });
    const lsccPromCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * -1.9, 4.68, -Z_HALF - 0.18),
      new THREE.Vector3(sx * -4.6, 5.08, -Z_HALF + 0.44),
      new THREE.Vector3(sx * -7.65, 4.82, -Z_HALF + 0.2)
    ]);
    const lsccPromMesh = new THREE.Mesh(
      buildSculptedSweep(
        lsccPromCurve,
        28,
        16,
        (t) => {
          const swell = 0.42 + 0.22 * Math.sin(t * Math.PI);
          return { rx: swell, ry: swell * 1.15 };
        },
        true
      ),
      lsccPromMat
    );
    wallGroups.medial.add(lsccPromMesh);
    registerMesh(
      'lateral_scc_prominence',
      lsccPromMesh,
      new THREE.Vector3(sx * -4.7, 5.28, -Z_HALF + 0.85)
    );

    // 3f. PROCESSUS COCHLEARIFORMIS
    const procMat = makeContentMaterial('processus_cochleariformis', { roughness: 0.32 });
    const procCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 2.55, 3.32, -Z_HALF + 0.18),
      new THREE.Vector3(sx * 1.52, 3.32, -Z_HALF + 0.56),
      new THREE.Vector3(sx * 1.1, 3.44, -Z_HALF + 1.08)
    ]);
    const procMesh = new THREE.Mesh(
      buildSculptedSweep(
        procCurve,
        22,
        16,
        (t, theta) => {
          const flare = 0.2 + 0.14 * t;
          const spoonCup = Math.sin(theta) > 0 ? 0.52 : 1.08;
          return { rx: flare * 1.15, ry: flare * spoonCup };
        },
        true
      ),
      procMat
    );
    wallGroups.medial.add(procMesh);
    registerMesh(
      'processus_cochleariformis',
      procMesh,
      new THREE.Vector3(sx * 1.25, 3.55, -Z_HALF + 1.12)
    );
  }

  // =========================================================================
  // 4. POSTERIOR WALL (MASTOID WALL) + ADITUS + SEPARATED FOSSA INCUDIS + PYRAMID
  // =========================================================================
  {
    const postMat = makeWallMaterial('posterior_wall', 'posterior');
    const shape = new THREE.Shape();
    shape.moveTo(-Z_HALF, Y_FLOOR);
    shape.lineTo(Z_HALF, Y_FLOOR);
    shape.lineTo(Z_HALF, Y_ROOF);
    shape.lineTo(-Z_HALF, Y_ROOF);
    shape.closePath();

    const aditusU = 0.7;
    const aditusV = 6.25;
    const hw = 1.95;
    const hh = 1.65;
    const aditusHole = new THREE.Path();
    aditusHole.moveTo(aditusU - hw, aditusV - hh);
    aditusHole.lineTo(aditusU - hw, aditusV + 0.3);
    aditusHole.absarc(aditusU, aditusV + 0.3, hw, Math.PI, 0, true);
    aditusHole.lineTo(aditusU + hw, aditusV - hh);
    aditusHole.closePath();
    shape.holes.push(aditusHole);

    const postGeo = new THREE.ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false });
    postGeo.rotateY(Math.PI / 2);
    const postMesh = new THREE.Mesh(postGeo, postMat);
    postMesh.position.set(sx === 1 ? -X_HALF - WALL_T : X_HALF, 0, 0);
    wallGroups.posterior.add(postMesh);
    registerMesh('posterior_wall', postMesh, new THREE.Vector3(sx * -X_HALF + sx * 0.25, -1.5, 2.2));

    // 4a-i. FOSSA INCUDIS (Distinct pickable bony cup lodging Short Limb of Incus!)
    const fossaMat = makeContentMaterial('fossa_incudis', { roughness: 0.4 });
    const fossaGeo = new THREE.TorusGeometry(0.4, 0.15, 14, 24);
    fossaGeo.rotateY(Math.PI / 2);
    const fossaMesh = new THREE.Mesh(fossaGeo, fossaMat);
    fossaMesh.position.set(sx * (-X_HALF + 0.08), 4.42, 1.32);
    wallGroups.posterior.add(fossaMesh);
    registerMesh('fossa_incudis', fossaMesh, new THREE.Vector3(sx * (-X_HALF + 0.32), 4.42, 1.32));

    // 4a-ii. ADITUS ARCHWAY FRAME
    const aditusMat = makeContentMaterial('aditus_to_antrum', {
      overrideColor: 0xfacc15,
      roughness: 0.38
    });
    const archPts = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let zLocal, yLocal;
      if (t < 0.2) {
        const k = t / 0.2;
        zLocal = -0.7 - hw;
        yLocal = aditusV - hh + k * (hh + 0.3);
      } else if (t <= 0.8) {
        const ang = Math.PI - ((t - 0.2) / 0.6) * Math.PI;
        zLocal = -0.7 + Math.cos(ang) * hw;
        yLocal = aditusV + 0.3 + Math.sin(ang) * hw;
      } else {
        const k = (t - 0.8) / 0.2;
        zLocal = -0.7 + hw;
        yLocal = aditusV + 0.3 - k * (hh + 0.3);
      }
      archPts.push(new THREE.Vector3(sx * (-X_HALF + 0.04), yLocal, zLocal));
    }
    const aditusFrame = buildTaperedTube(archPts, 0.17, 0.17, 36, 12, aditusMat);
    wallGroups.posterior.add(aditusFrame);
    registerMesh(
      'aditus_to_antrum',
      aditusFrame,
      new THREE.Vector3(sx * (-X_HALF + 0.35), aditusV + 0.4, -0.7)
    );

    // 4b. SCULPTED PYRAMIDAL EMINENCE
    const pyrMat = makeContentMaterial('pyramidal_eminence', { roughness: 0.38 });
    const pyrCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * (-X_HALF - 0.1), 1.55, -3.55),
      new THREE.Vector3(sx * -7.25, 1.66, -3.35),
      new THREE.Vector3(sx * -6.42, 1.75, -3.15)
    ]);
    const pyrGeo = buildSculptedSweep(
      pyrCurve,
      18,
      20,
      (t) => {
        const r = 0.72 * Math.pow(1 - t, 0.72) + 0.14;
        return { rx: r, ry: r * 0.94 };
      },
      false
    );
    const pyrMesh = new THREE.Mesh(pyrGeo, pyrMat);
    const poreMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.035, 10, 18),
      makeContentMaterial('pyramidal_eminence', { overrideColor: 0x475569, roughness: 0.6 })
    );
    poreMesh.position.set(sx * -6.42, 1.75, -3.15);
    poreMesh.lookAt(new THREE.Vector3(sx * -1.88, 1.88, -2.55));
    wallGroups.posterior.add(pyrMesh, poreMesh);
    registerMesh('pyramidal_eminence', pyrMesh, new THREE.Vector3(sx * -6.85, 2.05, -3.28));
    registerMesh('pyramidal_eminence', poreMesh);
  }

  // =========================================================================
  // 5. ANTERIOR WALL (CAROTID WALL) + MUSCULOTUBAL SEPTUM & EUSTACHIAN FUNNEL
  // =========================================================================
  {
    const antMat = makeWallMaterial('anterior_wall', 'anterior');
    const shape = new THREE.Shape();
    shape.moveTo(-Z_HALF, Y_FLOOR);
    shape.lineTo(Z_HALF, Y_FLOOR);
    shape.lineTo(Z_HALF, Y_ROOF);
    shape.lineTo(-Z_HALF, Y_ROOF);
    shape.closePath();

    const ttHole = new THREE.Path();
    ttHole.absarc(4.65, 3.45, 0.65, 0, Math.PI * 2, true);
    shape.holes.push(ttHole);

    const etHole = new THREE.Path();
    etHole.absellipse(2.1, 0.35, 1.55, 1.35, 0, Math.PI * 2, true);
    shape.holes.push(etHole);

    const antGeo = new THREE.ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false });
    antGeo.rotateY(Math.PI / 2);
    const antMesh = new THREE.Mesh(antGeo, antMat);
    antMesh.position.set(sx === 1 ? X_HALF : -X_HALF - WALL_T, 0, 0);
    wallGroups.anterior.add(antMesh);
    registerMesh('anterior_wall', antMesh, new THREE.Vector3(sx * (X_HALF - 0.25), -2.6, 2.2));

    // 5a. SEMICANAL FOR TENSOR TYMPANI
    const semiMat = makeContentMaterial('tensor_tympani_semicanal', {
      roughness: 0.44,
      doubleSide: true
    });
    const semiRimGeo = new THREE.TorusGeometry(0.68, 0.13, 14, 28);
    semiRimGeo.rotateY(Math.PI / 2);
    const semiRimMesh = new THREE.Mesh(semiRimGeo, semiMat);
    semiRimMesh.position.set(sx * (X_HALF - 0.05), 3.45, -4.65);
    wallGroups.anterior.add(semiRimMesh);

    const shelfGeo = new THREE.CylinderGeometry(0.54, 0.46, 5.5, 18, 1, true, 0, Math.PI * 1.15);
    shelfGeo.rotateZ(Math.PI / 2);
    shelfGeo.rotateX(Math.PI);
    const shelfMesh = new THREE.Mesh(shelfGeo, semiMat);
    shelfMesh.position.set(sx * 4.85, 3.28, -5.12);
    shelfMesh.rotation.y = sx * 0.14;
    wallGroups.anterior.add(shelfMesh);
    registerMesh(
      'tensor_tympani_semicanal',
      semiRimMesh,
      new THREE.Vector3(sx * (X_HALF - 0.5), 4.05, -4.65)
    );
    registerMesh('tensor_tympani_semicanal', shelfMesh);

    // 5b. AUDITORY (EUSTACHIAN) TUBE
    const etMat = makeContentMaterial('eustachian_tube', {
      roughness: 0.38,
      clearcoat: 0.35,
      doubleSide: true
    });
    const etRimGeo = new THREE.TorusGeometry(1.45, 0.18, 16, 36);
    etRimGeo.rotateY(Math.PI / 2);
    etRimGeo.scale(1, 0.93, 1.07);
    const etRimMesh = new THREE.Mesh(etRimGeo, etMat);
    etRimMesh.position.set(sx * (X_HALF - 0.04), 0.35, -2.1);
    wallGroups.anterior.add(etRimMesh);

    const etCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * (X_HALF + 0.05), 0.35, -2.1),
      new THREE.Vector3(sx * (X_HALF + 3.2), -1.45, -3.4),
      new THREE.Vector3(sx * (X_HALF + 6.8), -4.2, -5.2),
      new THREE.Vector3(sx * (X_HALF + 10.6), -7.6, -7.2)
    ]);
    const etTubeGeo = buildSculptedSweep(
      etCurve,
      36,
      22,
      (t) => {
        const isthmusDip =
          1.38 - 0.55 * Math.exp(-Math.pow((t - 0.32) / 0.22, 2)) + 0.55 * Math.pow(t, 1.8);
        const slitAspect = THREE.MathUtils.lerp(0.95, 1.32, t);
        return { rx: isthmusDip / slitAspect, ry: isthmusDip * slitAspect * 0.88 };
      },
      false
    );
    const etTubeMesh = new THREE.Mesh(etTubeGeo, etMat);
    layerGroups.neighbors.add(etTubeMesh);
    registerMesh('eustachian_tube', etRimMesh, new THREE.Vector3(sx * (X_HALF - 0.45), 0.35, -2.1));
    registerMesh('eustachian_tube', etTubeMesh);
  }

  // =========================================================================
  // 6. LATERAL WALL (SCUTUM + ANNULUS/FOLDS + 4 DISTINCT EARDRUM REGIONS!)
  // =========================================================================
  const lateralDoorPivot = new THREE.Group();
  const hingeX = sx * -X_HALF;
  const hingeZ = Z_HALF;
  lateralDoorPivot.position.set(hingeX, 0, hingeZ);
  wallGroups.lateral.add(lateralDoorPivot);

  const tympanicMembraneGroup = new THREE.Group();
  lateralDoorPivot.add(tympanicMembraneGroup);

  const drumCenterX = sx * 0.25;
  const drumCenterY = 0.0;
  const drumRx = 4.15;
  const drumRy = 4.25;
  const umboWorld = new THREE.Vector3(sx * 0.25, -0.3, 3.78);

  {
    const toDoorLocal = (wx, wy, wz) => new THREE.Vector3(wx - hingeX, wy, wz - hingeZ);
    const scutumMat = makeWallMaterial('lateral_wall_scutum', 'lateral');

    const scutumShape = new THREE.Shape();
    scutumShape.moveTo(-X_HALF, Y_ATTIC_LINE);
    scutumShape.lineTo(X_HALF, Y_ATTIC_LINE);
    scutumShape.lineTo(X_HALF, Y_ROOF);
    scutumShape.lineTo(-X_HALF, Y_ROOF);
    scutumShape.closePath();

    const scutumGeo = new THREE.ExtrudeGeometry(scutumShape, { depth: WALL_T, bevelEnabled: false });
    const scutumMesh = new THREE.Mesh(scutumGeo, scutumMat);
    scutumMesh.position.copy(toDoorLocal(0, 0, Z_HALF));
    lateralDoorPivot.add(scutumMesh);
    registerMesh('lateral_wall_scutum', scutumMesh, new THREE.Vector3(sx * 0.2, 6.7, Z_HALF - 0.25));

    const frameShape = new THREE.Shape();
    frameShape.moveTo(-X_HALF, Y_FLOOR);
    frameShape.lineTo(X_HALF, Y_FLOOR);
    frameShape.lineTo(X_HALF, Y_ATTIC_LINE);
    frameShape.lineTo(-X_HALF, Y_ATTIC_LINE);
    frameShape.closePath();

    const drumHole = new THREE.Path();
    drumHole.absellipse(drumCenterX, drumCenterY, drumRx, drumRy, 0, Math.PI * 2, true);
    frameShape.holes.push(drumHole);

    const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: WALL_T, bevelEnabled: false });
    const frameMesh = new THREE.Mesh(frameGeo, scutumMat);
    frameMesh.position.copy(toDoorLocal(0, 0, Z_HALF));
    lateralDoorPivot.add(frameMesh);

    // 6a. HORSESHOE FIBROCARTILAGINOUS ANNULUS TYMPANICUS & MALLEAR FOLDS
    const annulusMat = makeContentMaterial('annulus_tympanicus', {
      overrideColor: 0xf8fafc,
      roughness: 0.3,
      clearcoat: 0.4
    });
    const annulusPts = [];
    for (let i = 0; i <= 44; i++) {
      const a = Math.PI * 0.64 + (i / 44) * Math.PI * 1.72;
      const wx = drumCenterX + Math.cos(a) * drumRx;
      const wy = drumCenterY + Math.sin(a) * drumRy;
      annulusPts.push(toDoorLocal(wx, wy, Z_HALF - 0.02));
    }
    const annulusMesh = new THREE.Mesh(
      buildSculptedSweep(
        new THREE.CatmullRomCurve3(annulusPts),
        44,
        12,
        () => ({ rx: 0.16, ry: 0.16 }),
        true
      ),
      annulusMat
    );
    lateralDoorPivot.add(annulusMesh);

    const latProcLocal = toDoorLocal(sx * 0.35, 3.22, 5.55);
    const antFold = buildTaperedTube(
      [
        latProcLocal,
        toDoorLocal(
          drumCenterX + Math.cos(Math.PI * 0.36) * drumRx,
          drumCenterY + Math.sin(Math.PI * 0.36) * drumRy,
          Z_HALF - 0.04
        )
      ],
      0.085,
      0.115,
      12,
      8,
      annulusMat
    );
    const postFold = buildTaperedTube(
      [
        latProcLocal,
        toDoorLocal(
          drumCenterX + Math.cos(Math.PI * 0.64) * drumRx,
          drumCenterY + Math.sin(Math.PI * 0.64) * drumRy,
          Z_HALF - 0.04
        )
      ],
      0.085,
      0.115,
      12,
      8,
      annulusMat
    );
    lateralDoorPivot.add(antFold, postFold);
    registerMesh(
      'annulus_tympanicus',
      annulusMesh,
      new THREE.Vector3(drumCenterX + sx * 3.1, -2.8, Z_HALF - 0.1)
    );
    registerMesh('annulus_tympanicus', antFold);
    registerMesh('annulus_tympanicus', postFold);

    // 6b. 4 SEAMLESS CONICAL TYMPANIC MEMBRANE ZONES (Pars Tensa, Pars Flaccida, Umbo, Cone of Light!)
    const radialSegs = 64;
    const ringSegs = 22;
    const positions = [];
    const uvs = [];

    for (let ir = 0; ir <= ringSegs; ir++) {
      const t = ir / ringSegs;
      for (let ia = 0; ia <= radialSegs; ia++) {
        const ang = (ia / radialSegs) * Math.PI * 2;
        const rimX = drumCenterX + Math.cos(ang) * drumRx;
        const rimY = drumCenterY + Math.sin(ang) * drumRy;

        const wx = THREE.MathUtils.lerp(umboWorld.x, rimX, t);
        const wy = THREE.MathUtils.lerp(umboWorld.y, rimY, t);
        const coneCurve = Math.pow(t, 0.74);
        const wz = THREE.MathUtils.lerp(umboWorld.z, Z_HALF + 0.04, coneCurve);

        const loc = toDoorLocal(wx, wy, wz);
        positions.push(loc.x, loc.y, loc.z);

        const u = 0.5 + 0.48 * t * Math.cos(ang) * sx;
        const v = 0.5 + 0.48 * t * Math.sin(ang);
        uvs.push(u, v);
      }
    }

    const regionIndices = {
      tm_umbo: [],
      tm_pars_flaccida: [],
      tm_cone_of_light: [],
      tm_pars_tensa: []
    };

    const foldApexX = sx * 0.35;
    const foldApexY = 3.22;
    const foldRimAX = drumCenterX + Math.cos(Math.PI * 0.36) * drumRx;
    const foldRimAY = drumCenterY + Math.sin(Math.PI * 0.36) * drumRy;
    const foldRimPX = drumCenterX + Math.cos(Math.PI * 0.64) * drumRx;
    const foldRimPY = drumCenterY + Math.sin(Math.PI * 0.64) * drumRy;

    for (let ir = 0; ir < ringSegs; ir++) {
      const tMid = (ir + 0.5) / ringSegs;
      for (let ia = 0; ia < radialSegs; ia++) {
        const midAng = ((ia + 0.5) / radialSegs) * Math.PI * 2;
        const rimMidX = drumCenterX + Math.cos(midAng) * drumRx;
        const rimMidY = drumCenterY + Math.sin(midAng) * drumRy;
        const wxMid = THREE.MathUtils.lerp(umboWorld.x, rimMidX, tMid);
        const wyMid = THREE.MathUtils.lerp(umboWorld.y, rimMidY, tMid);

        // Exact Y of the Anterior/Posterior Mallear Fold line at wxMid
        let foldBoundaryY = Infinity;
        if (midAng >= Math.PI * 0.35 && midAng <= Math.PI * 0.65) {
          if (wxMid >= foldApexX) {
            const uFold = THREE.MathUtils.clamp(
              (wxMid - foldApexX) / Math.max(0.01, foldRimAX - foldApexX),
              0,
              1
            );
            foldBoundaryY = THREE.MathUtils.lerp(foldApexY, foldRimAY, uFold);
          } else {
            const uFold = THREE.MathUtils.clamp(
              (wxMid - foldApexX) / Math.min(-0.01, foldRimPX - foldApexX),
              0,
              1
            );
            foldBoundaryY = THREE.MathUtils.lerp(foldApexY, foldRimPY, uFold);
          }
        }

        // Exact canvas angle matching proceduralMaterials.js Cone of Light arc [0.35, 0.92]
        const canvasAng = Math.atan2(-Math.sin(midAng), Math.cos(midAng) * sx);

        let bucket = 'tm_pars_tensa';
        if (ir < 4) {
          bucket = 'tm_umbo';
        } else if (wyMid >= foldBoundaryY - 0.05) {
          bucket = 'tm_pars_flaccida';
        } else if (canvasAng >= 0.34 && canvasAng <= 0.93) {
          bucket = 'tm_cone_of_light';
        }

        const a = ir * (radialSegs + 1) + ia;
        const b = a + radialSegs + 1;
        regionIndices[bucket].push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const regionAnchors = {
      tm_umbo: new THREE.Vector3(umboWorld.x, umboWorld.y, umboWorld.z + 0.15),
      tm_pars_flaccida: new THREE.Vector3(drumCenterX + sx * 0.12, 3.82, Z_HALF - 0.12),
      tm_cone_of_light: new THREE.Vector3(drumCenterX + sx * 1.9, -1.75, 5.45),
      tm_pars_tensa: new THREE.Vector3(drumCenterX - sx * 1.95, -0.85, 5.4)
    };

    Object.entries(regionIndices).forEach(([regionId, idxList]) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(idxList);
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhysicalMaterial({
        map: textures.eardrumTex,
        color: 0xffffff,
        roughness: 0.26,
        metalness: 0.04,
        clearcoat: 0.55,
        clearcoatRoughness: 0.22,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      wallMaterialRecords.push({
        mat,
        structureId: regionId,
        wallKey: 'lateral',
        baseOpacity: 0.85,
        isMembrane: true
      });

      const mesh = new THREE.Mesh(geo, mat);
      tympanicMembraneGroup.add(mesh);
      registerMesh(regionId, mesh, regionAnchors[regionId]);
    });
  }

  // =========================================================================
  // 7. EPITYMPANIC RECESS (ATTIC) COMPARTMENT MARKER
  // =========================================================================
  {
    const atticLinePts = [
      new THREE.Vector3(-X_HALF + 0.08, Y_ATTIC_LINE, -Z_HALF + 0.08),
      new THREE.Vector3(X_HALF - 0.08, Y_ATTIC_LINE, -Z_HALF + 0.08),
      new THREE.Vector3(X_HALF - 0.08, Y_ATTIC_LINE, Z_HALF - 0.08),
      new THREE.Vector3(-X_HALF + 0.08, Y_ATTIC_LINE, Z_HALF - 0.08),
      new THREE.Vector3(-X_HALF + 0.08, Y_ATTIC_LINE, -Z_HALF + 0.08)
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(atticLinePts);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xa3e635,
      dashSize: 0.55,
      gapSize: 0.35,
      transparent: true,
      opacity: 0.65
    });
    const atticLine = new THREE.Line(lineGeo, lineMat);
    atticLine.computeLineDistances();
    layerGroups.annotations.add(atticLine);

    const atticBadgeMat = makeContentMaterial('epitympanic_recess', {
      overrideColor: 0xa3e635,
      opacity: 0.16,
      transparent: true,
      doubleSide: true,
      roughness: 0.3
    });
    const atticZoneGeo = new THREE.BoxGeometry(6.2, 2.8, 5.4);
    const atticZoneMesh = new THREE.Mesh(atticZoneGeo, atticBadgeMat);
    atticZoneMesh.position.set(sx * -0.4, 6.85, 1.8);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(atticZoneGeo),
      new THREE.LineBasicMaterial({ color: 0xa3e635, transparent: true, opacity: 0.42 })
    );
    atticZoneMesh.add(edges);
    layerGroups.annotations.add(atticZoneMesh);
    registerMesh('epitympanic_recess', atticZoneMesh, new THREE.Vector3(sx * -0.4, 7.55, 1.8));
  }

  // =========================================================================
  // 8. GRANULAR SCULPTED AUDITORY OSSICLES (15 DISTINCT SUB-PARTS & JOINTS!)
  // =========================================================================
  const malleusIncusPivot = new THREE.Group();
  malleusIncusPivot.position.set(sx * 0.1, 5.6, 3.0);
  layerGroups.ossicles.add(malleusIncusPivot);

  const stapesGroup = new THREE.Group();
  layerGroups.ossicles.add(stapesGroup);

  const toMIPivot = (wx, wy, wz) =>
    new THREE.Vector3(
      wx - malleusIncusPivot.position.x,
      wy - malleusIncusPivot.position.y,
      wz - malleusIncusPivot.position.z
    );

  const malleusNeckAttachWorld = new THREE.Vector3(sx * 0.42, 3.65, 3.92);
  const stapesNeckAttachWorld = new THREE.Vector3(sx * -1.88, 1.88, -2.55);

  {
    // --- 8a. MALLEUS SUB-PARTS (Head, Neck, Manubrium, Lateral Process, Anterior Process, Suspensory Ligaments, Incudomallear Joint) ---
    const malGroup = new THREE.Group();
    malleusIncusPivot.add(malGroup);

    const malAxisCurve = new THREE.CatmullRomCurve3([
      toMIPivot(sx * 0.44, 7.05, 3.05),
      toMIPivot(sx * 0.42, 6.18, 3.16),
      toMIPivot(sx * 0.44, 5.05, 3.52),
      toMIPivot(sx * 0.4, 3.65, 4.35),
      toMIPivot(sx * 0.32, 1.55, 4.18),
      toMIPivot(umboWorld.x, umboWorld.y, umboWorld.z + 0.04)
    ]);

    const malProfile = (t, theta) => {
      const headSwell = 0.66 * Math.exp(-Math.pow((t - 0.13) / 0.13, 2));
      const neckBase = 0.25 * (1 - 0.52 * t);
      const umboSpatula = t > 0.88 ? 0.08 * Math.sin(((t - 0.88) / 0.12) * Math.PI) : 0;
      const r = headSwell + neckBase + umboSpatula;
      const bladeAspect = t > 0.35 ? 1.28 : 1.05;
      const facetIndent = t < 0.24 && Math.cos(theta - 2.2) > 0.4 ? 0.86 : 1.0;
      return { rx: (r / bladeAspect) * facetIndent, ry: r * bladeAspect * 0.92 };
    };

    // Seamless sub-sweeps: [0..15] = Head, [15..25] = Neck, [25..60] = Manubrium (Handle)
    const [malHeadGeo, malNeckGeo, malManubriumGeo] = buildSculptedSubSections(
      malAxisCurve,
      60,
      20,
      malProfile,
      [
        { startIdx: 0, endIdx: 15, capStart: true, capEnd: false },
        { startIdx: 15, endIdx: 25, capStart: false, capEnd: false },
        { startIdx: 25, endIdx: 60, capStart: false, capEnd: true }
      ]
    );

    const malHeadMesh = new THREE.Mesh(
      malHeadGeo,
      makeContentMaterial('malleus_head', { roughness: 0.28, clearcoat: 0.32 })
    );
    const malNeckMesh = new THREE.Mesh(
      malNeckGeo,
      makeContentMaterial('malleus_neck', { roughness: 0.28, clearcoat: 0.32 })
    );
    const malManubriumMesh = new THREE.Mesh(
      malManubriumGeo,
      makeContentMaterial('malleus_manubrium', { roughness: 0.28, clearcoat: 0.32 })
    );
    malGroup.add(malHeadMesh, malNeckMesh, malManubriumMesh);

    registerMesh('malleus_head', malHeadMesh, new THREE.Vector3(sx * 0.43, 6.35, 3.12));
    registerMesh('malleus_neck', malNeckMesh, new THREE.Vector3(sx * 0.43, 4.75, 3.68));
    registerMesh('malleus_manubrium', malManubriumMesh, new THREE.Vector3(sx * 0.33, 1.65, 4.15));

    // Saddle-shaped Incudomallear Synovial Joint
    const imJointMat = makeContentMaterial('incudomallear_joint', {
      overrideColor: 0xdbeafe,
      roughness: 0.18,
      clearcoat: 0.75
    });
    const imJointGeo = new THREE.TorusGeometry(0.47, 0.085, 12, 24);
    const imJointMesh = new THREE.Mesh(imJointGeo, imJointMat);
    imJointMesh.position.copy(toMIPivot(sx * -0.12, 6.08, 2.82));
    imJointMesh.lookAt(toMIPivot(sx * -0.68, 6.0, 2.45));
    malGroup.add(imJointMesh);
    registerMesh('incudomallear_joint', imJointMesh, new THREE.Vector3(sx * -0.12, 6.18, 2.82));

    // Conical Lateral Process of Malleus
    const latProcMat = makeContentMaterial('malleus_lateral_process', {
      roughness: 0.28,
      clearcoat: 0.32
    });
    const latProcMesh = buildTaperedTube(
      [toMIPivot(sx * 0.39, 3.12, 4.48), toMIPivot(sx * 0.35, 3.24, 5.56)],
      0.24,
      0.085,
      14,
      12,
      latProcMat
    );
    malGroup.add(latProcMesh);
    registerMesh('malleus_lateral_process', latProcMesh, new THREE.Vector3(sx * 0.36, 3.22, 5.3));

    // Spine-like Anterior Process of Malleus
    const antProcMat = makeContentMaterial('malleus_anterior_process', {
      roughness: 0.28,
      clearcoat: 0.32
    });
    const antProcMesh = buildTaperedTube(
      [toMIPivot(sx * 0.43, 4.35, 3.85), toMIPivot(sx * 2.25, 3.82, 4.76)],
      0.135,
      0.03,
      14,
      10,
      antProcMat
    );
    malGroup.add(antProcMesh);
    registerMesh('malleus_anterior_process', antProcMesh, new THREE.Vector3(sx * 1.45, 4.05, 4.35));

    // Suspensory Ligaments of Malleus (Superior + Lateral)
    const malLigMat = makeContentMaterial('mallear_ligaments', {
      overrideColor: 0xe2e8f0,
      roughness: 0.38,
      clearcoat: 0.3,
      transparent: true,
      opacity: 0.78
    });
    const supLig = buildTaperedTube(
      [toMIPivot(sx * 0.44, 7.02, 3.06), toMIPivot(sx * 0.44, Y_ROOF, 3.06)],
      0.09,
      0.115,
      8,
      8,
      malLigMat
    );
    const latMalLig = buildTaperedTube(
      [toMIPivot(sx * 0.42, 4.85, 3.68), toMIPivot(sx * 0.35, 4.55, Z_HALF - 0.05)],
      0.075,
      0.105,
      8,
      8,
      malLigMat
    );
    malGroup.add(supLig, latMalLig);
    registerMesh('mallear_ligaments', supLig, new THREE.Vector3(sx * 0.44, 8.0, 3.06));
    registerMesh('mallear_ligaments', latMalLig);

    // --- 8b. INCUS SUB-PARTS (Body, Short Limb + Posterior Ligament, Long Limb, Lenticular Process + IS Joint) ---
    const incGroup = new THREE.Group();
    malleusIncusPivot.add(incGroup);

    const incLongCurve = new THREE.CatmullRomCurve3([
      toMIPivot(sx * -0.45, 6.22, 2.62),
      toMIPivot(sx * -0.78, 5.92, 2.38),
      toMIPivot(sx * -0.96, 4.95, 2.02),
      toMIPivot(sx * -1.22, 3.55, 1.18),
      toMIPivot(sx * -1.52, 2.08, -0.62),
      toMIPivot(sx * -1.65, 1.9, -1.62)
    ]);

    const incProfile = (t) => {
      const crown = 0.68 * Math.exp(-Math.pow((t - 0.14) / 0.17, 2));
      const rootShaft = THREE.MathUtils.lerp(0.26, 0.12, Math.pow(t, 0.7));
      const r = crown + rootShaft;
      const compress = t < 0.35 ? 1.24 : 1.04;
      return { rx: r / compress, ry: r * compress };
    };

    // Seamless sub-sweeps: [0..20] = Body of Incus, [20..55] = Long Limb, [55..60] = Pedicle into Lenticular Process
    const [incBodyGeo, incLongGeo, incPedicleGeo] = buildSculptedSubSections(
      incLongCurve,
      60,
      18,
      incProfile,
      [
        { startIdx: 0, endIdx: 20, capStart: true, capEnd: false },
        { startIdx: 20, endIdx: 55, capStart: false, capEnd: false },
        { startIdx: 55, endIdx: 60, capStart: false, capEnd: true }
      ]
    );

    const incBodyMesh = new THREE.Mesh(
      incBodyGeo,
      makeContentMaterial('incus_body', { roughness: 0.3, clearcoat: 0.3 })
    );
    const incLongMesh = new THREE.Mesh(
      incLongGeo,
      makeContentMaterial('incus_long_limb', { roughness: 0.3, clearcoat: 0.3 })
    );
    const lenticularMat = makeContentMaterial('incus_lenticular_process', {
      overrideColor: 0xdbeafe,
      roughness: 0.18,
      clearcoat: 0.75
    });
    const incPedicleMesh = new THREE.Mesh(incPedicleGeo, lenticularMat);
    incGroup.add(incBodyMesh, incLongMesh, incPedicleMesh);

    registerMesh('incus_body', incBodyMesh, new THREE.Vector3(sx * -0.82, 5.88, 2.35));
    registerMesh('incus_long_limb', incLongMesh, new THREE.Vector3(sx * -1.32, 3.1, 0.55));

    // Short Limb (Crus Breve) of Incus & Posterior Incudal Ligament
    const incShortMat = makeContentMaterial('incus_short_limb', { roughness: 0.3, clearcoat: 0.3 });
    const shortLimbCurve = new THREE.CatmullRomCurve3([
      toMIPivot(sx * -0.82, 5.95, 2.35),
      toMIPivot(sx * -3.6, 5.25, 1.85),
      toMIPivot(sx * -7.35, 4.44, 1.32)
    ]);
    const shortLimbMesh = new THREE.Mesh(
      buildSculptedSweep(
        shortLimbCurve,
        24,
        16,
        (t) => {
          const r = THREE.MathUtils.lerp(0.56, 0.14, Math.pow(t, 0.75));
          return { rx: r * 0.88, ry: r * 1.12 };
        },
        true
      ),
      incShortMat
    );
    const postIncLig = buildTaperedTube(
      [toMIPivot(sx * -7.32, 4.44, 1.32), toMIPivot(sx * -7.96, 4.42, 1.32)],
      0.13,
      0.18,
      6,
      10,
      makeContentMaterial('incus_short_limb', {
        overrideColor: 0xe2e8f0,
        opacity: 0.78,
        transparent: true
      })
    );
    incGroup.add(shortLimbMesh, postIncLig);
    registerMesh('incus_short_limb', shortLimbMesh, new THREE.Vector3(sx * -4.2, 5.15, 1.78));
    registerMesh('incus_short_limb', postIncLig);

    // Button-shaped Lenticular Process & Incudostapedial Joint
    const lenticularGeo = new THREE.CylinderGeometry(0.25, 0.22, 0.15, 18);
    lenticularGeo.rotateX(Math.PI / 2);
    const lenticularMesh = new THREE.Mesh(lenticularGeo, lenticularMat);
    lenticularMesh.position.copy(toMIPivot(sx * -1.67, 1.9, -1.72));
    incGroup.add(lenticularMesh);
    registerMesh(
      'incus_lenticular_process',
      lenticularMesh,
      new THREE.Vector3(sx * -1.67, 1.92, -1.72)
    );
    registerMesh('incus_lenticular_process', incPedicleMesh);

    // --- 8c. STAPES SUB-PARTS (Head & Neck, Anterior Crus, Posterior Crus, Footplate & Obturator Membrane) ---
    const staHeadMat = makeContentMaterial('stapes_head_neck', { roughness: 0.25, clearcoat: 0.36 });
    const headNeckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * -1.68, 1.9, -1.78),
      new THREE.Vector3(sx * -1.72, 1.9, -2.25),
      new THREE.Vector3(sx * -1.74, 1.9, -2.68)
    ]);
    const headNeckMesh = new THREE.Mesh(
      buildSculptedSweep(
        headNeckCurve,
        16,
        16,
        (t) => {
          const r = 0.25 - 0.08 * Math.sin(t * Math.PI) + 0.06 * Math.pow(t, 2);
          return { rx: r * 1.15, ry: r * 0.92 };
        },
        true
      ),
      staHeadMat
    );
    const tubGeo = new THREE.SphereGeometry(0.115, 10, 10);
    const tubMesh = new THREE.Mesh(tubGeo, staHeadMat);
    tubMesh.position.copy(stapesNeckAttachWorld);
    stapesGroup.add(headNeckMesh, tubMesh);
    registerMesh('stapes_head_neck', headNeckMesh, new THREE.Vector3(sx * -1.72, 2.02, -2.25));
    registerMesh('stapes_head_neck', tubMesh);

    // Anterior Crus of Stapes (Shorter, Straighter)
    const staAntMat = makeContentMaterial('stapes_anterior_crus', { roughness: 0.25, clearcoat: 0.36 });
    const antCrusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * -1.62, 1.92, -2.62),
      new THREE.Vector3(sx * -1.16, 1.94, -4.35),
      new THREE.Vector3(sx * -0.92, 1.92, -6.22)
    ]);
    const antCrusMesh = new THREE.Mesh(
      buildSculptedSweep(
        antCrusCurve,
        24,
        14,
        (t) => {
          const r = 0.115 + 0.035 * Math.pow(Math.abs(t - 0.5) * 2, 2);
          return { rx: r, ry: r * 0.85 };
        },
        true
      ),
      staAntMat
    );
    stapesGroup.add(antCrusMesh);
    registerMesh('stapes_anterior_crus', antCrusMesh, new THREE.Vector3(sx * -1.16, 1.96, -4.35));

    // Posterior Crus of Stapes (Longer, Thicker, Noticeably More Curved)
    const staPostMat = makeContentMaterial('stapes_posterior_crus', { roughness: 0.25, clearcoat: 0.36 });
    const postCrusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * -1.84, 1.88, -2.62),
      new THREE.Vector3(sx * -2.64, 1.88, -4.25),
      new THREE.Vector3(sx * -2.58, 1.88, -6.22)
    ]);
    const postCrusMesh = new THREE.Mesh(
      buildSculptedSweep(
        postCrusCurve,
        24,
        14,
        (t) => {
          const r = 0.13 + 0.04 * Math.pow(Math.abs(t - 0.5) * 2, 2);
          return { rx: r, ry: r * 0.88 };
        },
        true
      ),
      staPostMat
    );
    stapesGroup.add(postCrusMesh);
    registerMesh('stapes_posterior_crus', postCrusMesh, new THREE.Vector3(sx * -2.62, 1.9, -4.25));

    // Translucent Obturator Membrane + Kidney-Shaped Footplate
    const obtPos = [];
    const obtIdx = [];
    const obtSteps = 16;
    for (let i = 0; i <= obtSteps; i++) {
      const t = i / obtSteps;
      const pA = antCrusCurve.getPointAt(t);
      const pP = postCrusCurve.getPointAt(t);
      obtPos.push(pA.x, pA.y, pA.z, pP.x, pP.y, pP.z);
    }
    for (let i = 0; i < obtSteps; i++) {
      const k = i * 2;
      obtIdx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
    const obtGeo = new THREE.BufferGeometry();
    obtGeo.setAttribute('position', new THREE.Float32BufferAttribute(obtPos, 3));
    obtGeo.setIndex(obtIdx);
    obtGeo.computeVertexNormals();
    const obtMat = makeContentMaterial('stapes_footplate', {
      overrideColor: 0xfef3c7,
      transparent: true,
      opacity: 0.18,
      roughness: 0.25,
      doubleSide: true
    });
    obtMat.depthWrite = false;
    const obtMesh = new THREE.Mesh(obtGeo, obtMat);
    stapesGroup.add(obtMesh);

    const staFootMat = makeContentMaterial('stapes_footplate', { roughness: 0.25, clearcoat: 0.36 });
    const footGeo = buildReniformPlateGeometry(0.95, 0.5, 0.15);
    const footMesh = new THREE.Mesh(footGeo, staFootMat);
    footMesh.position.set(sx * -1.75, 1.9, -Z_HALF + 0.08);
    stapesGroup.add(footMesh);
    registerMesh('stapes_footplate', footMesh, new THREE.Vector3(sx * -1.75, 1.9, -Z_HALF + 0.22));
    registerMesh('stapes_footplate', obtMesh);
  }

  // =========================================================================
  // 9. SEPARATED MUSCLE BELLIES, TENDONS & CRANIAL NERVE BRANCHES
  // =========================================================================
  let tensorMuscleMat = null;
  let stapediusTendonMat = null;

  {
    // 9a-i. TENSOR TYMPANI MUSCLE BELLY (CN V3)
    tensorMuscleMat = makeContentMaterial('tensor_tympani_muscle', {
      map: textures.muscleTex,
      roughness: 0.42,
      clearcoat: 0.28
    });
    const ttBellyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * (X_HALF + 4.0), 2.95, -4.45),
      new THREE.Vector3(sx * (X_HALF - 0.1), 3.45, -4.65),
      new THREE.Vector3(sx * 4.7, 3.46, -5.18),
      new THREE.Vector3(sx * 1.65, 3.42, -5.52)
    ]);
    const ttBellyMesh = new THREE.Mesh(
      buildSculptedSweep(
        ttBellyCurve,
        32,
        16,
        (t) => {
          const r = 0.22 + 0.22 * Math.sin(Math.pow(t, 0.85) * Math.PI * 0.94);
          return { rx: r, ry: r * 0.88 };
        },
        true
      ),
      tensorMuscleMat
    );
    layerGroups.neuromuscular.add(ttBellyMesh);
    registerMesh('tensor_tympani_muscle', ttBellyMesh, new THREE.Vector3(sx * 4.7, 3.55, -5.15));

    // 9a-ii. TENDON OF TENSOR TYMPANI (Separated white pulley cord!)
    const ttTendonMat = makeContentMaterial('tensor_tympani_tendon', {
      overrideColor: 0xf8fafc,
      roughness: 0.2,
      clearcoat: 0.65
    });
    const ttTendonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 1.72, 3.42, -5.52),
      new THREE.Vector3(sx * 1.15, 3.46, -5.32),
      new THREE.Vector3(sx * 0.78, 3.55, -1.2),
      malleusNeckAttachWorld.clone()
    ]);
    const ttTendonMesh = new THREE.Mesh(
      buildSculptedSweep(
        ttTendonCurve,
        26,
        12,
        (t) => {
          const r = 0.095 + 0.045 * Math.pow(t, 3);
          return { rx: r, ry: r * 0.85 };
        },
        true
      ),
      ttTendonMat
    );
    layerGroups.neuromuscular.add(ttTendonMesh);
    registerMesh('tensor_tympani_tendon', ttTendonMesh, new THREE.Vector3(sx * 0.78, 3.58, -0.8));

    // 9b-i. STAPEDIUS MUSCLE BELLY (CN VII — inside Pyramidal Eminence)
    const stapMuscleMat = makeContentMaterial('stapedius_muscle', {
      map: textures.muscleTex,
      roughness: 0.42
    });
    const stapBellyMesh = buildTaperedTube(
      [
        new THREE.Vector3(sx * -8.35, 0.35, -3.9),
        new THREE.Vector3(sx * -7.75, 1.48, -3.5),
        new THREE.Vector3(sx * -6.55, 1.73, -3.18)
      ],
      0.16,
      0.1,
      16,
      12,
      stapMuscleMat,
      0.16
    );
    layerGroups.neuromuscular.add(stapBellyMesh);
    registerMesh('stapedius_muscle', stapBellyMesh, new THREE.Vector3(sx * -7.8, 1.35, -3.55));

    // 9b-ii. TENDON OF STAPEDIUS (Separated apical white tendon!)
    stapediusTendonMat = makeContentMaterial('stapedius_tendon', {
      overrideColor: 0xf8fafc,
      roughness: 0.2,
      clearcoat: 0.65
    });
    const stapTendonMesh = buildTaperedTube(
      [
        new THREE.Vector3(sx * -6.48, 1.75, -3.15),
        new THREE.Vector3(sx * -4.2, 1.82, -2.85),
        stapesNeckAttachWorld.clone()
      ],
      0.085,
      0.11,
      18,
      10,
      stapediusTendonMat
    );
    layerGroups.neuromuscular.add(stapTendonMesh);
    registerMesh('stapedius_tendon', stapTendonMesh, new THREE.Vector3(sx * -4.2, 1.9, -2.85));

    // 9c-i. FACIAL NERVE TRUNK (CN VII — Tympanic & Mastoid Segments + Nerve to Stapedius)
    const cn7Mat = makeContentMaterial('facial_nerve_cn7', {
      overrideColor: 0xfacc15,
      roughness: 0.28,
      clearcoat: 0.4
    });
    const cn7Pts = [
      new THREE.Vector3(sx * 2.4, 3.6, -8.8),
      new THREE.Vector3(sx * 2.9, 3.9, -6.75),
      new THREE.Vector3(sx * 0.2, 3.45, -6.38),
      new THREE.Vector3(sx * -2.5, 3.0, -6.32),
      new THREE.Vector3(sx * -6.8, 2.55, -6.15),
      new THREE.Vector3(sx * -8.55, 2.0, -5.25),
      new THREE.Vector3(sx * -8.65, -1.5, -5.0),
      new THREE.Vector3(sx * -8.65, -6.8, -4.85)
    ];
    const cn7Mesh = buildTaperedTube(cn7Pts, 0.27, 0.3, 52, 14, cn7Mat);
    const nToStapedius = buildTaperedTube(
      [new THREE.Vector3(sx * -8.62, 0.75, -5.05), new THREE.Vector3(sx * -8.1, 0.85, -3.75)],
      0.075,
      0.06,
      8,
      8,
      cn7Mat
    );
    layerGroups.neuromuscular.add(cn7Mesh, nToStapedius);
    registerMesh('facial_nerve_cn7', cn7Mesh, new THREE.Vector3(sx * -8.6, 0.5, -5.1));
    registerMesh('facial_nerve_cn7', nToStapedius);

    // 9c-ii. GENICULATE GANGLION & GREATER PETROSAL NERVE (Separated!)
    const genicMat = makeContentMaterial('geniculate_ganglion_gpn', {
      overrideColor: 0xf59e0b,
      roughness: 0.28,
      clearcoat: 0.4
    });
    const genicGeo = new THREE.SphereGeometry(0.46, 18, 16);
    genicGeo.scale(1.18, 0.92, 1.12);
    const genicMesh = new THREE.Mesh(genicGeo, genicMat);
    genicMesh.position.set(sx * 2.9, 3.9, -6.75);

    const gpnMesh = buildTaperedTube(
      [
        new THREE.Vector3(sx * 2.9, 3.9, -6.75),
        new THREE.Vector3(sx * 5.8, 4.1, -6.9),
        new THREE.Vector3(sx * 9.2, 4.2, -6.8)
      ],
      0.135,
      0.105,
      16,
      8,
      genicMat
    );
    layerGroups.neuromuscular.add(genicMesh, gpnMesh);
    registerMesh('geniculate_ganglion_gpn', genicMesh, new THREE.Vector3(sx * 3.1, 4.05, -6.78));
    registerMesh('geniculate_ganglion_gpn', gpnMesh);

    // 9d. CHORDA TYMPANI NERVE
    const chordaMat = makeContentMaterial('chorda_tympani', {
      overrideColor: 0xfde047,
      roughness: 0.26,
      clearcoat: 0.45
    });
    const chordaPts = [
      new THREE.Vector3(sx * -8.62, -1.2, -5.0),
      new THREE.Vector3(sx * -8.2, 1.8, 0.8),
      new THREE.Vector3(sx * -7.85, 2.95, 3.45),
      new THREE.Vector3(sx * -4.2, 3.65, 3.35),
      new THREE.Vector3(sx * -1.15, 3.95, 3.15),
      new THREE.Vector3(sx * 0.42, 4.15, 3.35),
      new THREE.Vector3(sx * 3.8, 3.85, 4.45),
      new THREE.Vector3(sx * 7.95, 3.35, 5.15)
    ];
    const chordaMesh = buildTaperedTube(chordaPts, 0.11, 0.095, 48, 10, chordaMat);
    layerGroups.neuromuscular.add(chordaMesh);
    registerMesh('chorda_tympani', chordaMesh, new THREE.Vector3(sx * -0.4, 4.08, 3.25));

    // 9e-i. TYMPANIC PLEXUS & JACOBSON'S NERVE (CN IX on Promontory)
    const plexMat = makeContentMaterial('tympanic_plexus', {
      overrideColor: 0xfef08a,
      roughness: 0.28
    });
    const jacobsonLower = buildTaperedTube(
      [
        new THREE.Vector3(sx * 0.4, -6.2, -5.1),
        new THREE.Vector3(sx * 0.4, Y_FLOOR + 0.05, -5.1),
        new THREE.Vector3(sx * 0.45, -2.4, -5.12),
        new THREE.Vector3(sx * 0.72, -0.62, -4.66),
        new THREE.Vector3(sx * 1.12, 1.15, -5.32)
      ],
      0.095,
      0.085,
      26,
      8,
      plexMat
    );
    const plexBranch2 = buildTaperedTube(
      [
        new THREE.Vector3(sx * 0.62, -1.5, -4.82),
        new THREE.Vector3(sx * -0.48, -0.35, -4.88),
        new THREE.Vector3(sx * 0.95, 0.55, -5.08)
      ],
      0.072,
      0.068,
      18,
      8,
      plexMat
    );
    layerGroups.neuromuscular.add(jacobsonLower, plexBranch2);
    registerMesh('tympanic_plexus', jacobsonLower, new THREE.Vector3(sx * 0.72, -0.62, -4.55));
    registerMesh('tympanic_plexus', plexBranch2);

    // 9e-ii. LESSER PETROSAL NERVE (CN IX ascending from Promontory through Tegmen Tympani Roof!)
    const lpnMat = makeContentMaterial('lesser_petrosal_nerve', {
      overrideColor: 0xfde047,
      roughness: 0.28
    });
    const lesserPetrosalMesh = buildTaperedTube(
      [
        new THREE.Vector3(sx * 1.12, 1.15, -5.32),
        new THREE.Vector3(sx * 1.85, 4.4, -5.98),
        new THREE.Vector3(sx * 2.45, 7.4, -5.9),
        new THREE.Vector3(sx * 2.6, Y_ROOF + 0.65, -5.8),
        new THREE.Vector3(sx * 5.2, Y_ROOF + 0.72, -5.6)
      ],
      0.085,
      0.075,
      24,
      8,
      lpnMat
    );
    layerGroups.neuromuscular.add(lesserPetrosalMesh);
    registerMesh('lesser_petrosal_nerve', lesserPetrosalMesh, new THREE.Vector3(sx * 2.15, 5.8, -5.95));

    // 9e-iii. CAROTICOTYMPANIC NERVES (piercing Anterior Wall from ICA Sympathetic Plexus)
    const caroticoMat = makeContentMaterial('caroticotympanic_nerves', {
      overrideColor: 0xfde047,
      roughness: 0.28
    });
    const plexBranch1 = buildTaperedTube(
      [
        new THREE.Vector3(sx * (X_HALF + 1.8), -1.8, -4.35),
        new THREE.Vector3(sx * X_HALF, -1.8, -4.8),
        new THREE.Vector3(sx * 4.2, -1.35, -5.75),
        new THREE.Vector3(sx * 0.92, -0.78, -4.7)
      ],
      0.08,
      0.07,
      22,
      8,
      caroticoMat
    );
    const tympArtBranch = buildTaperedTube(
      [
        new THREE.Vector3(sx * (X_HALF + 2.1), -2.8, -4.0),
        new THREE.Vector3(sx * X_HALF, -2.7, -4.4),
        new THREE.Vector3(sx * 5.2, -2.5, -5.6),
        new THREE.Vector3(sx * 1.85, -1.55, -5.32)
      ],
      0.08,
      0.055,
      18,
      8,
      makeContentMaterial('caroticotympanic_nerves', { overrideColor: 0xef4444, roughness: 0.3 })
    );
    layerGroups.neuromuscular.add(plexBranch1, tympArtBranch);
    registerMesh(
      'caroticotympanic_nerves',
      plexBranch1,
      new THREE.Vector3(sx * 5.2, -1.55, -5.45)
    );
    registerMesh('caroticotympanic_nerves', tympArtBranch);
  }

  // =========================================================================
  // 10. SEPARATED NEIGHBORING STRUCTURES OUTSIDE THE 6 WALLS (10)
  // =========================================================================

  // 10a. ABOVE ROOF: Separated Dura Mater & Middle Meningeal Artery vs. Temporal Lobe Gyri
  {
    const duraMat = makeContentMaterial('dura_middle_meningeal', {
      overrideColor: 0x93c5fd,
      opacity: 0.38,
      transparent: true,
      doubleSide: true,
      roughness: 0.32
    });
    const duraGeo = new THREE.PlaneGeometry(17.5, 14.0);
    duraGeo.rotateX(-Math.PI / 2);
    const duraMesh = new THREE.Mesh(duraGeo, duraMat);
    duraMesh.position.set(0, Y_ROOF + 0.62, 0);
    layerGroups.neighbors.add(duraMesh);

    const mmaMat = makeContentMaterial('dura_middle_meningeal', {
      overrideColor: 0xe11d48,
      roughness: 0.35
    });
    const mmaMesh = buildTaperedTube(
      [
        new THREE.Vector3(sx * 6.5, Y_ROOF + 0.7, 3.8),
        new THREE.Vector3(sx * 1.5, Y_ROOF + 0.72, 0.6),
        new THREE.Vector3(sx * -4.8, Y_ROOF + 0.72, -2.6)
      ],
      0.14,
      0.065,
      20,
      8,
      mmaMat
    );
    layerGroups.neighbors.add(mmaMesh);
    registerMesh('dura_middle_meningeal', mmaMesh, new THREE.Vector3(sx * 1.5, Y_ROOF + 0.72, 0.6));
    registerMesh('dura_middle_meningeal', duraMesh);

    const brainMat = makeContentMaterial('temporal_lobe', {
      overrideColor: 0xebb0c0,
      roughness: 0.46,
      clearcoat: 0.35
    });
    for (let i = -2; i <= 2; i++) {
      const gyrusCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6.9, Y_ROOF + 1.55 + Math.abs(i) * 0.14, i * 2.05),
        new THREE.Vector3(-2.3, Y_ROOF + 1.9 + (i % 2) * 0.28, i * 2.0 + 0.65),
        new THREE.Vector3(2.4, Y_ROOF + 1.62, i * 2.1 - 0.55),
        new THREE.Vector3(6.9, Y_ROOF + 1.85, i * 2.02)
      ]);
      const gyrusMesh = new THREE.Mesh(
        buildSculptedSweep(
          gyrusCurve,
          30,
          16,
          (t) => {
            const r = 1.08 + 0.18 * Math.sin(t * Math.PI * 3 + i);
            return { rx: r * 1.12, ry: r * 0.86 };
          },
          true
        ),
        brainMat
      );
      layerGroups.neighbors.add(gyrusMesh);
      registerMesh('temporal_lobe', gyrusMesh, i === 0 ? new THREE.Vector3(0, Y_ROOF + 1.95, 0) : null);
    }
  }

  // 10b. BELOW FLOOR: Sigmoid Sinus -> Superior Jugular Bulb -> Internal Jugular Vein
  {
    const ijvMat = makeContentMaterial('internal_jugular_vein', {
      overrideColor: 0x2563eb,
      roughness: 0.28,
      clearcoat: 0.42
    });
    const ijvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * -9.2, Y_FLOOR - 1.2, -3.2),
      new THREE.Vector3(sx * -4.2, Y_FLOOR - 2.3, -1.6),
      new THREE.Vector3(sx * 0.15, Y_FLOOR - 1.28, -0.55),
      new THREE.Vector3(sx * 1.35, Y_FLOOR - 3.6, -0.65),
      new THREE.Vector3(sx * 1.55, Y_FLOOR - 8.6, -0.85)
    ]);
    const ijvMesh = new THREE.Mesh(
      buildSculptedSweep(
        ijvCurve,
        42,
        20,
        (t) => {
          const bulbSwell = 0.58 * Math.exp(-Math.pow((t - 0.48) / 0.16, 2));
          const baseR = THREE.MathUtils.lerp(1.18, 1.38, t);
          return { rx: baseR + bulbSwell, ry: (baseR + bulbSwell) * 0.94 };
        },
        true
      ),
      ijvMat
    );
    layerGroups.neighbors.add(ijvMesh);
    registerMesh('internal_jugular_vein', ijvMesh, new THREE.Vector3(sx * 0.15, Y_FLOOR - 1.4, -0.55));
  }

  // 10c. ANTERIOR TO ANTERIOR WALL: Petrous Internal Carotid Artery + Sympathetic Carotid Plexus
  {
    const icaMat = makeContentMaterial('internal_carotid_artery', {
      overrideColor: 0xdc2626,
      roughness: 0.26,
      clearcoat: 0.45
    });
    const icaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * (X_HALF + 2.4), -9.2, -3.8),
      new THREE.Vector3(sx * (X_HALF + 2.3), -2.2, -3.8),
      new THREE.Vector3(sx * (X_HALF + 2.5), 1.8, -4.1),
      new THREE.Vector3(sx * (X_HALF + 5.8), 2.8, -6.8),
      new THREE.Vector3(sx * (X_HALF + 9.5), 3.1, -9.5)
    ]);
    const icaMesh = new THREE.Mesh(
      buildSculptedSweep(icaCurve, 38, 20, () => ({ rx: 1.34, ry: 1.34 }), true),
      icaMat
    );
    layerGroups.neighbors.add(icaMesh);
    registerMesh(
      'internal_carotid_artery',
      icaMesh,
      new THREE.Vector3(sx * (X_HALF + 2.35), -1.2, -3.85)
    );

    // Register the spiraling peri-arterial sympathetic plexus directly with caroticotympanic_nerves!
    const sympMat = makeContentMaterial('caroticotympanic_nerves', {
      overrideColor: 0xfde047,
      roughness: 0.32
    });
    const sympPts = [];
    for (let i = 0; i <= 26; i++) {
      const t = i / 26;
      const c = icaCurve.getPointAt(t);
      const a = t * Math.PI * 5;
      sympPts.push(
        new THREE.Vector3(c.x + Math.cos(a) * 1.42, c.y + Math.sin(a) * 0.45, c.z + Math.sin(a) * 1.42)
      );
    }
    const sympMesh = buildTaperedTube(sympPts, 0.075, 0.075, 36, 8, sympMat);
    layerGroups.neighbors.add(sympMesh);
    registerMesh('caroticotympanic_nerves', sympMesh);
  }

  // 10d. POSTERIOR TO POSTERIOR WALL: Mastoid Antrum & Trabecular Mastoid Air Cells
  {
    const mastoidMat = makeContentMaterial('mastoid_air_cells', {
      map: textures.mastoidTex,
      roughness: 0.6,
      opacity: 0.84,
      transparent: true,
      doubleSide: true
    });

    const antrumGeo = new THREE.BoxGeometry(6.2, 6.6, 7.6);
    const antrumMesh = new THREE.Mesh(antrumGeo, mastoidMat);
    antrumMesh.position.set(sx * (-X_HALF - 3.5), 5.4, -0.7);
    layerGroups.neighbors.add(antrumMesh);

    const cellMat = makeContentMaterial('mastoid_air_cells', {
      overrideColor: 0xd97706,
      opacity: 0.54,
      transparent: true,
      roughness: 0.35,
      clearcoat: 0.3
    });
    const cellOffsets = [
      [-10.1, 1.4, -1.5, 1.38, 1.1, 0.9],
      [-12.4, 0.6, 0.8, 1.52, 0.9, 1.15],
      [-11.0, -1.3, -0.6, 1.45, 1.15, 0.95],
      [-13.2, -2.1, -1.8, 1.28, 1.0, 1.1],
      [-10.4, -3.6, 0.5, 1.22, 0.92, 1.05],
      [-12.7, 3.2, 2.2, 1.32, 1.1, 0.9],
      [-14.2, 4.8, -1.2, 1.42, 0.95, 1.1],
      [-9.8, -2.5, -2.4, 1.12, 1.05, 0.95]
    ];
    cellOffsets.forEach(([ox, oy, oz, r, sy, sz], idx) => {
      const g = new THREE.SphereGeometry(r, 18, 16);
      g.scale(1.0, sy, sz);
      const m = new THREE.Mesh(g, cellMat);
      m.position.set(sx * ox, oy, oz);
      layerGroups.neighbors.add(m);
      registerMesh(
        'mastoid_air_cells',
        m,
        idx === 0 ? new THREE.Vector3(sx * -11.4, 4.6, -0.7) : null
      );
    });
    registerMesh('mastoid_air_cells', antrumMesh);
  }

  // 10e. MEDIAL TO MEDIAL WALL: Separated Cochlea, Vestibule, Semicircular Canals & CN VIII!
  const cochleaFluidWaves = [];
  {
    // 1) Cochlea
    const cochleaMat = makeContentMaterial('cochlea', {
      overrideColor: 0xa855f7,
      roughness: 0.28,
      clearcoat: 0.38
    });
    const { geo: cochleaGeo, curve: cochleaCurve } = buildRealisticCochlea(sx, Z_HALF);
    const cochleaMesh = new THREE.Mesh(cochleaGeo, cochleaMat);
    layerGroups.neighbors.add(cochleaMesh);
    registerMesh('cochlea', cochleaMesh, new THREE.Vector3(sx * 0.85, -0.5, -Z_HALF - 2.3));

    // 2) Vestibule of Bony Labyrinth
    const vestMat = makeContentMaterial('vestibule_inner_ear', {
      overrideColor: 0xc084fc,
      roughness: 0.28,
      clearcoat: 0.38
    });
    const vestGeo = new THREE.SphereGeometry(1.48, 26, 20);
    vestGeo.scale(1.18, 1.12, 0.96);
    const vestMesh = new THREE.Mesh(vestGeo, vestMat);
    vestMesh.position.set(sx * -2.15, 2.0, -Z_HALF - 1.85);
    layerGroups.neighbors.add(vestMesh);
    registerMesh('vestibule_inner_ear', vestMesh, new THREE.Vector3(sx * -2.15, 2.05, -Z_HALF - 1.85));

    // 3) Semicircular Canals, Osseous Ampullae & Crus Commune
    const sccMat = makeContentMaterial('semicircular_canals', {
      overrideColor: 0xd8b4fe,
      roughness: 0.28,
      clearcoat: 0.38
    });
    function buildCanalWithAmpulla(pts) {
      const c = new THREE.CatmullRomCurve3(pts);
      const g = buildSculptedSweep(
        c,
        34,
        14,
        (t) => {
          const ampulla = 0.26 * Math.exp(-Math.pow((t - 0.08) / 0.09, 2));
          const r = 0.25 + ampulla;
          return { rx: r, ry: r * 0.95 };
        },
        true
      );
      return new THREE.Mesh(g, sccMat);
    }

    const latSccPts = [];
    for (let i = 0; i <= 30; i++) {
      const a = -Math.PI * 0.22 + (i / 30) * Math.PI * 1.52;
      latSccPts.push(
        new THREE.Vector3(
          sx * (-3.5 - Math.cos(a) * 2.15),
          4.88 + Math.sin(a) * 0.2,
          -Z_HALF - 1.9 + Math.sin(a) * 1.68
        )
      );
    }
    const latSccMesh = buildCanalWithAmpulla(latSccPts);

    const crusCommuneJoin = new THREE.Vector3(sx * -3.55, 3.85, -Z_HALF - 3.35);
    const supSccMesh = buildCanalWithAmpulla([
      new THREE.Vector3(sx * -1.9, 3.25, -Z_HALF - 1.65),
      new THREE.Vector3(sx * -1.5, 5.85, -Z_HALF - 2.05),
      new THREE.Vector3(sx * -2.85, 5.95, -Z_HALF - 3.1),
      crusCommuneJoin.clone()
    ]);
    const postSccMesh = buildCanalWithAmpulla([
      new THREE.Vector3(sx * -3.2, 0.95, -Z_HALF - 2.05),
      new THREE.Vector3(sx * -5.25, 1.85, -Z_HALF - 3.65),
      new THREE.Vector3(sx * -4.85, 4.45, -Z_HALF - 4.15),
      crusCommuneJoin.clone()
    ]);
    const crusCommuneMesh = buildTaperedTube(
      [crusCommuneJoin, new THREE.Vector3(sx * -2.65, 2.55, -Z_HALF - 2.25)],
      0.34,
      0.38,
      12,
      12,
      sccMat
    );
    layerGroups.neighbors.add(latSccMesh, supSccMesh, postSccMesh, crusCommuneMesh);
    [supSccMesh, latSccMesh, postSccMesh, crusCommuneMesh].forEach((m, idx) =>
      registerMesh(
        'semicircular_canals',
        m,
        idx === 0 ? new THREE.Vector3(sx * -2.35, 5.85, -Z_HALF - 2.6) : null
      )
    );

    // 4) Bifurcated Vestibulocochlear Nerve (CN VIII)
    const cn8Mat = makeContentMaterial('vestibulocochlear_nerve_cn8', {
      overrideColor: 0xfacc15,
      roughness: 0.3
    });
    const cn8Join = new THREE.Vector3(sx * -0.55, 1.25, -Z_HALF - 4.9);
    const cochlearDiv = buildTaperedTube(
      [new THREE.Vector3(sx * 0.72, -0.55, -Z_HALF - 2.35), cn8Join],
      0.38,
      0.34,
      14,
      12,
      cn8Mat
    );
    const vestibularDiv = buildTaperedTube(
      [new THREE.Vector3(sx * -2.05, 2.15, -Z_HALF - 2.45), cn8Join],
      0.32,
      0.32,
      14,
      12,
      cn8Mat
    );
    const cn8Trunk = buildTaperedTube(
      [cn8Join, new THREE.Vector3(sx * -0.35, 1.85, -Z_HALF - 8.8)],
      0.48,
      0.52,
      16,
      14,
      cn8Mat
    );
    layerGroups.neighbors.add(cochlearDiv, vestibularDiv, cn8Trunk);
    [cn8Trunk, cochlearDiv, vestibularDiv].forEach((m, idx) =>
      registerMesh(
        'vestibulocochlear_nerve_cn8',
        m,
        idx === 0 ? new THREE.Vector3(sx * -0.48, 1.48, -Z_HALF - 6.2) : null
      )
    );

    for (let i = 0; i < 4; i++) {
      const wGeo = new THREE.SphereGeometry(0.26, 12, 10);
      const wMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.0
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      wMesh.visible = false;
      layerGroups.annotations.add(wMesh);
      cochleaFluidWaves.push({ mesh: wMesh, curve: cochleaCurve, offset: i * 0.25 });
    }
  }

  // 10f. LATERAL TO LATERAL WALL: Separated External Acoustic Meatus vs. Auricle (Pinna)!
  const soundWaveRings = [];
  {
    const earCanalMat = makeContentMaterial('external_acoustic_meatus', {
      overrideColor: 0xe2a98f,
      opacity: 0.48,
      transparent: true,
      doubleSide: true,
      roughness: 0.5
    });

    const canalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(drumCenterX, drumCenterY, Z_HALF + 0.15),
      new THREE.Vector3(sx * 0.48, 0.58, Z_HALF + 4.2),
      new THREE.Vector3(sx * -0.15, 0.22, Z_HALF + 8.5),
      new THREE.Vector3(sx * -0.35, -0.18, Z_HALF + 12.6)
    ]);
    const canalGeo = buildSculptedSweep(
      canalCurve,
      32,
      26,
      (t) => {
        const r = 3.75 - 0.38 * Math.exp(-Math.pow((t - 0.34) / 0.2, 2)) + 0.22 * t;
        return { rx: r * 0.94, ry: r * 1.04 };
      },
      false
    );
    const canalMesh = new THREE.Mesh(canalGeo, earCanalMat);
    layerGroups.neighbors.add(canalMesh);
    registerMesh('external_acoustic_meatus', canalMesh, new THREE.Vector3(sx * 0.15, 0.4, Z_HALF + 6.2));

    const pinnaCartilageMat = makeContentMaterial('auricle_pinna', {
      overrideColor: 0xdc9d82,
      roughness: 0.46,
      clearcoat: 0.18
    });
    const pinnaLobuleMat = makeContentMaterial('auricle_pinna', {
      overrideColor: 0xd48f74,
      roughness: 0.52
    });
    const pinnaGroup = buildRealisticPinnaGroup(
      sx,
      Z_HALF + 12.4,
      pinnaCartilageMat,
      pinnaLobuleMat
    );
    layerGroups.neighbors.add(pinnaGroup);
    pinnaGroup.children.forEach((child, idx) =>
      registerMesh(
        'auricle_pinna',
        child,
        idx === 0 ? new THREE.Vector3(sx * -2.6, 1.2, Z_HALF + 13.8) : null
      )
    );

    for (let i = 0; i < 4; i++) {
      const rGeo = new THREE.TorusGeometry(2.35, 0.09, 12, 32);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.0
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.visible = false;
      layerGroups.annotations.add(rMesh);
      soundWaveRings.push({ mesh: rMesh, curve: canalCurve, offset: i * 0.25 });
    }
  }

  // =========================================================================
  // DYNAMIC APPEARANCE & ANIMATION CONTROLLERS
  // =========================================================================
  let currentPalette = 'box';
  let currentXrayMode = 0;
  let currentOssicleMode = 0;

  function applyPaletteAndOpacity() {
    const wallOpacityFactor = currentXrayMode === 0 ? 1.0 : currentXrayMode === 1 ? 0.38 : 0.14;

    wallMaterialRecords.forEach((rec) => {
      const data = ANATOMY_DATA[rec.structureId];
      if (!rec.isMembrane) {
        rec.mat.color.setHex(currentPalette === 'box' ? data.boxColor : data.tissueColor);
      } else {
        rec.mat.color.setHex(currentPalette === 'box' ? 0xdbeafe : 0xffffff);
      }
      rec.mat.userData.baseColorHex = rec.mat.color.getHex();
      const targetOp = rec.isMembrane
        ? Math.min(rec.baseOpacity, wallOpacityFactor * 0.92 + 0.12)
        : rec.baseOpacity * wallOpacityFactor;
      rec.mat.opacity = targetOp;
      rec.mat.depthWrite = targetOp > 0.75;
    });

    layerGroups.ossicles.visible = currentOssicleMode !== 2;
    registry.forEach((entry) => {
      if (!entry.data.isOssicle) return;
      entry.meshes.forEach((m) => {
        const baseOp = entry.id === 'stapes_footplate' && m.material.opacity < 0.25 ? 0.18 : 1.0;
        if (baseOp < 0.25) return; // keep delicate obturator membrane translucent
        m.material.transparent = currentOssicleMode === 1 || entry.id === 'mallear_ligaments';
        m.material.opacity =
          currentOssicleMode === 1 ? 0.24 : entry.id === 'mallear_ligaments' ? 0.78 : 1.0;
        m.material.depthWrite = currentOssicleMode !== 1;
      });
    });
  }

  applyPaletteAndOpacity();

  let doorCurrent = 0;
  let doorTarget = 0;

  function update(timeSec, dt, soundMode = 'off') {
    doorCurrent = THREE.MathUtils.lerp(doorCurrent, doorTarget, Math.min(1, dt * 6.5));
    lateralDoorPivot.rotation.y = sx * (-Math.PI * 0.47) * doorCurrent;

    if (soundMode === 'off') {
      tympanicMembraneGroup.position.z = 0;
      malleusIncusPivot.rotation.z = 0;
      stapesGroup.position.z = 0;
      if (roundWindowMembraneMesh) {
        roundWindowMembraneMesh.position.z = -Z_HALF - 0.18;
        roundWindowMembraneMesh.scale.z = 1;
      }
      if (tensorMuscleMat) tensorMuscleMat.emissive.setHex(0x000000);
      if (stapediusTendonMat) stapediusTendonMat.emissive.setHex(0x000000);
      soundWaveRings.forEach((r) => (r.mesh.visible = false));
      cochleaFluidWaves.forEach((w) => (w.mesh.visible = false));
      return;
    }

    const isLoud = soundMode === 'loud';
    const freq = isLoud ? 8.5 : 5.5;
    const phase = Math.sin(timeSec * freq);
    const damp = isLoud ? 0.32 : 1.0;

    tympanicMembraneGroup.position.z = -phase * 0.22 * damp;
    malleusIncusPivot.rotation.z = sx * phase * 0.055 * damp;
    stapesGroup.position.z = -phase * 0.26 * damp;

    if (roundWindowMembraneMesh) {
      roundWindowMembraneMesh.position.z = -Z_HALF - 0.14 + phase * 0.24 * damp;
      roundWindowMembraneMesh.scale.z = 1.0 + phase * 0.55 * damp;
    }

    if (tensorMuscleMat && stapediusTendonMat) {
      if (isLoud) {
        const pulse = 0.55 + 0.45 * Math.sin(timeSec * 10);
        tensorMuscleMat.emissive.setRGB(0.55 * pulse, 0.08 * pulse, 0.05 * pulse);
        stapediusTendonMat.emissive.setRGB(0.45 * pulse, 0.18 * pulse, 0.08 * pulse);
      } else {
        tensorMuscleMat.emissive.setHex(0x000000);
        stapediusTendonMat.emissive.setHex(0x000000);
      }
    }

    soundWaveRings.forEach((item) => {
      item.mesh.visible = true;
      const t = (timeSec * (isLoud ? 0.85 : 0.55) + item.offset) % 1.0;
      const u = 1.0 - t;
      const pt = item.curve.getPointAt(u);
      item.mesh.position.copy(pt);
      const s = (isLoud ? 1.15 : 0.85) * (0.7 + 0.3 * u);
      item.mesh.scale.setScalar(s);
      item.mesh.material.color.setHex(isLoud ? 0xf97316 : 0x38bdf8);
      item.mesh.material.opacity = Math.sin(t * Math.PI) * (isLoud ? 0.85 : 0.65);
    });

    cochleaFluidWaves.forEach((item) => {
      item.mesh.visible = true;
      const t = (timeSec * 0.48 + item.offset) % 1.0;
      const pt = item.curve.getPointAt(t);
      item.mesh.position.copy(pt);
      item.mesh.material.color.setHex(isLoud ? 0xfbbf24 : 0x38bdf8);
      item.mesh.material.opacity = Math.sin(t * Math.PI) * 0.85;
    });
  }

  return {
    root,
    earSide,
    sx,
    bounds: { X_HALF, Y_FLOOR, Y_ATTIC_LINE, Y_ROOF, Z_HALF },
    registry,
    pickableMeshes,
    wallGroups,
    layerGroups,
    setPalette(mode) {
      currentPalette = mode;
      applyPaletteAndOpacity();
    },
    getPalette() {
      return currentPalette;
    },
    setXrayMode(modeInt) {
      currentXrayMode = modeInt;
      applyPaletteAndOpacity();
    },
    getXrayMode() {
      return currentXrayMode;
    },
    setOssicleMode(modeInt) {
      currentOssicleMode = modeInt;
      applyPaletteAndOpacity();
    },
    getOssicleMode() {
      return currentOssicleMode;
    },
    setDoorOpen(isOpen) {
      doorTarget = isOpen ? 1 : 0;
    },
    isDoorOpen() {
      return doorTarget > 0.5;
    },
    update
  };
}
