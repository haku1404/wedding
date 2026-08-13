import * as THREE from 'three';

/**
 * The GLB's materials carry meaningless authoring names (aiStandardSurface8,
 * mat0, ...), so the roles below are first guesses drawn from the geometry
 * census measured on the source model — triangle share and primitive count:
 *
 *   aiStandardSurface8   50.6%   1 primitive    one solid mass, structural
 *   standardSurface1     30.6%   13 primitives  structural
 *   aiStandardSurface7    7.9%   38 primitives  scattered detail, blossoms
 *   aiStandardSurface4    4.4%   75 primitives  many small repeats, blossoms
 *   aiStandardSurface6    2.3%   9 primitives   foliage
 *   aiStandardSurface19   1.6%   2 primitives   trim
 *   aiStandardSurface3    1.4%   22 primitives  blossoms
 *   mat0                  1.0%   3 primitives   baseColor already tan
 *   aiStandardSurface9    0.2%   1 primitive    trim
 *   aiStandardSurface18   0.0%   1 primitive    trim
 *   aiStandardSurface16   0.0%   1 primitive    trim
 *   LIGHT                 0.0%   2 primitives   emissive light source
 *
 * Open index.html?mat=1 to correct them visually and export a new table.
 */

export const ROLES = {
  structure: { color: '#FAF6F0', roughness: 0.7, metalness: 0.0 },
  metal: { color: '#C9A678', roughness: 0.25, metalness: 0.85 },
  blossom: { color: '#FFFFFF', roughness: 0.8, metalness: 0.0 },
  blossomPink: { color: '#E8C9C4', roughness: 0.8, metalness: 0.0 },
  leaf: { color: '#A8AE9C', roughness: 0.85, metalness: 0.0 },
  light: {
    color: '#FFF2E0',
    roughness: 0.4,
    metalness: 0.0,
    emissive: '#FFF2E0',
    emissiveIntensity: 1.6
  }
};

export const MATERIAL_ROLES = {
  aiStandardSurface8: 'structure',
  standardSurface1: 'structure',
  aiStandardSurface7: 'blossom',
  aiStandardSurface4: 'blossomPink',
  aiStandardSurface6: 'leaf',
  aiStandardSurface19: 'metal',
  aiStandardSurface3: 'blossom',
  mat0: 'structure',
  aiStandardSurface9: 'metal',
  aiStandardSurface18: 'metal',
  aiStandardSurface16: 'metal',
  LIGHT: 'light'
};

const DEFAULT_ROLE = 'structure';

function buildMaterial(roleName) {
  const role = ROLES[roleName] || ROLES[DEFAULT_ROLE];
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(role.color),
    roughness: role.roughness,
    metalness: role.metalness
  });

  if (role.emissive) {
    material.emissive = new THREE.Color(role.emissive);
    material.emissiveIntensity = role.emissiveIntensity ?? 1;
  }

  material.name = roleName;
  return material;
}

/**
 * Swap every material in the loaded model for a palette material.
 *
 * Returns { byName } mapping the ORIGINAL authoring name to the THREE material
 * now in use — that mapping is what lets the ?mat=1 panel label a swatch
 * "aiStandardSurface4" and recolour exactly that part of the gate.
 */
export function applyMaterials(root, { castShadow = true } = {}) {
  const byName = new Map();
  const replacedOriginals = new Set();

  root.traverse((node) => {
    if (!node.isMesh) return;

    const wasArray = Array.isArray(node.material);
    const sources = wasArray ? node.material : [node.material];

    const next = sources.map((original) => {
      const originalName = original?.name || 'unnamed';

      if (!byName.has(originalName)) {
        byName.set(originalName, buildMaterial(MATERIAL_ROLES[originalName] || DEFAULT_ROLE));
      }
      if (original) replacedOriginals.add(original);

      return byName.get(originalName);
    });

    node.material = wasArray ? next : next[0];
    node.castShadow = castShadow;
    node.receiveShadow = castShadow;
  });

  // The GLB's own materials are no longer referenced by anything in the scene.
  replacedOriginals.forEach((material) => material.dispose());

  return { byName };
}
