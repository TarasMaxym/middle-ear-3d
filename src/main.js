import * as THREE from 'three';
import { ANATOMY_DATA, CATEGORIES, STRUCTURE_LIST } from './data/anatomyData.js';
import { createMaterialLibrary } from './scene/proceduralMaterials.js';
import { buildMiddleEarDiorama } from './scene/earBuilder.js';
import { CreativeFlightControls } from './controls/creativeControls.js';
import { AnatomicalCompassGizmo } from './ui/compassGizmo.js';
import { QUIZ_DECKS, SpatialQuizManager } from './quiz/quizManager.js';
import { RecallQuizManager } from './quiz/recallQuizManager.js';
import { GuidedLessonManager } from './lesson/lessonManager.js';

// =========================================================================
// 1. THREE.JS SCENE, CAMERA, RENDERER & LIGHTING
// =========================================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070c18);
scene.fog = new THREE.FogExp2(0x070c18, 0.011);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.08, 160);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
container.appendChild(renderer.domElement);

// Balanced Interior + Exterior Medical Studio Lighting
const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x94a3b8, 1.05);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.05);
sunLight.position.set(18, 26, 20);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
rimLight.position.set(-20, -14, -18);
scene.add(rimLight);

// Interior room architectural bounce lights so inside the 6-walled box is bright & crisp
const roomTopLight = new THREE.PointLight(0xfff7ed, 28, 34, 1.35);
roomTopLight.position.set(0, 7.2, 1.2);
scene.add(roomTopLight);

const roomBottomFill = new THREE.PointLight(0xe0f2fe, 16, 28, 1.4);
roomBottomFill.position.set(0, -2.6, -1.5);
scene.add(roomBottomFill);

// Gentle headlamp attached to camera for close-up inspection inside crevices/antrum
const headLamp = new THREE.PointLight(0xffffff, 7.5, 16, 1.45);
camera.add(headLamp);
scene.add(camera);

// Subtle 3D spatial reference floor grid far beneath Jugular Bulb for exterior orientation
const worldGrid = new THREE.GridHelper(64, 32, 0x1e293b, 0x0f172a);
worldGrid.position.y = -13.5;
scene.add(worldGrid);

// =========================================================================
// 2. 3D BEACON RING & GUIDE LINE (FOR STUDY LIST & QUIZ "SHOW ME")
// =========================================================================
const beaconGroup = new THREE.Group();
beaconGroup.visible = false;
scene.add(beaconGroup);

const beaconRingMesh = new THREE.Mesh(
  new THREE.TorusGeometry(0.95, 0.08, 14, 36),
  new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.92, depthTest: false })
);
beaconRingMesh.renderOrder = 999;
beaconGroup.add(beaconRingMesh);

const beaconLineGeo = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(),
  new THREE.Vector3()
]);
const beaconLine = new THREE.Line(
  beaconLineGeo,
  new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.78, depthTest: false })
);
beaconLine.renderOrder = 998;
scene.add(beaconLine);
beaconLine.visible = false;

let activeBeaconStructureId = null;
let beaconExpireTime = 0;

function trigger3DBeacon(structureId, durationSec = 6.5) {
  activeBeaconStructureId = structureId;
  beaconExpireTime = performance.now() * 0.001 + durationSec;
}

function clear3DBeacon() {
  activeBeaconStructureId = null;
  beaconGroup.visible = false;
  beaconLine.visible = false;
}

// Persistent 3D Spotlight Reticle for "Type-It Quiz (Hard)" (Recall Mode)
const spotlightGroup = new THREE.Group();
spotlightGroup.visible = false;
scene.add(spotlightGroup);

const spotlightOuterRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.92, 0.055, 14, 40),
  new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0.9, depthTest: false })
);
spotlightOuterRing.renderOrder = 997;
spotlightGroup.add(spotlightOuterRing);

const spotlightInnerRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.56, 0.035, 12, 32),
  new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, depthTest: false })
);
spotlightInnerRing.renderOrder = 997;
spotlightGroup.add(spotlightInnerRing);

// =========================================================================
// 3. BUILD ANATOMICAL DIORAMA & STATE MANAGEMENT
// =========================================================================
const textures = createMaterialLibrary();

const appState = {
  mode: 'explore', // 'explore' | 'quiz'
  earSide: 'right', // 'right' | 'left'
  palette: 'box', // 'box' | 'tissue'
  xrayMode: 0, // 0 = Solid, 1 = X-Ray (38%), 2 = Ghost (14%)
  doorOpen: false,
  ossicleMode: 0, // 0 = Full, 1 = Ghost, 2 = Hidden
  labelMode: 0, // 0 = Key (Tier 1), 1 = All, 2 = Walls Only, 3 = Off
  soundMode: 'off', // 'off' | 'normal' | 'loud'
  drawerOpen: true,
  wallVisibility: {
    roof: true,
    floor: true,
    medial: true,
    lateral: true,
    anterior: true,
    posterior: true
  },
  hoveredId: null,
  pinnedId: null,
  flashFeedback: null // { id, colorHex, until }
};

let diorama = null;
const labelElements = new Map(); // structureId -> HTMLElement
const labelsLayer = document.getElementById('labels-layer');

function rebuildDiorama(earSide) {
  if (diorama) {
    scene.remove(diorama.root);
  }
  diorama = buildMiddleEarDiorama({ earSide, textures });
  scene.add(diorama.root);

  // Re-apply user settings seamlessly
  diorama.setPalette(appState.palette);
  diorama.setXrayMode(appState.xrayMode);
  diorama.setOssicleMode(appState.ossicleMode);
  diorama.setDoorOpen(appState.doorOpen);
  Object.entries(appState.wallVisibility).forEach(([wallKey, vis]) => {
    if (diorama.wallGroups[wallKey]) {
      diorama.wallGroups[wallKey].visible = vis;
    }
  });

  // Rebuild crisp DOM floating spatial labels
  labelsLayer.innerHTML = '';
  labelElements.clear();
  diorama.registry.forEach((entry, id) => {
    const el = document.createElement('div');
    el.className = 'spatial-label';
    const dotColor = `#${entry.data.boxColor.toString(16).padStart(6, '0')}`;
    el.innerHTML = `<span class="dot" style="background:${dotColor}"></span>${entry.data.shortName}`;
    labelsLayer.appendChild(el);
    labelElements.set(id, el);
  });
}

rebuildDiorama(appState.earSide);

// =========================================================================
// 4. MINECRAFT CREATIVE FLIGHT CONTROLS & COMPASS GIZMO
// =========================================================================
const flightStatusPill = document.getElementById('flight-status-pill');
const lblSpeed = document.getElementById('lbl-speed');

const controls = new CreativeFlightControls(camera, renderer.domElement, {
  onLockChange(locked) {
    flightStatusPill.classList.toggle('locked', locked);
  },
  onSpeedChange(mult) {
    lblSpeed.textContent = `${mult.toFixed(1)}×`;
  }
});

// Start in Classic Room Center facing Medial Wall (wide room view showing all surrounding walls & ossicles!)
controls.lookAtPoint(new THREE.Vector3(sxInit(), 1.85, 5.15), new THREE.Vector3(0, 1.35, -6.5), true);

function sxInit() {
  return -1.35; // Slight posterior offset so ossicles, promontory, windows, and walls are all unoccluded
}

const compass = new AnatomicalCompassGizmo(
  document.getElementById('compass-canvas'),
  document.getElementById('facing-readout'),
  document.getElementById('zone-readout')
);

// =========================================================================
// 5. CAMERA PRESETS & "FLY TO STRUCTURE"
// =========================================================================
function goToPreset(num) {
  const sx = appState.earSide === 'right' ? 1 : -1;
  switch (num) {
    case 1: // Room Center facing Medial Wall (wide room panorama)
      setNoclip(false);
      controls.lookAtPoint(new THREE.Vector3(sx * -1.35, 1.85, 5.15), new THREE.Vector3(0, 1.35, -6.5));
      break;
    case 2: // Epitympanic Recess (Attic)
      setNoclip(false);
      controls.lookAtPoint(
        new THREE.Vector3(sx * 4.5, 6.55, 4.35),
        new THREE.Vector3(sx * -2.2, 5.8, 0.8)
      );
      break;
    case 3: // Medial Wall Closeup (Promontory, Windows, Facial Canal)
      setNoclip(false);
      controls.lookAtPoint(
        new THREE.Vector3(sx * 1.4, 0.85, -0.35),
        new THREE.Vector3(sx * -0.9, 0.65, -6.4)
      );
      break;
    case 4: // Posterior Wall, Aditus, Pyramidal Eminence & Chorda Tympani
      setNoclip(false);
      controls.lookAtPoint(
        new THREE.Vector3(sx * 2.8, 2.55, 0.75),
        new THREE.Vector3(sx * -7.6, 2.75, -1.6)
      );
      break;
    case 5: // Anterior Wall & Conical Tympanic Membrane / Malleus
      setNoclip(false);
      controls.lookAtPoint(
        new THREE.Vector3(sx * -3.8, 1.6, -2.4),
        new THREE.Vector3(sx * 3.4, 1.25, 3.2)
      );
      break;
    case 6: // Coronal Cutaway Overview (Outer -> Middle -> Inner Ear!)
      setNoclip(true);
      if (appState.xrayMode === 0) setXrayMode(1);
      controls.lookAtPoint(
        new THREE.Vector3(sx * 24.5, 4.2, 5.5),
        new THREE.Vector3(0, 1.1, 0.6)
      );
      break;
    case 7: // Full 3D Exterior Diorama
      setNoclip(true);
      if (appState.xrayMode === 0) setXrayMode(1);
      controls.lookAtPoint(
        new THREE.Vector3(sx * 18.0, 11.8, 18.0),
        new THREE.Vector3(0, 1.2, -1.0)
      );
      break;
    default:
      break;
  }
}

const INTRAMURAL_XRAY_IDS = new Set([
  'facial_nerve_cn7',
  'geniculate_ganglion_gpn',
  'lesser_petrosal_nerve',
  'caroticotympanic_nerves',
  'stapedius_muscle',
  'tensor_tympani_muscle'
]);

const LARGE_ROOM_WALL_IDS = new Set([
  'tegmen_tympani',
  'jugular_wall',
  'medial_wall',
  'posterior_wall',
  'anterior_wall',
  'lateral_wall_scutum',
  'epitympanic_recess'
]);

function ensureAllWallsVisible() {
  Object.keys(appState.wallVisibility).forEach((w) => {
    if (!appState.wallVisibility[w]) {
      appState.wallVisibility[w] = true;
      if (diorama.wallGroups[w]) diorama.wallGroups[w].visible = true;
    }
  });
  document.querySelectorAll('.mini-toggle[data-wall]').forEach((b) => b.classList.add('on'));
}

function flyToStructure(structureId, opts = {}) {
  const entry = diorama.registry.get(structureId);
  if (!entry) return;
  const target = entry.anchor.clone();
  const data = entry.data;
  const sx = appState.earSide === 'right' ? 1 : -1;
  const needsXray = data.category === CATEGORIES.NEIGHBORS || INTRAMURAL_XRAY_IDS.has(structureId);

  if (opts.forRecall) {
    ensureAllWallsVisible();
    if (appState.doorOpen) setDoorOpen(false);
    if (data.isOssicle) {
      if (appState.ossicleMode !== 0) setOssicleMode(0);
    } else if (structureId === 'oval_window') {
      setOssicleMode(1); // Ghost stapes footplate so glowing Oval Window rim/fenestra is unmistakable
    } else if (appState.ossicleMode !== 0) {
      setOssicleMode(0);
    }
    setNoclip(needsXray);
    setXrayMode(needsXray ? 1 : 0);
  } else {
    if (data.isOssicle && appState.ossicleMode === 2) setOssicleMode(0);
    if (needsXray) {
      setNoclip(true);
      if (appState.xrayMode === 0) setXrayMode(1);
    }
  }

  // Pick an unoccluded viewing vantage tailored to the region & sub-part scale
  const roomCenter = new THREE.Vector3(0, 1.8, 0.5);
  let camPos;

  if (structureId === 'auricle_pinna' || structureId === 'external_acoustic_meatus') {
    const distX = structureId === 'auricle_pinna' ? 21.5 : 15.8;
    camPos = new THREE.Vector3(sx * distX, target.y + 3.2, target.z + 8.2);
  } else if (data.parentGroup === 'inner_ear') {
    camPos = new THREE.Vector3(target.x - sx * 2.8, target.y + 2.4, target.z + 5.6);
  } else if (data.category === CATEGORIES.NEIGHBORS) {
    const viewOffset = target.clone().sub(roomCenter).normalize().multiplyScalar(5.0);
    viewOffset.y += 1.6;
    viewOffset.z += 2.6;
    camPos = target.clone().add(viewOffset);
  } else if (LARGE_ROOM_WALL_IDS.has(structureId)) {
    const viewOffset = roomCenter.clone().sub(target);
    if (viewOffset.lengthSq() < 0.5) viewOffset.set(0, 0.5, 5.5);
    viewOffset.normalize().multiplyScalar(6.2);
    camPos = target.clone().add(viewOffset);
  } else {
    const viewOffset = roomCenter.clone().sub(target);
    if (viewOffset.lengthSq() < 0.6) {
      viewOffset.set(-sx * 1.1, 0.5, 3.6);
    }
    const dist = data.tier === 3 ? 3.15 : data.tier === 2 ? 3.85 : 4.5;
    viewOffset.normalize().multiplyScalar(dist);
    viewOffset.y += 0.22;
    // Slight oblique nudge so Bottom-Left UI panel never overlaps the spotlighted landmark
    viewOffset.x -= sx * 0.35;
    camPos = target.clone().add(viewOffset);
  }

  if (!controls.noclip) {
    camPos.x = THREE.MathUtils.clamp(camPos.x, -7.1, 7.1);
    camPos.y = THREE.MathUtils.clamp(camPos.y, -4.1, 8.1);
    camPos.z = THREE.MathUtils.clamp(camPos.z, -5.6, 5.6);
  }
  controls.lookAtPoint(camPos, target, Boolean(opts.instant));
  if (!opts.noBeacon) {
    trigger3DBeacon(structureId, 4.5);
  }
}

// =========================================================================
// 6. SMART CROSSHAIR RAYCASTING & INSPECTOR UPDATES
// =========================================================================
const raycaster = new THREE.Raycaster();
const centerNDC = new THREE.Vector2(0, 0);
const WALL_SLAB_IDS = new Set([
  'tegmen_tympani',
  'jugular_wall',
  'medial_wall',
  'posterior_wall',
  'anterior_wall',
  'lateral_wall_scutum',
  'tympanic_membrane',
  'tm_pars_tensa',
  'tm_pars_flaccida',
  'tm_umbo',
  'tm_cone_of_light',
  'epitympanic_recess'
]);

function performCrosshairRaycast() {
  raycaster.setFromCamera(centerNDC, camera);
  const hits = raycaster.intersectObjects(diorama.pickableMeshes, false);
  if (hits.length === 0) return null;

  // Filter out invisible groups/meshes or completely hidden ossicles
  const validHits = hits.filter((h) => {
    let obj = h.object;
    while (obj) {
      if (!obj.visible) return false;
      obj = obj.parent;
    }
    const sid = h.object.userData.structureId;
    if (!sid) return false;
    if (diorama.getOssicleMode() === 2 && ANATOMY_DATA[sid]?.isOssicle) {
      return false;
    }
    return true;
  });

  if (validHits.length === 0) return null;

  // Smart X-Ray Pass-Through:
  // When walls are in X-Ray / Ghost mode (xrayMode >= 1), if the ray passes through a
  // translucent wall slab and hits a specific landmark, nerve, vessel, or neighboring organ behind it,
  // prioritize that specific structure (unless the active Quiz question specifically asks for that wall!).
  if (appState.xrayMode >= 1) {
    const firstId = validHits[0].object.userData.structureId;
    const firstParent = ANATOMY_DATA[firstId]?.parentGroup;
    const quizWantsFirstWall =
      (appState.mode === 'quiz' &&
        quizManager.currentTarget &&
        quizManager.currentTarget.id === firstId) ||
      (appState.mode === 'recall' &&
        recallManager.currentTarget &&
        recallManager.currentTarget.id === firstId) ||
      (appState.mode === 'lesson' &&
        lessonManager.currentStep.type === 'checkpoint' &&
        !lessonManager.checkpointSolved &&
        (lessonManager.currentStep.targetId === firstId ||
          (firstParent && lessonManager.currentStep.targetId === firstParent)));

    if (WALL_SLAB_IDS.has(firstId) && !quizWantsFirstWall) {
      const deeperSpecificHit = validHits.find(
        (h) => !WALL_SLAB_IDS.has(h.object.userData.structureId) && h.distance < 34
      );
      if (deeperSpecificHit) {
        return deeperSpecificHit.object.userData.structureId;
      }
    }
  }

  // Also allow aiming right through the semi-transparent Attic bounding box at ossicle parts/ligaments inside it!
  if (validHits[0].object.userData.structureId === 'epitympanic_recess' && validHits.length > 1) {
    const quizWantsAttic =
      (appState.mode === 'quiz' &&
        quizManager.currentTarget &&
        quizManager.currentTarget.id === 'epitympanic_recess') ||
      (appState.mode === 'recall' &&
        recallManager.currentTarget &&
        recallManager.currentTarget.id === 'epitympanic_recess') ||
      (appState.mode === 'lesson' &&
        lessonManager.currentStep.type === 'checkpoint' &&
        !lessonManager.checkpointSolved &&
        lessonManager.currentStep.targetId === 'epitympanic_recess');
    if (!quizWantsAttic) {
      const atticInnerHit = validHits
        .slice(1)
        .find((h) => !WALL_SLAB_IDS.has(h.object.userData.structureId) && h.distance < 18);
      if (atticInnerHit) {
        return atticInnerHit.object.userData.structureId;
      }
    }
  }

  return validHits[0].object.userData.structureId;
}

// Inspector DOM elements
const crosshairEl = document.getElementById('crosshair');
const crosshairTagEl = document.getElementById('crosshair-tag');
const inspectorCard = document.getElementById('inspector-card');
const inspCat = document.getElementById('insp-cat');
const inspWall = document.getElementById('insp-wall');
const inspParent = document.getElementById('insp-parent');
const inspPinBadge = document.getElementById('insp-pin-badge');
const inspTitle = document.getElementById('insp-title');
const inspAka = document.getElementById('insp-aka');
const inspSummary = document.getElementById('insp-summary');
const inspRelations = document.getElementById('insp-relations');
const inspSupply = document.getElementById('insp-supply');
const inspPearl = document.getElementById('insp-pearl');

function renderInspector(structureId, isPinned) {
  const data = ANATOMY_DATA[structureId];
  if (!data) return;
  inspectorCard.classList.toggle('is-pinned', isPinned);
  inspPinBadge.style.display = isPinned ? 'inline-block' : 'none';
  inspCat.textContent = data.category;
  inspWall.textContent = data.wall;
  if (data.parentName) {
    inspParent.textContent = `Part of: ${data.parentName}`;
    inspParent.style.display = 'inline-block';
  } else {
    inspParent.style.display = 'none';
  }
  inspTitle.textContent = data.name;
  inspAka.textContent = data.aka;
  inspSummary.textContent = data.summary;
  inspRelations.textContent = data.relations;
  inspSupply.textContent = data.supply;
  inspPearl.innerHTML = `<strong>USMLE / Clinical Pearl:</strong> ${data.clinicalPearl}`;

  // Highlight active row in study list
  document.querySelectorAll('.struct-item').forEach((row) => {
    row.classList.toggle('active', row.dataset.id === structureId);
  });
}

function refreshCrosshairTag(hitId) {
  if (!hitId) {
    crosshairTagEl.classList.remove('visible');
    return;
  }
  const data = ANATOMY_DATA[hitId];
  if (!data) {
    crosshairTagEl.classList.remove('visible');
    return;
  }

  // Never leak structure names on crosshair hover during active quizzes or unsolved checkpoints!
  if (appState.mode === 'recall') {
    if (recallManager.answeredCurrent) {
      crosshairTagEl.textContent = data.shortName;
    } else if (recallManager.currentTarget && hitId === recallManager.currentTarget.id) {
      crosshairTagEl.textContent = '★ Spotlighted Target — Name It!';
    } else {
      crosshairTagEl.textContent = 'Context Structure (Name Hidden)';
    }
  } else if (appState.mode === 'quiz') {
    crosshairTagEl.textContent = quizManager.answeredCurrent ? data.shortName : 'Left-Click to Pick';
  } else if (
    appState.mode === 'lesson' &&
    lessonManager.currentStep.type === 'checkpoint' &&
    !lessonManager.checkpointSolved
  ) {
    crosshairTagEl.textContent = 'Left-Click to Pick Checkpoint Answer';
  } else {
    crosshairTagEl.textContent = data.shortName;
  }
  crosshairTagEl.classList.add('visible');
}

const _baseCol = new THREE.Color();
const _tintCol = new THREE.Color();

function updateEmissiveHighlights(nowSec) {
  const lessonFocusSet =
    appState.mode === 'lesson' ? new Set(lessonManager.getFocusStructureIds()) : null;
  const recallTargetId =
    appState.mode === 'recall' && recallManager.currentTarget ? recallManager.currentTarget.id : null;

  diorama.registry.forEach((entry, id) => {
    let r = 0,
      g = 0,
      b = 0;
    let tintHex = null;
    let tintAlpha = 0;

    if (appState.flashFeedback && appState.flashFeedback.id === id && nowSec < appState.flashFeedback.until) {
      const c = new THREE.Color(appState.flashFeedback.colorHex);
      r = c.r * 0.55;
      g = c.g * 0.55;
      b = c.b * 0.55;
      tintHex = appState.flashFeedback.colorHex;
      tintAlpha = 0.55;
    } else if (recallTargetId === id) {
      if (recallManager.answeredCurrent) {
        if (recallManager.gaveUpCurrent) {
          r = 0.12;
          g = 0.34;
          b = 0.52;
          tintHex = 0x38bdf8;
          tintAlpha = 0.45;
        } else {
          r = 0.1;
          g = 0.46;
          b = 0.28;
          tintHex = 0x34d399;
          tintAlpha = 0.5;
        }
      } else {
        const pulse = 0.52 + 0.36 * Math.sin(nowSec * 6.2);
        r = 0.52 * pulse;
        g = 0.12 * pulse;
        b = 0.85 * pulse;
        tintHex = 0xd946ef;
        tintAlpha = 0.58 + 0.18 * Math.sin(nowSec * 6.2);
      }
    } else if (activeBeaconStructureId === id && nowSec < beaconExpireTime) {
      const pulse = 0.35 + 0.3 * Math.sin(nowSec * 9.0);
      r = 0.95 * pulse;
      g = 0.72 * pulse;
      b = 0.1 * pulse;
      tintHex = 0xfbbf24;
      tintAlpha = 0.4;
    } else if (appState.mode === 'explore' && appState.pinnedId === id) {
      r = 0.24;
      g = 0.18;
      b = 0.04;
      tintHex = 0xfbbf24;
      tintAlpha = 0.32;
    } else if (appState.hoveredId === id && appState.mode !== 'recall') {
      r = 0.08;
      g = 0.24;
      b = 0.34;
      tintHex = 0x38bdf8;
      tintAlpha = 0.34;
    } else if (lessonFocusSet && lessonFocusSet.has(id)) {
      const pulse = 0.12 + 0.07 * Math.sin(nowSec * 4.2);
      r = 0.12 * pulse * 4;
      g = 0.38 * pulse * 3;
      b = 0.32 * pulse * 3;
    }

    // Do not overwrite loud-sound muscle/tendon reflex glow unless hovered/flashed/spotlighted
    if (
      appState.soundMode === 'loud' &&
      (id === 'tensor_tympani_muscle' || id === 'stapedius_muscle' || id === 'stapedius_tendon') &&
      r === 0 &&
      g === 0 &&
      b === 0
    ) {
      return;
    }

    entry.meshes.forEach((m) => {
      if (!m.material) return;
      if (m.material.emissive) {
        m.material.emissive.setRGB(r, g, b);
      }
      if (m.material.color && m.material.userData?.baseColorHex !== undefined) {
        _baseCol.setHex(m.material.userData.baseColorHex);
        if (tintHex !== null) {
          _tintCol.setHex(tintHex);
          m.material.color.copy(_baseCol).lerp(_tintCol, tintAlpha);
        } else {
          m.material.color.copy(_baseCol);
        }
      }
    });
  });
}

// =========================================================================
// 7. QUIZ ENGINE & QUIZ UI BINDINGS
// =========================================================================
const quizPanel = document.getElementById('quiz-panel');
const quizDeckSelect = document.getElementById('quiz-deck-select');
const quizStyleSelect = document.getElementById('quiz-style-select');
const quizQCounter = document.getElementById('quiz-q-counter');
const quizScoreEl = document.getElementById('quiz-score');
const quizStreakEl = document.getElementById('quiz-streak');
const quizInstructionEl = document.getElementById('quiz-instruction');
const quizTargetTextEl = document.getElementById('quiz-target-text');
const quizHintBox = document.getElementById('quiz-hint-box');
const quizFeedbackBox = document.getElementById('quiz-feedback-box');

Object.entries(QUIZ_DECKS).forEach(([key, cfg]) => {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = cfg.label;
  quizDeckSelect.appendChild(opt);
});

const quizManager = new SpatialQuizManager({
  onQuestionLoaded() {
    clear3DBeacon();
    quizFeedbackBox.className = '';
    quizFeedbackBox.style.display = 'none';
  },
  onPickResult(res) {
    const nowSec = performance.now() * 0.001;
    if (res.correct) {
      clear3DBeacon();
      appState.flashFeedback = { id: res.target.id, colorHex: 0x10b981, until: nowSec + 1.8 };
      quizFeedbackBox.className = 'correct';
      quizFeedbackBox.style.display = 'block';
      quizFeedbackBox.innerHTML = `<strong>Correct!</strong> ${res.target.name} &mdash; ${res.target.clinicalPearl} <em style="color:#a7f3d0;">(Auto-advancing or press [N])</em>`;
    } else {
      appState.flashFeedback = { id: res.picked.id, colorHex: 0xf43f5e, until: nowSec + 0.9 };
      quizFeedbackBox.className = 'wrong';
      quizFeedbackBox.style.display = 'block';
      quizFeedbackBox.innerHTML = `You clicked <strong>${res.picked.shortName}</strong> (${res.picked.wall}). Keep flying &amp; try again! Need help? Press <strong>[H]</strong> for a hint or <strong>[B]</strong> for a 3D beacon.`;
    }
  },
  onBeaconRequested(target) {
    if (target.category === CATEGORIES.NEIGHBORS || INTRAMURAL_XRAY_IDS.has(target.id)) {
      if (appState.xrayMode === 0) setXrayMode(1);
    }
    trigger3DBeacon(target.id, 14.0);
  },
  onStateChange(st) {
    if (!st.active) return;
    quizQCounter.textContent = st.isFinished
      ? `Done (${st.totalQuestions}/${st.totalQuestions})`
      : `Q ${st.questionNumber}/${st.totalQuestions}`;
    quizScoreEl.textContent = `First-Try Score: ${st.score}/${st.totalCompleted}`;
    quizStreakEl.textContent = `Streak: ${st.streak}`;

    if (st.isFinished) {
      const pct = st.totalQuestions > 0 ? Math.round((st.score / st.totalQuestions) * 100) : 100;
      quizInstructionEl.textContent = 'Round Complete!';
      quizTargetTextEl.textContent = `You scored ${st.score} / ${st.totalQuestions} (${pct}%) on first attempt! Best streak: ${st.bestStreak}.`;
      quizHintBox.style.display = 'none';
      return;
    }

    if (st.target) {
      if (st.promptMode === 'name') {
        quizInstructionEl.textContent = 'Fly through the 3D world, aim your crosshair, and Left-Click:';
        quizTargetTextEl.textContent = st.target.name;
      } else {
        quizInstructionEl.textContent = 'USMLE Spatial Clue — Fly to and Left-Click the matching structure:';
        quizTargetTextEl.textContent = `“${st.target.quizClue}”`;
      }

      if (st.hintShown) {
        quizHintBox.style.display = 'block';
        quizHintBox.innerHTML = `<strong>Spatial Hint:</strong> ${st.target.quizHint} <em>(${st.target.category})</em>`;
      } else {
        quizHintBox.style.display = 'none';
      }
    }
  }
});

// =========================================================================
// 7B. GUIDED LESSON ENGINE & UI BINDINGS
// =========================================================================
const lessonPanel = document.getElementById('lesson-panel');
const lessonChaptersBar = document.getElementById('lesson-chapters-bar');
const lessonStepBadge = document.getElementById('lesson-step-badge');
const lessonTypePill = document.getElementById('lesson-type-pill');
const lessonTitleEl = document.getElementById('lesson-title');
const lessonBodyEl = document.getElementById('lesson-body');
const lessonHookBox = document.getElementById('lesson-hook-box');
const lessonCpControls = document.getElementById('lesson-cp-controls');
const lessonCpHint = document.getElementById('lesson-cp-hint');
const lessonCpFeedback = document.getElementById('lesson-cp-feedback');
const btnLessonPrev = document.getElementById('btn-lesson-prev');
const btnLessonNext = document.getElementById('btn-lesson-next');

const lessonManager = new GuidedLessonManager({
  onStepLoaded(step) {
    clear3DBeacon();
    // Apply choreographed 3D scene settings for this lesson step!
    if (step.sceneState) {
      if (step.sceneState.xrayMode !== undefined) setXrayMode(step.sceneState.xrayMode);
      if (step.sceneState.ossicleMode !== undefined) setOssicleMode(step.sceneState.ossicleMode);
      if (step.sceneState.doorOpen !== undefined) setDoorOpen(step.sceneState.doorOpen);
      if (step.sceneState.soundMode !== undefined) setSoundMode(step.sceneState.soundMode);
    }
    if (step.camera) {
      const sx = appState.earSide === 'right' ? 1 : -1;
      const camCfg = step.camera(sx);
      setNoclip(Boolean(camCfg.noclip));
      controls.lookAtPoint(
        new THREE.Vector3(...camCfg.pos),
        new THREE.Vector3(...camCfg.lookAt),
        false
      );
    }
  },
  onCheckpointResult(res) {
    const nowSec = performance.now() * 0.001;
    if (res.correct) {
      clear3DBeacon();
      appState.flashFeedback = { id: res.targetId, colorHex: 0x10b981, until: nowSec + 2.0 };
    } else {
      appState.flashFeedback = { id: res.picked.id, colorHex: 0xf43f5e, until: nowSec + 0.9 };
    }
  },
  onBeaconRequested(targetId) {
    const data = ANATOMY_DATA[targetId];
    if (data && (data.category === CATEGORIES.NEIGHBORS || targetId === 'facial_nerve_cn7')) {
      if (appState.xrayMode === 0) setXrayMode(1);
    }
    trigger3DBeacon(targetId, 14.0);
  },
  onStateChange(st) {
    if (!st.active) return;

    // Render chapter pills
    lessonChaptersBar.innerHTML = '';
    st.chapters.forEach((ch) => {
      const btn = document.createElement('button');
      btn.className = `chapter-pill${ch.isCurrent ? ' current' : ''}${ch.isComplete ? ' done' : ''}`;
      btn.textContent = `${ch.isComplete ? '✓ ' : ''}${ch.shortTitle}`;
      btn.title = ch.title;
      btn.addEventListener('click', () => lessonManager.goToChapter(ch.id));
      lessonChaptersBar.appendChild(btn);
    });

    const isCp = st.step.type === 'checkpoint';
    lessonPanel.classList.toggle('is-checkpoint', isCp);
    lessonStepBadge.textContent = `Chapter ${st.chapter.number} of ${st.chapters.length} · Step ${st.stepIndex + 1} / ${st.totalSteps}`;

    if (isCp) {
      lessonTypePill.textContent = st.checkpointSolved ? '✓ Checkpoint Solved' : 'Active-Recall 3D Pick';
      lessonTypePill.classList.add('checkpoint');
      lessonTitleEl.textContent = st.step.title;
      lessonBodyEl.textContent = st.step.prompt;
      lessonHookBox.style.display = 'none';
      lessonCpControls.style.display = st.checkpointSolved ? 'none' : 'flex';

      if (st.checkpointHintShown) {
        lessonCpHint.style.display = 'block';
        lessonCpHint.innerHTML = `<strong>Spatial Hint:</strong> ${st.step.hint}`;
      } else {
        lessonCpHint.style.display = 'none';
      }

      if (st.lastAttemptFeedback) {
        lessonCpFeedback.className = st.lastAttemptFeedback.correct ? 'ok' : 'err';
        lessonCpFeedback.style.display = 'block';
        lessonCpFeedback.innerHTML = st.lastAttemptFeedback.correct
          ? `<strong>✓ Checkpoint Mastered!</strong> ${st.lastAttemptFeedback.message}`
          : st.lastAttemptFeedback.message;
      } else {
        lessonCpFeedback.style.display = 'none';
      }
    } else {
      lessonTypePill.textContent = '3D Guided Tour';
      lessonTypePill.classList.remove('checkpoint');
      lessonTitleEl.textContent = st.step.title;
      lessonBodyEl.textContent = st.step.body;
      lessonHookBox.style.display = 'block';
      lessonHookBox.innerHTML = `<strong>Memory Hook:</strong> ${st.step.memoryHook}`;
      lessonCpControls.style.display = 'none';
      lessonCpHint.style.display = 'none';
      lessonCpFeedback.style.display = 'none';
    }

    btnLessonPrev.disabled = st.isFirst;
    btnLessonPrev.style.opacity = st.isFirst ? '0.45' : '1';
    btnLessonNext.innerHTML = st.isLast
      ? `<span>Start Quiz &rarr;</span><span class="kbd">]</span>`
      : `<span>Next Step &rarr;</span><span class="kbd">]</span>`;
    refreshCrosshairTag(appState.hoveredId);
  }
});

// =========================================================================
// 7C. HARD FREE-RECALL QUIZ ENGINE ("SPOTLIGHT & TYPE" / MCQ) & UI BINDINGS
// =========================================================================
const recallPanel = document.getElementById('recall-panel');
const recallDeckSelect = document.getElementById('recall-deck-select');
const recallFormatSelect = document.getElementById('recall-format-select');
const recallQCounter = document.getElementById('recall-q-counter');
const recallScoreEl = document.getElementById('recall-score');
const recallStreakEl = document.getElementById('recall-streak');
const recallInstructionEl = document.getElementById('recall-instruction');
const recallSubpromptEl = document.getElementById('recall-subprompt');
const recallTypedRow = document.getElementById('recall-typed-row');
const recallInputEl = document.getElementById('recall-input');
const recallSubmitBtn = document.getElementById('btn-recall-submit');
const recallMcqGrid = document.getElementById('recall-mcq-grid');
const recallHintBox = document.getElementById('recall-hint-box');
const recallFeedbackBox = document.getElementById('recall-feedback-box');
const recallNextBtn = document.getElementById('btn-recall-next');
const recallRevealBtn = document.getElementById('btn-recall-reveal');
const recallHintBtn = document.getElementById('btn-recall-hint');

Object.entries(QUIZ_DECKS).forEach(([key, cfg]) => {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = cfg.label;
  recallDeckSelect.appendChild(opt);
});

const recallMissedOpt = document.createElement('option');
recallMissedOpt.value = 'missed';
recallMissedOpt.textContent = 'Review Missed Structures (0)';
recallMissedOpt.disabled = true;
recallDeckSelect.appendChild(recallMissedOpt);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const recallManager = new RecallQuizManager({
  onQuestionLoaded(target) {
    clear3DBeacon();
    flyToStructure(target.id, { forRecall: true, noBeacon: true });
    recallInputEl.value = '';
    refreshCrosshairTag(appState.hoveredId);
    if (!controls.isLocked && recallManager.answerFormat === 'typed') {
      requestAnimationFrame(() => recallInputEl.focus());
    }
  },
  onAnswerEvaluated(res) {
    const nowSec = performance.now() * 0.001;
    if (res.status === 'correct') {
      appState.flashFeedback = { id: res.target.id, colorHex: 0x10b981, until: nowSec + 1.4 };
    } else if (res.status === 'wrong') {
      if (res.matchedOther) {
        appState.flashFeedback = { id: res.matchedOther.id, colorHex: 0xf43f5e, until: nowSec + 1.1 };
      }
    }
    refreshCrosshairTag(appState.hoveredId);
  },
  onStateChange(st) {
    if (!st.active) {
      spotlightGroup.visible = false;
      return;
    }

    recallMissedOpt.disabled = st.missedCount === 0;
    recallMissedOpt.textContent = `Review Missed This Session (${st.missedCount})`;

    recallQCounter.textContent = st.isFinished
      ? `Done (${st.totalQuestions}/${st.totalQuestions})`
      : `Q ${st.questionNumber}/${st.totalQuestions}`;
    recallScoreEl.textContent = `First-Try: ${st.score}/${st.totalCompleted}`;
    recallStreakEl.textContent = `Streak: ${st.streak}`;

    if (st.isFinished) {
      spotlightGroup.visible = false;
      const pct = st.totalQuestions > 0 ? Math.round((st.score / st.totalQuestions) * 100) : 100;
      recallInstructionEl.textContent = 'Hard Recall Round Complete!';
      recallSubpromptEl.innerHTML = `You recalled <strong>${st.score} / ${st.totalQuestions} (${pct}%)</strong> on your first attempt! Best streak: <strong>${st.bestStreak}</strong>.${st.missedCount > 0 ? ` Switch deck to <strong>Review Missed (${st.missedCount})</strong> or start a New Round!` : ''}`;
      recallTypedRow.style.display = 'none';
      recallMcqGrid.style.display = 'none';
      recallHintBox.style.display = 'none';
      recallFeedbackBox.style.display = 'none';
      recallNextBtn.innerHTML = `<span>New Round &crarr;</span>`;
      return;
    }

    const isTyped = st.answerFormat === 'typed';
    recallTypedRow.style.display = isTyped ? 'flex' : 'none';
    recallMcqGrid.style.display = isTyped ? 'none' : 'grid';

    if (st.target) {
      const catHint = st.target.tier === 3 && st.target.parentName
        ? `Specific Part / Landmark (${st.target.category})`
        : st.target.category;
      recallInstructionEl.textContent = st.answeredCurrent
        ? `Identified: ${st.target.name}`
        : `Spotlighted 3D Structure — ${catHint}`;
      recallSubpromptEl.innerHTML = isTyped
        ? `Type the structure or sub-part name below. Click 3D view anytime to fly with <strong>WASD</strong>, then press <span class="kbd">Enter</span> or <span class="kbd">/</span> to type:`
        : `Choose the matching anatomical structure (or press <span class="kbd">1</span>&ndash;<span class="kbd">4</span>):`;
    }

    recallSubmitBtn.textContent = st.answeredCurrent ? 'Next →' : 'Submit ↵';
    recallNextBtn.innerHTML = st.answeredCurrent
      ? `<span>Next Question &rarr;</span><span class="kbd">N</span>`
      : `<span>Skip / Next &rarr;</span><span class="kbd">N</span>`;
    recallRevealBtn.disabled = st.answeredCurrent;
    recallRevealBtn.style.opacity = st.answeredCurrent ? '0.45' : '1';
    recallHintBtn.disabled = st.answeredCurrent || st.hintLevel >= 2;
    recallHintBtn.style.opacity = st.answeredCurrent || st.hintLevel >= 2 ? '0.45' : '1';

    // Render Multiple Choice options if in MCQ format
    if (!isTyped && st.target) {
      recallMcqGrid.innerHTML = '';
      st.mcqOptions.forEach((optStruct, idx) => {
        const btn = document.createElement('button');
        btn.className = 'recall-mcq-btn';
        if (st.answeredCurrent && optStruct.id === st.target.id) {
          btn.classList.add('is-correct');
        } else if (
          st.lastResult &&
          st.lastResult.status === 'wrong' &&
          st.lastResult.matchedOther &&
          st.lastResult.matchedOther.id === optStruct.id
        ) {
          btn.classList.add('is-wrong');
        }
        btn.disabled = st.answeredCurrent;
        btn.innerHTML = `<span class="kbd">${idx + 1}</span><span>${escapeHtml(optStruct.name)}</span>`;
        btn.addEventListener('click', () => recallManager.submitMcqChoice(optStruct.id));
        recallMcqGrid.appendChild(btn);
      });
    }

    // Progressive 2-stage hints (Stage 1 = USMLE Functional/Spatial Clue; Stage 2 = Masked First-Letter Pattern)
    if (st.target && st.hintLevel > 0) {
      recallHintBox.style.display = 'block';
      let html = `<div><strong>Clue:</strong> ${escapeHtml(st.target.quizClue)}</div>`;
      if (st.hintLevel >= 2) {
        html += `<div style="margin-top:4px;"><strong>First Letters:</strong> <span class="masked-letters-code">${escapeHtml(st.maskedLetters)}</span></div>`;
      }
      recallHintBox.innerHTML = html;
    } else {
      recallHintBox.style.display = 'none';
    }

    // Render Rich Feedback Box
    if (st.lastResult) {
      const lr = st.lastResult;
      if (lr.status === 'correct') {
        recallFeedbackBox.className = 'correct';
        recallFeedbackBox.style.display = 'block';
        const matchNote = !lr.exact && lr.userText ? ` <em>(matched “${escapeHtml(lr.userText)}”)</em>` : '';
        recallFeedbackBox.innerHTML = `<strong>✓ Correct!</strong> <strong>${escapeHtml(lr.target.name)}</strong>${matchNote} &mdash; ${escapeHtml(lr.target.clinicalPearl)} <em style="color:#a7f3d0;">(Press Enter or [N] for next)</em>`;
      } else if (lr.status === 'almost') {
        recallFeedbackBox.className = 'almost';
        recallFeedbackBox.style.display = 'block';
        recallFeedbackBox.innerHTML = `<strong>Almost — Be More Specific!</strong> ${escapeHtml(lr.message)} <em>(No penalty — type just the specific part!)</em>`;
      } else if (lr.status === 'revealed') {
        recallFeedbackBox.className = 'revealed';
        recallFeedbackBox.style.display = 'block';
        recallFeedbackBox.innerHTML = `<strong>Answer: ${escapeHtml(lr.target.name)}</strong> <span style="color:#bae6fd;">(${escapeHtml(lr.target.aka)})</span><br/>${escapeHtml(lr.target.clinicalPearl)}`;
      } else if (lr.status === 'wrong') {
        recallFeedbackBox.className = 'wrong';
        recallFeedbackBox.style.display = 'block';
        const contrast = lr.matchedOther
          ? `That matches <strong>${escapeHtml(lr.matchedOther.shortName)}</strong> (${escapeHtml(lr.matchedOther.wall)}). `
          : '';
        recallFeedbackBox.innerHTML = `<strong>Not quite.</strong> ${contrast}Try again, fly around it in 3D, press <strong>[H]</strong> for a clue/letters, or click <strong>Reveal</strong>.`;
      }
    } else {
      recallFeedbackBox.className = '';
      recallFeedbackBox.style.display = 'none';
    }
  }
});

function setAppMode(mode) {
  const prevMode = appState.mode;
  appState.mode = mode;
  const isExplore = mode === 'explore';
  const isLesson = mode === 'lesson';
  const isQuiz = mode === 'quiz';
  const isRecall = mode === 'recall';

  document.getElementById('btn-mode-explore').classList.toggle('active', isExplore);
  document.getElementById('btn-mode-lesson').classList.toggle('active', isLesson);
  document.getElementById('btn-mode-quiz').classList.toggle('active', isQuiz);
  document.getElementById('btn-mode-recall').classList.toggle('active', isRecall);

  inspectorCard.style.display = isExplore ? 'block' : 'none';
  lessonPanel.classList.toggle('visible', isLesson);
  quizPanel.classList.toggle('visible', isQuiz);
  recallPanel.classList.toggle('visible', isRecall);
  flightStatusPill.style.display = isQuiz || isRecall ? 'none' : 'block';

  // Restore clean neutral ossicles/sound if leaving Guided Lesson or Recall mode
  if (prevMode === 'lesson' && !isLesson) {
    lessonManager.stop();
    if (appState.ossicleMode !== 0) setOssicleMode(0);
    if (appState.soundMode !== 'off') setSoundMode('off');
  }
  if (prevMode === 'recall' && !isRecall) {
    recallManager.stop();
    spotlightGroup.visible = false;
    if (appState.ossicleMode !== 0) setOssicleMode(0);
  }

  if (isLesson) {
    appState.pinnedId = null;
    quizManager.stop();
    recallManager.stop();
    setDrawerOpen(false);
    lessonManager.start(lessonManager.stepIndex);
  } else if (isQuiz) {
    appState.pinnedId = null;
    recallManager.stop();
    ensureAllWallsVisible();
    setDrawerOpen(false);
    quizManager.start({
      deckKey: quizDeckSelect.value,
      promptStyle: quizStyleSelect.value
    });
  } else if (isRecall) {
    appState.pinnedId = null;
    quizManager.stop();
    setDrawerOpen(false);
    if (controls.isLocked && recallFormatSelect.value === 'typed') {
      document.exitPointerLock();
    }
    recallManager.start({
      deckKey: recallDeckSelect.value,
      answerFormat: recallFormatSelect.value
    });
  } else {
    quizManager.stop();
    recallManager.stop();
    clear3DBeacon();
  }
  refreshCrosshairTag(appState.hoveredId);
}

// =========================================================================
// 8. TOP BAR, STUDY DIRECTORY & HOTKEY CONTROLLERS
// =========================================================================
function setEarSide(side) {
  if (appState.earSide === side) return;
  appState.earSide = side;
  controls.earSide = side;
  rebuildDiorama(side);

  // Mirror camera X and yaw cleanly so user keeps looking at the exact same anatomical landmark!
  camera.position.x = -camera.position.x;
  controls.yaw = -controls.yaw;
  controls.setPose(camera.position.clone(), controls.yaw, controls.pitch, true);

  document.getElementById('lbl-ear-side').textContent = side === 'right' ? 'Right' : 'Left';
}

function setPalette(palette) {
  appState.palette = palette;
  diorama.setPalette(palette);
  const btn = document.getElementById('btn-palette');
  document.getElementById('lbl-palette').textContent = palette === 'box' ? 'Color Box' : 'Bone/Tissue';
  btn.classList.toggle('active-state', palette === 'box');
}

function setXrayMode(modeInt) {
  appState.xrayMode = modeInt % 3;
  diorama.setXrayMode(appState.xrayMode);
  const names = ['Solid', 'X-Ray (38%)', 'Ghost (14%)'];
  document.getElementById('lbl-xray').textContent = names[appState.xrayMode];
  document.getElementById('btn-xray').classList.toggle('active-state', appState.xrayMode > 0);
}

function setDoorOpen(isOpen) {
  appState.doorOpen = isOpen;
  controls.doorOpen = isOpen;
  diorama.setDoorOpen(isOpen);
  document.getElementById('lbl-door').textContent = isOpen ? 'Open' : 'Closed';
  document.getElementById('btn-door').classList.toggle('active-state', isOpen);
}

function setOssicleMode(modeInt) {
  appState.ossicleMode = modeInt % 3;
  diorama.setOssicleMode(appState.ossicleMode);
  const names = ['Full', 'Ghosted', 'Hidden'];
  document.getElementById('lbl-ossicles').textContent = names[appState.ossicleMode];
  document.getElementById('btn-ossicles').classList.toggle('active-state', appState.ossicleMode > 0);
}

function setLabelMode(modeInt) {
  appState.labelMode = modeInt % 5;
  const names = ['Key', 'Major', `All (${STRUCTURE_LIST.length})`, 'Walls Only', 'Off'];
  document.getElementById('lbl-labels').textContent = names[appState.labelMode];
  document.getElementById('btn-labels').classList.toggle('active-state', appState.labelMode !== 4);
}

function setSoundMode(modeStr) {
  appState.soundMode = modeStr;
  const names = { off: 'Off', normal: 'Normal Wave', loud: 'Loud (Reflex!)' };
  document.getElementById('lbl-sound').textContent = names[modeStr];
  document.getElementById('btn-sound').classList.toggle('active-state', modeStr !== 'off');
}

function setNoclip(enabled) {
  controls.noclip = enabled;
  document.getElementById('lbl-noclip').textContent = enabled ? 'On' : 'Off';
  document.getElementById('btn-noclip').classList.toggle('active-state', enabled);
}

function setDrawerOpen(open) {
  appState.drawerOpen = open;
  document.getElementById('study-drawer').classList.toggle('collapsed', !open);
  document.getElementById('btn-drawer').classList.toggle('active-state', open);
}

// Build Right Drawer Searchable Study Directory
const structureListEl = document.getElementById('structure-list');
const searchInputEl = document.getElementById('structure-search');
searchInputEl.placeholder = `Search ${STRUCTURE_LIST.length} structures & sub-parts (e.g. neck, tendon, umbo)...`;

function renderStructureDirectory(query = '') {
  const q = query.trim().toLowerCase();
  structureListEl.innerHTML = '';

  Object.values(CATEGORIES).forEach((catName) => {
    const items = STRUCTURE_LIST.filter(
      (s) =>
        s.category === catName &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.aka.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          (s.parentName && s.parentName.toLowerCase().includes(q)) ||
          (s.aliases && s.aliases.some((al) => al.toLowerCase().includes(q))))
    );
    if (items.length === 0) return;

    const heading = document.createElement('div');
    heading.className = 'cat-heading';
    heading.textContent = `${catName} (${items.length})`;
    structureListEl.appendChild(heading);

    items.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'struct-item';
      row.dataset.id = s.id;
      const dotHex = `#${s.boxColor.toString(16).padStart(6, '0')}`;
      row.innerHTML = `
        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${dotHex};margin-right:6px;"></span>${s.shortName}
        </span>
        <button class="fly-btn" title="Glide camera right to ${s.shortName}">Fly To</button>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.classList.contains('fly-btn')) {
          flyToStructure(s.id);
        } else {
          trigger3DBeacon(s.id, 5.0);
        }
        if (appState.mode === 'explore') {
          appState.pinnedId = s.id;
          renderInspector(s.id, true);
        }
      });

      structureListEl.appendChild(row);
    });
  });
}

renderStructureDirectory();
searchInputEl.addEventListener('input', () => renderStructureDirectory(searchInputEl.value));

// Wire Top Bar Buttons
document.getElementById('btn-mode-explore').addEventListener('click', () => setAppMode('explore'));
document.getElementById('btn-mode-lesson').addEventListener('click', () => setAppMode('lesson'));
document.getElementById('btn-mode-quiz').addEventListener('click', () => setAppMode('quiz'));
document.getElementById('btn-mode-recall').addEventListener('click', () => setAppMode('recall'));
document.getElementById('btn-ear-side').addEventListener('click', () =>
  setEarSide(appState.earSide === 'right' ? 'left' : 'right')
);
document.getElementById('btn-palette').addEventListener('click', () =>
  setPalette(appState.palette === 'box' ? 'tissue' : 'box')
);
document.getElementById('btn-xray').addEventListener('click', () => setXrayMode(appState.xrayMode + 1));
document.getElementById('btn-door').addEventListener('click', () => setDoorOpen(!appState.doorOpen));
document.getElementById('btn-ossicles').addEventListener('click', () =>
  setOssicleMode(appState.ossicleMode + 1)
);
document.getElementById('btn-labels').addEventListener('click', () => setLabelMode(appState.labelMode + 1));
document.getElementById('btn-sound').addEventListener('click', () => {
  const order = ['off', 'normal', 'loud'];
  const next = order[(order.indexOf(appState.soundMode) + 1) % order.length];
  setSoundMode(next);
});
document.getElementById('btn-noclip').addEventListener('click', () => setNoclip(!controls.noclip));
document.getElementById('btn-drawer').addEventListener('click', () => setDrawerOpen(!appState.drawerOpen));

// Individual Wall Cutaway Buttons
document.querySelectorAll('.mini-toggle[data-wall]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const w = btn.dataset.wall;
    appState.wallVisibility[w] = !appState.wallVisibility[w];
    btn.classList.toggle('on', appState.wallVisibility[w]);
    if (diorama.wallGroups[w]) {
      diorama.wallGroups[w].visible = appState.wallVisibility[w];
    }
  });
});

document.getElementById('btn-reset-walls').addEventListener('click', () => {
  ensureAllWallsVisible();
});

// Bottom Camera Presets
document.querySelectorAll('[data-preset]').forEach((btn) => {
  btn.addEventListener('click', () => goToPreset(Number(btn.dataset.preset)));
});

// Fly & Pick Quiz Controls
quizDeckSelect.addEventListener('change', () =>
  quizManager.start({ deckKey: quizDeckSelect.value, promptStyle: quizStyleSelect.value })
);
quizStyleSelect.addEventListener('change', () =>
  quizManager.start({ deckKey: quizDeckSelect.value, promptStyle: quizStyleSelect.value })
);
document.getElementById('btn-quiz-restart').addEventListener('click', () =>
  quizManager.start({ deckKey: quizDeckSelect.value, promptStyle: quizStyleSelect.value })
);
document.getElementById('btn-quiz-hint').addEventListener('click', () => quizManager.requestHint());
document.getElementById('btn-quiz-beacon').addEventListener('click', () => quizManager.requestBeacon());
document.getElementById('btn-quiz-next').addEventListener('click', () => quizManager.nextQuestion());

// Type-It Hard Recall Quiz Controls
function handleRecallPrimaryAction() {
  const st = recallManager.getState();
  if (st.isFinished) {
    recallManager.start({ deckKey: recallDeckSelect.value, answerFormat: recallFormatSelect.value });
    return;
  }
  if (recallManager.answeredCurrent) {
    recallManager.nextQuestion();
    return;
  }
  recallManager.submitTypedAnswer(recallInputEl.value);
}

recallDeckSelect.addEventListener('change', () =>
  recallManager.start({ deckKey: recallDeckSelect.value, answerFormat: recallFormatSelect.value })
);
recallFormatSelect.addEventListener('change', () => {
  recallManager.setAnswerFormat(recallFormatSelect.value);
  if (recallFormatSelect.value === 'typed' && !controls.isLocked) {
    recallInputEl.focus();
  }
});
document.getElementById('btn-recall-restart').addEventListener('click', () =>
  recallManager.start({ deckKey: recallDeckSelect.value, answerFormat: recallFormatSelect.value })
);
recallSubmitBtn.addEventListener('click', handleRecallPrimaryAction);
recallInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    handleRecallPrimaryAction();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    recallInputEl.blur();
  }
});
recallHintBtn.addEventListener('click', () => {
  recallManager.requestHint();
  if (recallManager.answerFormat === 'typed' && !controls.isLocked) recallInputEl.focus();
});
document.getElementById('btn-recall-recenter').addEventListener('click', () => {
  recallManager.recenterTarget();
  if (recallManager.answerFormat === 'typed' && !controls.isLocked) recallInputEl.focus();
});
recallRevealBtn.addEventListener('click', () => {
  recallManager.revealAnswer();
  if (recallManager.answerFormat === 'typed' && !controls.isLocked) recallInputEl.focus();
});
recallNextBtn.addEventListener('click', () => {
  if (recallManager.getState().isFinished) {
    recallManager.start({ deckKey: recallDeckSelect.value, answerFormat: recallFormatSelect.value });
  } else {
    recallManager.nextQuestion();
  }
});

// Guided Lesson Controls
document.getElementById('btn-lesson-prev').addEventListener('click', () => lessonManager.prevStep());
document.getElementById('btn-lesson-recenter').addEventListener('click', () => lessonManager.recenter());
document.getElementById('btn-lesson-next').addEventListener('click', () => {
  if (lessonManager.getState().isLast) {
    setAppMode('quiz');
  } else {
    lessonManager.nextStep();
  }
});
document.getElementById('btn-lesson-hint').addEventListener('click', () =>
  lessonManager.showCheckpointHint()
);
document.getElementById('btn-lesson-beacon').addEventListener('click', () =>
  lessonManager.showCheckpointBeacon()
);

// Canvas Click: Lock Pointer, or Interact via Crosshair while Already Locked!
renderer.domElement.addEventListener('mousedown', (e) => {
  if (!controls.isLocked) {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    controls.requestLock();
    return;
  }

  // Right-click while locked unpins structure in Explore Mode
  if (e.button === 2) {
    appState.pinnedId = null;
    if (appState.hoveredId) renderInspector(appState.hoveredId, false);
    return;
  }

  if (e.button !== 0) return;

  if (appState.mode === 'explore') {
    if (appState.hoveredId) {
      if (appState.pinnedId === appState.hoveredId) {
        appState.pinnedId = null;
        renderInspector(appState.hoveredId, false);
      } else {
        appState.pinnedId = appState.hoveredId;
        renderInspector(appState.pinnedId, true);
      }
    } else {
      appState.pinnedId = null;
      inspectorCard.classList.remove('is-pinned');
      inspPinBadge.style.display = 'none';
    }
  } else if (appState.mode === 'lesson') {
    if (lessonManager.currentStep.type === 'checkpoint') {
      if (!lessonManager.checkpointSolved && appState.hoveredId) {
        lessonManager.submitCheckpointPick(ANATOMY_DATA[appState.hoveredId]);
      } else if (lessonManager.checkpointSolved) {
        if (lessonManager.getState().isLast) setAppMode('quiz');
        else lessonManager.nextStep();
      }
    }
  } else if (appState.mode === 'quiz') {
    if (quizManager.answeredCurrent) {
      quizManager.nextQuestion();
      return;
    }
    if (appState.hoveredId) {
      quizManager.submitPick(ANATOMY_DATA[appState.hoveredId]);
    }
  } else if (appState.mode === 'recall') {
    if (recallManager.answeredCurrent) {
      recallManager.nextQuestion();
    }
  }
});

window.addEventListener('contextmenu', (e) => {
  if (controls.isLocked) e.preventDefault();
});

// Global Keyboard Shortcuts (active both in free cursor and PointerLock flight!)
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
    return;
  }

  switch (e.code) {
    case 'Tab': {
      e.preventDefault();
      const modes = ['explore', 'lesson', 'quiz', 'recall'];
      setAppMode(modes[(modes.indexOf(appState.mode) + 1) % modes.length]);
      break;
    }
    case 'Enter':
    case 'Slash': {
      if (appState.mode === 'recall') {
        e.preventDefault();
        if (controls.isLocked) {
          document.exitPointerLock();
        }
        const st = recallManager.getState();
        if (e.code === 'Enter' && st.isFinished) {
          recallManager.start({ deckKey: recallDeckSelect.value, answerFormat: recallFormatSelect.value });
        } else if (e.code === 'Enter' && recallManager.answeredCurrent) {
          recallManager.nextQuestion();
        } else if (recallManager.answerFormat === 'typed') {
          requestAnimationFrame(() => {
            recallInputEl.focus();
            recallInputEl.select();
          });
        }
      }
      break;
    }
    case 'BracketLeft':
      if (appState.mode === 'lesson') lessonManager.prevStep();
      break;
    case 'BracketRight':
      if (appState.mode === 'lesson') {
        if (lessonManager.getState().isLast) setAppMode('quiz');
        else lessonManager.nextStep();
      }
      break;
    case 'KeyF':
      if (appState.mode === 'lesson') lessonManager.recenter();
      if (appState.mode === 'recall') recallManager.recenterTarget();
      break;
    case 'KeyR':
      setEarSide(appState.earSide === 'right' ? 'left' : 'right');
      break;
    case 'KeyC':
      setPalette(appState.palette === 'box' ? 'tissue' : 'box');
      break;
    case 'KeyX':
      setXrayMode(appState.xrayMode + 1);
      break;
    case 'KeyG':
      setDoorOpen(!appState.doorOpen);
      break;
    case 'KeyO':
      setOssicleMode(appState.ossicleMode + 1);
      break;
    case 'KeyL':
      setLabelMode(appState.labelMode + 1);
      break;
    case 'KeyP': {
      const order = ['off', 'normal', 'loud'];
      setSoundMode(order[(order.indexOf(appState.soundMode) + 1) % order.length]);
      break;
    }
    case 'KeyV':
      setNoclip(!controls.noclip);
      break;
    case 'KeyM':
      setDrawerOpen(!appState.drawerOpen);
      break;
    case 'KeyU':
      appState.pinnedId = null;
      inspectorCard.classList.remove('is-pinned');
      inspPinBadge.style.display = 'none';
      break;
    case 'KeyH':
      if (appState.mode === 'quiz') quizManager.requestHint();
      if (appState.mode === 'lesson') lessonManager.showCheckpointHint();
      if (appState.mode === 'recall') recallManager.requestHint();
      break;
    case 'KeyB':
      if (appState.mode === 'quiz') quizManager.requestBeacon();
      if (appState.mode === 'lesson') lessonManager.showCheckpointBeacon();
      if (appState.mode === 'recall') recallManager.recenterTarget();
      break;
    case 'KeyN':
      if (appState.mode === 'quiz') quizManager.nextQuestion();
      if (appState.mode === 'recall') recallManager.nextQuestion();
      if (appState.mode === 'lesson') {
        if (lessonManager.getState().isLast) setAppMode('quiz');
        else lessonManager.nextStep();
      }
      break;
    case 'Digit1':
    case 'Digit2':
    case 'Digit3':
    case 'Digit4':
    case 'Digit5':
    case 'Digit6':
    case 'Digit7': {
      const num = Number(e.code.replace('Digit', ''));
      if (
        appState.mode === 'recall' &&
        recallManager.answerFormat === 'mcq' &&
        !recallManager.answeredCurrent &&
        num >= 1 &&
        num <= 4
      ) {
        const chosen = recallManager.mcqOptions[num - 1];
        if (chosen) recallManager.submitMcqChoice(chosen.id);
      } else {
        goToPreset(num);
      }
      break;
    }
    default:
      break;
  }
});

// =========================================================================
// 9. 3D SPATIAL LABELS PROJECTION & MAIN RENDER LOOP
// =========================================================================
const _projVec = new THREE.Vector3();
const _camForward = new THREE.Vector3();

function updateFloatingLabels() {
  const isExploreLabels = appState.mode === 'explore' && appState.labelMode !== 4;
  const isLessonLabels =
    appState.mode === 'lesson' &&
    !(lessonManager.currentStep.type === 'checkpoint' && !lessonManager.checkpointSolved);
  const isRecallSolvedLabel =
    appState.mode === 'recall' &&
    recallManager.answeredCurrent &&
    Boolean(recallManager.currentTarget);
  const showAny = isExploreLabels || isLessonLabels || isRecallSolvedLabel;
  const lessonFocusSet = isLessonLabels ? new Set(lessonManager.getFocusStructureIds()) : null;
  const w = window.innerWidth;
  const h = window.innerHeight;

  diorama.registry.forEach((entry, id) => {
    const el = labelElements.get(id);
    if (!el) return;

    if (!showAny) {
      el.style.display = 'none';
      return;
    }

    if (isRecallSolvedLabel) {
      if (id !== recallManager.currentTarget.id) {
        el.style.display = 'none';
        return;
      }
    } else if (isLessonLabels) {
      // In Guided Lesson mode, show ONLY the spotlighted focus structures for this step (plus hovered)
      if (!lessonFocusSet.has(id) && appState.hoveredId !== id) {
        el.style.display = 'none';
        return;
      }
    } else {
      // Filter by Explore label density mode (0=Key, 1=Major, 2=All, 3=Walls Only, 4=Off)
      const data = entry.data;
      if (appState.labelMode === 0 && data.tier > 1 && appState.hoveredId !== id && appState.pinnedId !== id) {
        el.style.display = 'none';
        return;
      }
      if (appState.labelMode === 1 && data.tier > 2 && appState.hoveredId !== id && appState.pinnedId !== id) {
        el.style.display = 'none';
        return;
      }
      if (
        appState.labelMode === 3 &&
        data.category !== CATEGORIES.WALLS &&
        appState.hoveredId !== id &&
        appState.pinnedId !== id
      ) {
        el.style.display = 'none';
        return;
      }
      // Hide neighbor labels when walls are completely solid unless user is outside room or hovering!
      const camInsideBox =
        Math.abs(camera.position.x) < 8.1 &&
        camera.position.y > -5.1 &&
        camera.position.y < 9.1 &&
        Math.abs(camera.position.z) < 6.6;
      if (
        camInsideBox &&
        appState.xrayMode === 0 &&
        data.category === CATEGORIES.NEIGHBORS &&
        id !== 'mastoid_air_cells' &&
        !(appState.doorOpen && data.parentGroup === 'external_ear')
      ) {
        el.style.display = 'none';
        return;
      }
    }

    // Hide labels for hidden ossicles
    if (appState.ossicleMode === 2 && entry.data.isOssicle) {
      el.style.display = 'none';
      return;
    }

    _projVec.copy(entry.anchor);
    const dist = camera.position.distanceTo(_projVec);
    _projVec.project(camera);

    // Must be in front of camera near/far planes and within screen margins
    if (_projVec.z > 0.995 || _projVec.z < -0.995 || Math.abs(_projVec.x) > 0.96 || Math.abs(_projVec.y) > 0.94) {
      el.style.display = 'none';
      return;
    }

    const px = (_projVec.x * 0.5 + 0.5) * w;
    const py = (-_projVec.y * 0.5 + 0.5) * h;

    el.style.display = 'block';
    el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;

    const isLessonSpot = Boolean((lessonFocusSet && lessonFocusSet.has(id)) || isRecallSolvedLabel);
    const isFocused = appState.hoveredId === id || appState.pinnedId === id || isLessonSpot;
    const alpha = isFocused ? 1.0 : THREE.MathUtils.clamp(1.28 - dist * 0.045, 0.35, 0.92);
    el.style.opacity = alpha.toFixed(2);
    el.classList.toggle('is-hovered', appState.hoveredId === id && !isRecallSolvedLabel);
    el.classList.toggle('is-pinned', appState.pinnedId === id);
    el.classList.toggle('is-lesson-focus', isLessonSpot && appState.hoveredId !== id);
  });
}

function updateBeaconVisuals(nowSec) {
  if (!activeBeaconStructureId || nowSec >= beaconExpireTime) {
    clear3DBeacon();
    return;
  }
  const entry = diorama.registry.get(activeBeaconStructureId);
  if (!entry) {
    clear3DBeacon();
    return;
  }

  beaconGroup.visible = true;
  beaconGroup.position.copy(entry.anchor);
  beaconRingMesh.lookAt(camera.position);
  const pulse = 1.0 + 0.25 * Math.sin(nowSec * 7.5);
  beaconRingMesh.scale.setScalar(pulse);

  // Golden guide line from slightly below camera center directly to the target anchor!
  camera.getWorldDirection(_camForward);
  const startPt = camera.position
    .clone()
    .addScaledVector(_camForward, 1.4)
    .add(new THREE.Vector3(0, -0.45, 0));

  const posArr = beaconLine.geometry.attributes.position.array;
  posArr[0] = startPt.x;
  posArr[1] = startPt.y;
  posArr[2] = startPt.z;
  posArr[3] = entry.anchor.x;
  posArr[4] = entry.anchor.y;
  posArr[5] = entry.anchor.z;
  beaconLine.geometry.attributes.position.needsUpdate = true;
  beaconLine.visible = true;
}

function updateSpotlightVisuals(nowSec) {
  if (appState.mode !== 'recall' || !recallManager.currentTarget) {
    spotlightGroup.visible = false;
    return;
  }
  const entry = diorama.registry.get(recallManager.currentTarget.id);
  if (!entry) {
    spotlightGroup.visible = false;
    return;
  }

  spotlightGroup.visible = true;
  spotlightGroup.position.copy(entry.anchor);
  spotlightGroup.lookAt(camera.position);

  const tierScale = entry.data.tier === 3 ? 0.5 : entry.data.tier === 2 ? 0.72 : 0.94;
  const breath = 1.0 + 0.16 * Math.sin(nowSec * 5.8);
  spotlightOuterRing.scale.setScalar(tierScale * breath);
  spotlightInnerRing.scale.setScalar(tierScale * (1.0 - 0.12 * Math.sin(nowSec * 5.8)));

  if (recallManager.answeredCurrent) {
    spotlightOuterRing.material.color.setHex(recallManager.gaveUpCurrent ? 0x38bdf8 : 0x34d399);
    spotlightInnerRing.material.color.setHex(0xa7f3d0);
  } else {
    spotlightOuterRing.material.color.setHex(0xe879f9);
    spotlightInnerRing.material.color.setHex(0x38bdf8);
  }
}

let prevTime = performance.now();

function animate(nowMs) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (nowMs - prevTime) * 0.001);
  prevTime = nowMs;
  const nowSec = nowMs * 0.001;

  // 1. Update Minecraft Creative Mode Flight
  controls.update(dt);

  // 2. Update 3D Anatomical Animations (door hinge, sound wave conduction & opposite-phase round window!)
  diorama.update(nowSec, dt, appState.soundMode);

  // 3. Crosshair Raycast Inspection
  const hitId = performCrosshairRaycast();
  if (hitId !== appState.hoveredId) {
    appState.hoveredId = hitId;
    crosshairEl.classList.toggle('has-target', Boolean(hitId));
    refreshCrosshairTag(hitId);

    if (hitId && appState.mode === 'explore' && !appState.pinnedId) {
      renderInspector(hitId, false);
    }
  }

  // 4. Emissive Highlights, 3D Beacon/Spotlight, Compass & Floating Spatial Labels
  updateEmissiveHighlights(nowSec);
  updateBeaconVisuals(nowSec);
  updateSpotlightVisuals(nowSec);
  compass.update(camera, appState.earSide);
  updateFloatingLabels();

  // 5. Render 3D Frame
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Expose runtime handle for diagnostics & console exploration
window.__earApp = {
  appState,
  getDiorama: () => diorama,
  controls,
  quizManager,
  lessonManager,
  recallManager,
  flyToStructure
};

// Optional URL query params for quick deep-linking / testing (?preset=6&xray=1&side=left&mode=recall)
{
  const params = new URLSearchParams(window.location.search);
  if (params.get('side') === 'left') setEarSide('left');
  if (params.has('palette')) setPalette(params.get('palette') === 'tissue' ? 'tissue' : 'box');
  if (params.has('xray')) setXrayMode(Number(params.get('xray')));
  if (params.has('ossicles')) setOssicleMode(Number(params.get('ossicles')));
  if (params.has('labels')) setLabelMode(Number(params.get('labels')));
  if (params.get('door') === '1') setDoorOpen(true);
  if (params.has('preset')) {
    goToPreset(Number(params.get('preset')));
    if (controls.glide) {
      controls.setPose(controls.glide.endPos, controls.glide.endYaw, controls.glide.endPitch, true);
    }
  }
  if (params.get('mode') === 'quiz') setAppMode('quiz');
  if (params.get('mode') === 'lesson') {
    setAppMode('lesson');
    if (params.has('step')) lessonManager.goToStep(Number(params.get('step')));
    if (controls.glide) {
      controls.setPose(controls.glide.endPos, controls.glide.endYaw, controls.glide.endPitch, true);
    }
  }
  if (params.get('mode') === 'recall') {
    if (params.has('deck') && QUIZ_DECKS[params.get('deck')]) {
      recallDeckSelect.value = params.get('deck');
    }
    if (params.get('format') === 'mcq' || params.get('format') === 'typed') {
      recallFormatSelect.value = params.get('format');
    }
    setAppMode('recall');
    if (params.has('target') && ANATOMY_DATA[params.get('target')]) {
      recallManager.start({
        deckKey: recallDeckSelect.value,
        answerFormat: recallFormatSelect.value,
        customPool: [ANATOMY_DATA[params.get('target')]]
      });
    }
    if (controls.glide) {
      controls.setPose(controls.glide.endPos, controls.glide.endYaw, controls.glide.endPitch, true);
    }
  }
  if (params.has('fly') && ANATOMY_DATA[params.get('fly')]) {
    flyToStructure(params.get('fly'), { instant: true });
    if (appState.mode === 'explore') {
      appState.pinnedId = params.get('fly');
      renderInspector(params.get('fly'), true);
    }
  }
}

requestAnimationFrame(animate);
