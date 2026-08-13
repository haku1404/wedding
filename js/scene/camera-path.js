import * as THREE from 'three';

/**
 * The camera's journey: a guest approaches from outside, steps through the
 * arch, and stays for the reception.
 *
 * Control points are expressed as multiples of the model's own bounding box,
 * never as absolute coordinates, so re-exporting or re-compressing the model
 * at a different scale keeps the journey sensible.
 *
 * One control point per section, in document order:
 *   0 hero        far, head-on, the whole gate framed
 *   1 event-info  closer, drifting left, looking slightly up
 *   2 love-story  passing THROUGH the arch — the emotional beat
 *   3 gallery     out the other side, gate falling behind
 *   4 schedule    swung around to a three-quarter view
 *   5 rsvp        back to head-on, close and warm
 *   6 footer      pulling away and rising, gate shrinking
 */

export const SECTION_IDS = [
  'hero',
  'event-info',
  'love-story',
  'gallery',
  'schedule',
  'rsvp',
  'site-footer'
];

/**
 * Distance at which the gate exactly fills the frame, for the camera's current
 * field of view and aspect ratio.
 *
 * Deriving this instead of hardcoding a multiple of the model size is what
 * keeps the framing sane on a tall phone: portrait has far less horizontal
 * room, so the same shot has to be taken from further back.
 */
function fillDistance(size, camera) {
  const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;

  // The bounding box subject width capped to reasonable gate proportions
  const subjectWidth = Math.min(size.x, size.y * 2.2);

  // Responsive framing aspect: on portrait mobile viewports (aspect < 1.0),
  // adapt framingAspect to match screen aspect (min 0.65) so the camera pulls back
  // appropriately and frames the complete 3D structure on mobile screens.
  const isPortrait = camera.aspect < 1.0;
  const framingAspect = isPortrait
    ? Math.max(camera.aspect, 0.65)
    : Math.max(camera.aspect, 1.4);

  const byHeight = size.y / 2 / Math.tan(halfFov);
  const byWidth = subjectWidth / 2 / (Math.tan(halfFov) * framingAspect);
  return Math.max(byHeight, byWidth);
}

function buildControlPoints(box, camera) {
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const d = fillDistance(size, camera);
  const h = size.y;

  const at = (x, y, z) => new THREE.Vector3(center.x + x, center.y + y, center.z + z);

  const isPortrait = camera.aspect < 1.0;
  // Reduce lateral X-axis offset on narrow mobile screens so the 3D gate stays framed
  const xMult = isPortrait ? 0.45 : 1.0;

  const positions = [
    at(0, h * (isPortrait ? 0.12 : 0.08), d * (isPortrait ? 1.05 : 0.80)),
    at(-d * 0.24 * xMult, -h * 0.12, d * (isPortrait ? 0.70 : 0.52)),
    at(0, h * 0.02, d * 0.04),
    at(d * 0.28 * xMult, h * 0.06, -d * 0.48),
    at(-d * 0.56 * xMult, h * 0.28, -d * 0.52),
    at(0, h * 0.02, d * (isPortrait ? 0.65 : 0.46)),
    at(0, h * 0.62, d * (isPortrait ? 1.35 : 1.15))
  ];

  const targets = [
    at(0, h * 0.06, 0),
    at(0, h * 0.24, 0),
    at(0, h * 0.10, -d * 0.40),
    at(0, h * 0.06, 0),
    at(0, h * 0.06, 0),
    at(0, h * 0.04, 0),
    at(0, 0, 0)
  ];

  return { positions, targets, center };
}

/**
 * Scroll progress is not evenly distributed across sections — they have very
 * different heights — so map each section's on-screen centre to its control
 * point. That is what keeps the arch crossing pinned to "Câu chuyện", instead
 * of drifting to wherever 33% of the page happens to fall.
 */
function readSectionAnchors() {
  const doc = document.documentElement;
  const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);

  return SECTION_IDS.map((id, index) => {
    const el = document.getElementById(id);
    if (!el) return index / (SECTION_IDS.length - 1);

    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const centre = top + rect.height / 2 - window.innerHeight / 2;

    return THREE.MathUtils.clamp(centre / scrollable, 0, 1);
  });
}

export function createCameraPath(box, camera) {
  let { positions, targets, center } = buildControlPoints(box, camera);

  let positionCurve = new THREE.CatmullRomCurve3(positions, false, 'catmullrom', 0.5);
  let targetCurve = new THREE.CatmullRomCurve3(targets, false, 'catmullrom', 0.5);

  let anchors = readSectionAnchors();

  const scratchPosition = new THREE.Vector3();
  const scratchTarget = new THREE.Vector3();

  /** Convert raw scroll progress (0..1) into curve parameter t (0..1). */
  function progressToT(progress) {
    const last = anchors.length - 1;
    const p = THREE.MathUtils.clamp(progress, 0, 1);

    if (p <= anchors[0]) return 0;
    if (p >= anchors[last]) return 1;

    for (let i = 0; i < last; i++) {
      const a = anchors[i];
      const b = anchors[i + 1];
      if (p >= a && p <= b) {
        const span = b - a;
        const frac = span > 1e-6 ? (p - a) / span : 0;
        return (i + frac) / last;
      }
    }
    return 1;
  }

  /**
   * Place the camera for a scroll position.
   * `azimuth` (radians) is the user's swipe offset, added on top of the
   * scroll-driven pose rather than replacing it.
   */
  function apply(camera, progress, azimuth = 0) {
    const t = progressToT(progress);

    positionCurve.getPoint(t, scratchPosition);
    targetCurve.getPoint(t, scratchTarget);

    if (azimuth !== 0) {
      scratchPosition.sub(center);
      scratchPosition.applyAxisAngle(THREE.Object3D.DEFAULT_UP, azimuth);
      scratchPosition.add(center);
    }

    camera.position.copy(scratchPosition);
    camera.lookAt(scratchTarget);
  }

  /**
   * Resize changes both the section geometry and the aspect ratio, so the
   * anchors and the framing distances both have to be rebuilt.
   */
  function refresh() {
    anchors = readSectionAnchors();

    ({ positions, targets, center } = buildControlPoints(box, camera));
    positionCurve = new THREE.CatmullRomCurve3(positions, false, 'catmullrom', 0.5);
    targetCurve = new THREE.CatmullRomCurve3(targets, false, 'catmullrom', 0.5);
  }

  return { apply, refresh, progressToT, center };
}
