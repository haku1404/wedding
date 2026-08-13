/**
 * Swipe-to-peek rotation.
 *
 * The offset produced here is ADDED to whatever pose the scroll position
 * already dictates — it never replaces it — and it eases back to zero about a
 * second after the finger lifts. No zoom, no pan.
 *
 * Gesture arbitration is delegated to the browser via `touch-action: pan-y
 * pinch-zoom` on <body> (see css/style.css). That is deliberate: the biggest
 * risk in a scroll-driven 3D page is trapping vertical scrolling, and the
 * compositor honouring pan-y is a far stronger guarantee than a hand-rolled
 * "first 10px decides the axis" heuristic running on the main thread. When the
 * browser decides a gesture is a vertical scroll it fires pointercancel, and
 * we simply let go.
 */

const DEG2RAD = Math.PI / 180;

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function createOrbit(element, { maxDegrees = 20, releaseTau = 0.25 } = {}) {
  const maxAzimuth = maxDegrees * DEG2RAD;

  let azimuth = 0;
  let pointerId = null;
  let startX = 0;
  let startAzimuth = 0;

  function onPointerDown(event) {
    if (!event.isPrimary) return;
    // Ignore drags that begin on something interactive.
    if (event.target.closest?.('a, button, [role="button"], input, textarea, select')) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    startAzimuth = azimuth;
  }

  function onPointerMove(event) {
    if (pointerId === null || event.pointerId !== pointerId) return;

    // Self-heal a stranded drag: if the button/contact is already gone, the
    // matching pointerup never reached us (released outside the window, or
    // swallowed by the browser). Without this the offset sticks at its clamp
    // and never eases back, leaving the camera permanently rotated.
    if (event.buttons === 0) {
      pointerId = null;
      return;
    }

    // A full screen-width drag sweeps the entire allowed range.
    const travel = (event.clientX - startX) / Math.max(1, window.innerWidth);
    azimuth = clamp(startAzimuth + travel * maxAzimuth * 2, -maxAzimuth, maxAzimuth);
  }

  function release(event) {
    if (pointerId === null || (event && event.pointerId !== pointerId)) return;
    pointerId = null;
  }

  function releaseAny() {
    pointerId = null;
  }

  element.addEventListener('pointerdown', onPointerDown, { passive: true });
  element.addEventListener('pointermove', onPointerMove, { passive: true });
  element.addEventListener('pointerup', release, { passive: true });
  element.addEventListener('pointercancel', release, { passive: true });
  element.addEventListener('pointerleave', release, { passive: true });
  // Losing focus mid-drag (alt-tab, devtools) is another way pointerup escapes.
  window.addEventListener('blur', releaseAny, { passive: true });

  /** Ease the offset back to neutral once the finger is off. */
  function update(delta) {
    if (pointerId !== null || azimuth === 0) return;

    azimuth *= Math.exp(-delta / releaseTau);
    if (Math.abs(azimuth) < 1e-4) azimuth = 0;
  }

  function getAzimuth() {
    return azimuth;
  }

  function dispose() {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerup', release);
    element.removeEventListener('pointercancel', release);
    element.removeEventListener('pointerleave', release);
    window.removeEventListener('blur', releaseAny);
    pointerId = null;
    azimuth = 0;
  }

  return { update, getAzimuth, dispose };
}
