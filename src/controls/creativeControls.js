import * as THREE from 'three';

/**
 * Minecraft Creative Mode 3D Flight Controller
 * - PointerLock mouse look (yaw + clamped pitch, zero click-drag needed!)
 * - WASD moves strictly in the horizontal (XZ) plane relative to camera yaw
 * - Space ascends (+Y), Shift descends (-Y)
 * - Double-tap W or hold Ctrl to sprint (2.1x speed)
 * - Scroll wheel adjusts base flight speed
 * - Smart room collision (with open Aditus doorway & swung-open Lateral Door!) or full Noclip [V]
 */
export class CreativeFlightControls {
  constructor(camera, domElement, callbacks = {}) {
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks;

    this.camera.rotation.order = 'YXZ';
    this.yaw = 0;
    this.pitch = 0;

    this.velocity = new THREE.Vector3();
    this.baseSpeed = 9.5; // units/sec
    this.speedMultiplier = 1.0; // scroll wheel fine-tune (0.35 .. 2.6)
    this.mouseSensitivity = 0.0021;

    this.isLocked = false;
    this.noclip = false;
    this.isSprinting = false;
    this.lastWPressTime = 0;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      ctrlSprint: false
    };

    // Smooth camera glide for presets / "Fly To"
    this.glide = null;

    // Room context updated whenever earSide or door state changes
    this.earSide = 'right';
    this.doorOpen = false;

    this._bindEvents();
  }

  _bindEvents() {
    this._onPointerLockChange = () => {
      const locked = document.pointerLockElement === this.domElement;
      this.isLocked = locked;
      if (!locked) {
        this._clearMovementKeys();
      }
      if (this.callbacks.onLockChange) {
        this.callbacks.onLockChange(locked);
      }
    };

    this._onPointerLockError = () => {
      if (this.callbacks.onLockError) {
        this.callbacks.onLockError();
      }
    };

    this._onMouseMove = (e) => {
      if (!this.isLocked) return;
      // Cancel preset glide on deliberate look
      const mx = e.movementX || 0;
      const my = e.movementY || 0;
      // Clamp sudden browser spikes on initial lock
      if (Math.abs(mx) > 350 || Math.abs(my) > 350) return;

      this.yaw -= mx * this.mouseSensitivity;
      this.pitch -= my * this.mouseSensitivity;
      const maxPitch = Math.PI * 0.488;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
      this._applyRotation();
    };

    this._onKeyDown = (e) => {
      // Ignore typing inside search input
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          if (!this.keys.forward) {
            const now = performance.now();
            if (now - this.lastWPressTime < 280) {
              this.isSprinting = true; // Classic Minecraft double-tap W creative sprint!
            }
            this.lastWPressTime = now;
          }
          this.keys.forward = true;
          this.glide = null;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          this.glide = null;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          this.glide = null;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          this.glide = null;
          break;
        case 'Space':
          // When locked (or when focus isn't on a button), Space flies UP
          if (this.isLocked || document.activeElement === document.body) {
            e.preventDefault();
            this.keys.up = true;
            this.glide = null;
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.down = true;
          this.glide = null;
          break;
        case 'ControlLeft':
        case 'ControlRight':
          this.keys.ctrlSprint = true;
          break;
        default:
          break;
      }
    };

    this._onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          this.isSprinting = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.up = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.down = false;
          break;
        case 'ControlLeft':
        case 'ControlRight':
          this.keys.ctrlSprint = false;
          break;
        default:
          break;
      }
    };

    this._onWheel = (e) => {
      if (!this.isLocked && e.target !== this.domElement) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.12 : 0.12;
      this.speedMultiplier = Math.max(0.35, Math.min(2.6, Number((this.speedMultiplier + delta).toFixed(2))));
      if (this.callbacks.onSpeedChange) {
        this.callbacks.onSpeedChange(this.speedMultiplier);
      }
    };

    this._onBlur = () => {
      this._clearMovementKeys();
    };

    this._onFocusIn = (e) => {
      if (
        e.target &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')
      ) {
        this._clearMovementKeys();
      }
    };

    // Mobile / Tablet Touch Fallback (1-finger drag look, 2-finger pinch fly forward/back)
    let lastTouchX = 0;
    let lastTouchY = 0;
    let lastPinchDist = 0;

    this._onTouchStart = (e) => {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    this._onTouchMove = (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        this.glide = null;
        this.yaw -= dx * 0.0042;
        this.pitch = Math.max(-Math.PI * 0.488, Math.min(Math.PI * 0.488, this.pitch - dy * 0.0042));
        this._applyRotation();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = (dist - lastPinchDist) * 0.04;
        lastPinchDist = dist;
        this.glide = null;
        const dir = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
        const nextPos = this.camera.position.clone().addScaledVector(dir, delta);
        if (!this.noclip) this._applyRoomCollision(nextPos);
        this.camera.position.copy(nextPos);
      }
    };

    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('pointerlockerror', this._onPointerLockError);
    document.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('focusin', this._onFocusIn);
    this.domElement.addEventListener('wheel', this._onWheel, { passive: false });
    this.domElement.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.domElement.addEventListener('touchmove', this._onTouchMove, { passive: false });
    window.addEventListener('blur', this._onBlur);
  }

  _clearMovementKeys() {
    Object.keys(this.keys).forEach((k) => (this.keys[k] = false));
    this.isSprinting = false;
  }

  requestLock() {
    if (!this.isLocked && this.domElement.requestPointerLock) {
      this.domElement.requestPointerLock();
    }
  }

  unlock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  setPose(position, yaw, pitch, immediate = false) {
    if (immediate) {
      this.glide = null;
      this.velocity.set(0, 0, 0);
      this.camera.position.copy(position);
      this.yaw = yaw;
      this.pitch = pitch;
      this._applyRotation();
    } else {
      // Shortest angular path for yaw
      let dy = ((yaw - this.yaw + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (dy < -Math.PI) dy += Math.PI * 2;
      this.glide = {
        startPos: this.camera.position.clone(),
        endPos: position.clone(),
        startYaw: this.yaw,
        endYaw: this.yaw + dy,
        startPitch: this.pitch,
        endPitch: pitch,
        elapsed: 0,
        duration: 0.55
      };
      this.velocity.set(0, 0, 0);
    }
  }

  lookAtPoint(fromPos, targetPos, immediate = false) {
    const dir = targetPos.clone().sub(fromPos).normalize();
    const yaw = Math.atan2(-dir.x, -dir.z);
    const pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -0.99, 0.99));
    this.setPose(fromPos, yaw, pitch, immediate);
  }

  _applyRotation() {
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
  }

  update(dt) {
    // 1. Handle smooth preset camera glide
    if (this.glide) {
      this.glide.elapsed += dt;
      const t = Math.min(1, this.glide.elapsed / this.glide.duration);
      const ease = 1 - Math.pow(1 - t, 3); // Cubic ease-out
      this.camera.position.lerpVectors(this.glide.startPos, this.glide.endPos, ease);
      this.yaw = THREE.MathUtils.lerp(this.glide.startYaw, this.glide.endYaw, ease);
      this.pitch = THREE.MathUtils.lerp(this.glide.startPitch, this.glide.endPitch, ease);
      this._applyRotation();
      if (t >= 1) this.glide = null;
      return;
    }

    // 2. Minecraft Creative Horizontal Plane Basis + Vertical Space/Shift
    const forwardXZ = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const rightXZ = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const wishDir = new THREE.Vector3();
    if (this.keys.forward) wishDir.add(forwardXZ);
    if (this.keys.backward) wishDir.sub(forwardXZ);
    if (this.keys.right) wishDir.add(rightXZ);
    if (this.keys.left) wishDir.sub(rightXZ);
    if (wishDir.lengthSq() > 0) wishDir.normalize();

    let verticalWish = 0;
    if (this.keys.up) verticalWish += 1;
    if (this.keys.down) verticalWish -= 1;

    const sprintFactor = this.isSprinting || this.keys.ctrlSprint ? 2.1 : 1.0;
    const speed = this.baseSpeed * this.speedMultiplier * sprintFactor;

    const targetVel = new THREE.Vector3(
      wishDir.x * speed,
      verticalWish * speed * 0.88,
      wishDir.z * speed
    );

    // Crisp exponential damping (feels responsive yet buttery smooth like Minecraft creative flight)
    const damping = 1 - Math.exp(-13.5 * dt);
    this.velocity.lerp(targetVel, damping);

    if (this.velocity.lengthSq() < 1e-5) {
      this.velocity.set(0, 0, 0);
      return;
    }

    const nextPos = this.camera.position.clone().addScaledVector(this.velocity, dt);

    if (!this.noclip) {
      this._applyRoomCollision(nextPos);
    } else {
      // Gentle outer world skybox boundary
      nextPos.x = THREE.MathUtils.clamp(nextPos.x, -32, 32);
      nextPos.y = THREE.MathUtils.clamp(nextPos.y, -22, 26);
      nextPos.z = THREE.MathUtils.clamp(nextPos.z, -28, 30);
    }

    this.camera.position.copy(nextPos);
  }

  _applyRoomCollision(pos) {
    const sx = this.earSide === 'right' ? 1 : -1;
    const pad = 0.62;

    // Check if camera is inside or passing through the Aditus doorway into the Mastoid Antrum!
    const inAditusHeightAndDepth = pos.y > 4.65 && pos.y < 8.15 && pos.z > -2.55 && pos.z < 1.15;
    const alreadyInAntrum = sx === 1 ? this.camera.position.x < -7.5 : this.camera.position.x > 7.5;

    if (alreadyInAntrum) {
      // Inside Mastoid Antrum chamber: allow flying freely in antrum or back out through Aditus!
      if (sx === 1) {
        pos.x = Math.max(-15.6, pos.x);
        if (!inAditusHeightAndDepth) {
          pos.x = Math.min(-8.42 - pad, pos.x);
        }
      } else {
        pos.x = Math.min(15.6, pos.x);
        if (!inAditusHeightAndDepth) {
          pos.x = Math.max(8.42 + pad, pos.x);
        }
      }
      pos.y = THREE.MathUtils.clamp(pos.y, 2.3, 8.35);
      pos.z = THREE.MathUtils.clamp(pos.z, -4.1, 2.7);
      return;
    }

    // Standard Tympanic Cavity & Epitympanic Recess interior bounds
    const minX = sx === 1 && inAditusHeightAndDepth ? -15.6 : -8.0 + pad;
    const maxX = sx === -1 && inAditusHeightAndDepth ? 15.6 : 8.0 - pad;

    pos.x = THREE.MathUtils.clamp(pos.x, minX, maxX);
    pos.y = THREE.MathUtils.clamp(pos.y, -5.0 + pad, 9.0 - pad);

    // If Lateral Wall door is swung open, allow flying out laterally (+Z)!
    const maxZ = this.doorOpen ? 20.0 : 6.5 - pad;
    pos.z = THREE.MathUtils.clamp(pos.z, -6.5 + pad, maxZ);
  }
}
