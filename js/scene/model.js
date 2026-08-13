import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { applyMaterials } from './materials.js';

/**
 * Load the Draco-compressed wedding gate and swap in the palette materials.
 *
 * The Draco decoder is served from our own js/vendor/three/draco/ rather than
 * a CDN, matching the rest of the vendored Three.js: a blocked CDN must never
 * be able to take the page down.
 */

const DRACO_PATH = 'js/vendor/three/draco/';

export async function loadModel(url, { isMobile = false, onProgress, signal } = {}) {
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  try {
    const gltf = await new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Model load aborted', 'AbortError'));
        return;
      }

      const onAbort = () => reject(new DOMException('Model load aborted', 'AbortError'));
      signal?.addEventListener('abort', onAbort, { once: true });

      loader.load(
        url,
        (result) => {
          signal?.removeEventListener('abort', onAbort);
          resolve(result);
        },
        (event) => {
          if (!onProgress || !event.lengthComputable) return;
          onProgress(event.loaded / event.total);
        },
        (error) => {
          signal?.removeEventListener('abort', onAbort);
          reject(error);
        }
      );
    });

    const root = gltf.scene;
    const { byName } = applyMaterials(root, { castShadow: !isMobile });

    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    return { root, box, size, center, materialsByName: byName };
  } finally {
    // The decoder worker pool is only needed while decoding.
    draco.dispose();
  }
}
