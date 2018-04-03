/**
 * Returns the intersection between two line segments a and b.
 *
 * @param {Point} l1s
 * @param {Point} l1e
 * @param {Point} l2s
 * @param {Point} l2e
 *
 * @return {Point}
 */
export default function lineIntersect(l1s, l1e, l2s, l2e) {
  // if the lines intersect, the result contains the x and y of the
  // intersection (treating the lines as infinite) and booleans for
  // whether line segment 1 or line segment 2 contain the point
  var denominator, a, b, c, numerator;

  denominator = ((l2e.y - l2s.y) * (l1e.x - l1s.x)) - ((l2e.x - l2s.x) * (l1e.y - l1s.y));

  if (denominator == 0) {
    return null;
  }

  a = l1s.y - l2s.y;
  b = l1s.x - l2s.x;
  numerator = ((l2e.x - l2s.x) * a) - ((l2e.y - l2s.y) * b);

  c = numerator / denominator;

  // if we cast these lines infinitely in
  // both directions, they intersect here
  return {
    x: Math.round(l1s.x + (c * (l1e.x - l1s.x))),
    y: Math.round(l1s.y + (c * (l1e.y - l1s.y)))
  };
}