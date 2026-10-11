/**
 * Shared "dished" curve: the bottom arc of an ellipse (rx = 60vw, ry = --curve-r).
 * The arc starts/ends at CURVE_EDGE_FACTOR * ry below the top of the box (assuming a 100vw wide box)
 * and reaches the full ry at the horizontal centre.
 */
export const CURVE_RX_VW = 60
export const CURVE_EDGE_FACTOR = 0.553 // sqrt(1 - (50/60)^2)

export const CURVE_VARS = '[--curve-r:50px] sm:[--curve-r:100px]'

export const CURVE_CLIP = `shape(from 0 calc(var(--curve-r) * ${CURVE_EDGE_FACTOR}), arc to 100% calc(var(--curve-r) * ${CURVE_EDGE_FACTOR}) of ${CURVE_RX_VW}vw var(--curve-r) ccw small, line to 100% 100%, line to 0 100%, close)`

/**
 * Y of the arc (relative to the box top) at local x, for a box of size w x r.
 * Mirrors how the browser resolves the SVG-style arc above (centre fixed by the chord endpoints).
 */
export const getCurveY = (x: number, w: number, r: number, viewportWidth: number) => {
  const rx = (CURVE_RX_VW / 100) * viewportWidth
  const edgeY = r * CURVE_EDGE_FACTOR
  const cy = edgeY - r * Math.sqrt(Math.max(0, 1 - (w / 2 / rx) ** 2))
  return cy + r * Math.sqrt(Math.max(0, 1 - ((x - w / 2) / rx) ** 2))
}
