/**
 * Returns the length of a vector
 *
 * @param {Vector}
 * @return {Float}
 */
export function vectorLength(v) {
  return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
}


/**
 * Calculates the angle between a line a the yAxis
 *
 * @param {Array}
 * @return {Float}
 */
export function getAngle(line) {

  // return value is between 0, 180 and -180, -0
  // @janstuemmel: maybe replace return a/b with b/a
  return Math.atan((line[1].y - line[0].y) / (line[1].x - line[0].x));
}


/**
 * Rotates a vector by a given angle
 *
 * @param {Vector}
 * @param {Float} Angle in radians
 * @return {Vector}
 */
export function rotateVector(vector, angle) {
  return (!angle) ? vector : {
    x: Math.cos(angle) * vector.x - Math.sin(angle) * vector.y,
    y: Math.sin(angle) * vector.x + Math.cos(angle) * vector.y
  };
}


/**
 * Solves a 2D equation system
 * a + r*b = c, where a,b,c are 2D vectors
 *
 * @param {Vector}
 * @param {Vector}
 * @param {Vector}
 * @return {Float}
 */
function solveLambaSystem(a, b, c) {

  // the 2d system
  var system = [
    { n: a[0] - c[0], lambda: b[0] },
    { n: a[1] - c[1], lambda: b[1] }
  ];

  // solve
  var n = system[0].n * b[0] + system[1].n * b[1],
      l = system[0].lambda * b[0] + system[1].lambda * b[1];

  return -n/l;
}


/**
 * Position of perpendicular foot
 *
 * @param {Point}
 * @param [ {Point}, {Point} ] line defined throug two points
 * @return {Point} the perpendicular foot position
 */
export function perpendicularFoot(point, line) {

  var a = line[0], b = line[1];

  // relative position of b from a
  var bd = { x: b.x - a.x, y: b.y - a.y };

  // solve equation system to the parametrized vectors param real value
  var r = solveLambaSystem([ a.x, a.y ], [ bd.x, bd.y ], [ point.x, point.y ]);

  return { x: a.x + r*bd.x, y: a.y + r*bd.y };
}


/**
 * Calculates the distance between a point and a line
 *
 * @param {Point}
 * @param [ {Point}, {Point} ] line defined throug two points
 * @return {Float} distance
 */
export function getDistancePointLine(point, line) {

  var pfPoint = perpendicularFoot(point, line);

  // distance vector
  var connectionVector = {
    x: pfPoint.x - point.x,
    y: pfPoint.y - point.y
  };

  return vectorLength(connectionVector);
}


/**
 * Calculates the distance between two points
 *
 * @param {Point}
 * @param {Point}
 * @return {Float} distance
 */
export function getDistancePointPoint(point1, point2) {

  return vectorLength({
    x: point1.x - point2.x,
    y: point1.y - point2.y
  });
}