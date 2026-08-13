import { createStage } from './scene/stage.js';
import { loadModel } from './scene/model.js';
import { createCameraPath } from './scene/camera-path.js';
import { createPetals } from './scene/petals.js';
import { createOrbit } from './scene/orbit.js';

/**
 * Orchestrator for the 3D layer.
 *
 * This module is the only thing that knows Three.js exists. It never touches
 * content DOM beyond the canvas, and js/main.js never references it, so the
 * two halves fail independently: a broken WebGL context, a corrupt model or a
 * missing Draco decoder leaves the preloader, timeline, lightbox and RSVP
 * working exactly as before.
 *
 * Scroll is sampled directly from window.scrollY inside the render loop rather
 * than through GSAP ScrollTrigger. It behaves the same as `scrub`, costs one
 * property read per frame, and keeps the 3D layer free of any dependency on
 * the CDN scripts — which is the whole point of isolating it.
 */

const MODEL_URL = 'assets/models/gate.glb';
const LOAD_TIMEOUT_MS = 10000;
const SCROLL_SMOOTHING = 0.12;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
}

function hasWebGL2() {
  try {
    const probe = document.createElement('canvas');
    return !!probe.getContext('webgl2');
  } catch {
    return false;
  }
}

/**
 * Decide whether this device should get the 3D layer at all.
 *
 * Absent APIs are never treated as a disqualifier — Safari reports neither
 * deviceMemory nor connection, and refusing 3D on every iPhone would be worse
 * than the problem being guarded against.
 */
function shouldLoad3D() {
  if (prefersReducedMotion()) return { ok: false, reason: 'reduced-motion' };
  if (!hasWebGL2()) return { ok: false, reason: 'no-webgl2' };

  const memory = navigator.deviceMemory;
  if (typeof memory === 'number' && memory < 4) return { ok: false, reason: 'low-memory' };

  const cores = navigator.hardwareConcurrency;
  if (typeof cores === 'number' && cores < 4) return { ok: false, reason: 'low-cpu' };

  const connection = navigator.connection;
  if (connection?.saveData === true) return { ok: false, reason: 'save-data' };

  // effectiveType is a rolling ESTIMATE, not a measurement: a gigabit desktop
  // reports "3g" after an idle spell, and real 4G phones report it routinely
  // under load. Excluding "3g" therefore denies the 3D layer to guests who
  // could render it comfortably. Only the genuinely hopeless tiers are barred
  // here — the 10s load timeout below is the honest safety net, because it
  // reacts to what the connection actually did rather than what it predicted.
  if (['slow-2g', '2g'].includes(connection?.effectiveType)) {
    return { ok: false, reason: 'slow-network' };
  }

  return { ok: true, reason: 'ok' };
}

function readScrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

async function boot() {
  const canvas = document.getElementById('scene');
  if (!canvas) return;

  const verdict = shouldLoad3D();
  if (!verdict.ok) {
    document.documentElement.dataset.scene3d = verdict.reason;
    return;
  }

  const isMobile = isMobileViewport();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);

  let stage = null;
  let orbit = null;

  try {
    const { root, box, materialsByName } = await loadModel(MODEL_URL, {
      isMobile,
      signal: controller.signal
    });
    window.clearTimeout(timeout);

    stage = createStage(canvas, { isMobile });
    stage.scene.add(root);

    const path = createCameraPath(box, stage.camera);
    const petals = createPetals(box, { isMobile });
    stage.scene.add(petals.mesh);

    orbit = createOrbit(window);

    let progress = readScrollProgress();
    let target = progress;

    path.apply(stage.camera, progress, 0);

    stage.addUpdater((delta) => {
      target = readScrollProgress();
      // Ease toward the true scroll position so flings feel like film, not a slideshow.
      progress += (target - progress) * Math.min(1, SCROLL_SMOOTHING + delta);

      orbit.update(delta);
      petals.update(delta);
      path.apply(stage.camera, progress, orbit.getAzimuth());
    });

    window.addEventListener('resize', path.refresh, { passive: true });
    stage.start();

    // Reveal only once there is a real frame behind the fade.
    requestAnimationFrame(() => {
      canvas.classList.add('is-ready');
      document.documentElement.dataset.scene3d = 'on';
    });

    // Handles for in-page verification (FPS probes, screenshots, ?mat=1).
    window.__scene3d = { stage, path, orbit, root, box };

    if (new URLSearchParams(window.location.search).has('mat')) {
      const { mountMaterialPanel } = await import('./scene/mat-panel.js');
      mountMaterialPanel(materialsByName);
    }
  } catch (error) {
    window.clearTimeout(timeout);
    document.documentElement.dataset.scene3d =
      error?.name === 'AbortError' ? 'timeout' : 'error';
    console.error('[scene3d]', error);

    orbit?.dispose();
    stage?.dispose();
    canvas.classList.remove('is-ready');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
