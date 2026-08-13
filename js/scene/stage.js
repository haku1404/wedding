import * as THREE from 'three';

/**
 * Renderer, scene, camera, lighting, render loop and resize handling.
 *
 * Everything expensive is gated on `isMobile`, per the performance budget:
 * antialiasing and shadows are desktop-only, and device pixel ratio is capped
 * lower on phones. The loop parks itself whenever the tab is hidden.
 */

/**
 * Build a soft vertical gradient environment map without shipping an HDR file.
 * Cream sky over a warm gold floor gives the metal parts something to reflect.
 */
function createEnvironment(renderer) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, '#FFFDF8');
  gradient.addColorStop(0.5, '#F3E7D5');
  gradient.addColorStop(1, '#C9A678');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.Texture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(texture).texture;

  pmrem.dispose();
  texture.dispose();

  return envMap;
}

export function createStage(canvas, { isMobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance'
  });

  const maxDpr = isMobile ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  if (!isMobile) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  scene.environment = createEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );

  const hemisphere = new THREE.HemisphereLight(0xfff6e9, 0xc9a678, 1.15);
  scene.add(hemisphere);

  const key = new THREE.DirectionalLight(0xfff1dd, 1.9);
  key.position.set(1, 2, 1.4);
  if (!isMobile) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
  }
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe8c9c4, 0.5);
  fill.position.set(-1.4, 0.8, -1);
  scene.add(fill);

  const updaters = new Set();
  const clock = new THREE.Clock();
  let frame = null;
  let running = false;

  function renderFrame() {
    const delta = Math.min(clock.getDelta(), 0.1);
    updaters.forEach((fn) => fn(delta));
    renderer.render(scene, camera);
    frame = requestAnimationFrame(renderFrame);
  }

  function start() {
    if (running) return;
    running = true;
    clock.getDelta(); // drop time accumulated while parked
    frame = requestAnimationFrame(renderFrame);
  }

  function stop() {
    running = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(width, height);
  }

  function onVisibilityChange() {
    if (document.hidden) stop();
    else start();
  }

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  /** Register a per-frame callback. Returns an unsubscribe function. */
  function addUpdater(fn) {
    updaters.add(fn);
    return () => updaters.delete(fn);
  }

  function dispose() {
    stop();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    updaters.clear();

    scene.traverse((node) => {
      if (node.isMesh || node.isInstancedMesh) {
        node.geometry?.dispose();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => material?.dispose());
      }
    });

    scene.environment?.dispose();
    scene.clear();
    renderer.dispose();
  }

  return { renderer, scene, camera, start, stop, onResize, addUpdater, dispose };
}
