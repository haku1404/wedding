import * as THREE from 'three';

/**
 * Drifting petals around the gate.
 *
 * One InstancedMesh, so the whole flurry costs a single draw call. Each petal
 * falls slowly, sways sideways on its own phase, and tumbles as it goes; when
 * it drops below the gate it is recycled to the top rather than respawned.
 */

const DEFAULT_COUNT = 300;

export function createPetals(box, { count = DEFAULT_COUNT, isMobile = false } = {}) {
  const total = isMobile ? Math.round(count * 0.55) : count;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const spreadX = Math.max(size.x, size.z) * 1.5;
  const spreadZ = spreadX;
  const topY = box.max.y + size.y * 0.35;
  const bottomY = box.min.y - size.y * 0.05;
  const fallHeight = topY - bottomY;

  const petalSize = Math.max(size.x, size.y, size.z) * 0.006;
  const geometry = new THREE.PlaneGeometry(petalSize, petalSize * 1.6);

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E8C9C4'),
    roughness: 0.85,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });

  const mesh = new THREE.InstancedMesh(geometry, material, total);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;

  // Per-instance motion state, kept in flat arrays to avoid per-frame garbage.
  const px = new Float32Array(total);
  const py = new Float32Array(total);
  const pz = new Float32Array(total);
  const fallSpeed = new Float32Array(total);
  const swayAmp = new Float32Array(total);
  const swayPhase = new Float32Array(total);
  const swaySpeed = new Float32Array(total);
  const spinSpeed = new Float32Array(total);
  const spin = new Float32Array(total);

  for (let i = 0; i < total; i++) {
    px[i] = center.x + (Math.random() - 0.5) * spreadX;
    py[i] = bottomY + Math.random() * fallHeight;
    pz[i] = center.z + (Math.random() - 0.5) * spreadZ;

    fallSpeed[i] = fallHeight * (0.012 + Math.random() * 0.022);
    swayAmp[i] = petalSize * (6 + Math.random() * 14);
    swayPhase[i] = Math.random() * Math.PI * 2;
    swaySpeed[i] = 0.3 + Math.random() * 0.6;
    spinSpeed[i] = (Math.random() - 0.5) * 1.4;
    spin[i] = Math.random() * Math.PI * 2;
  }

  const dummy = new THREE.Object3D();
  let elapsed = 0;

  function update(delta) {
    elapsed += delta;

    for (let i = 0; i < total; i++) {
      py[i] -= fallSpeed[i] * delta;
      if (py[i] < bottomY) {
        py[i] = topY;
        px[i] = center.x + (Math.random() - 0.5) * spreadX;
        pz[i] = center.z + (Math.random() - 0.5) * spreadZ;
      }

      spin[i] += spinSpeed[i] * delta;

      const sway = Math.sin(elapsed * swaySpeed[i] + swayPhase[i]) * swayAmp[i];

      dummy.position.set(px[i] + sway, py[i], pz[i] + sway * 0.4);
      dummy.rotation.set(spin[i] * 0.6, spin[i], spin[i] * 0.3);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  // Seed the matrices so the first rendered frame is already populated.
  update(0);

  return { mesh, update };
}
