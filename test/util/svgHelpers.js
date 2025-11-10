/**
 * Assert if two SVG paths are approximately equal within a given tolerance.
 *
 * @param {string} actual
 * @param {string} expected
 * @param {number} [tolerance=2]
 */
export function expectSvgPath(actual, expected, tolerance = 2) {
  const result = compareSvgPaths(actual, expected, tolerance);
  expect(result).to.be.true;
}

/**
 * Returns true if two SVG paths are approximately equal within a given tolerance.
 *
 * @param {string} pathA
 * @param {string} pathB
 * @param {number} [tolerance=2]
 * @returns {boolean}
 */
export function compareSvgPaths(pathA, pathB, tolerance = 2) {
  const actualNumbers = pathToNumbers(pathA);
  const expectedNumbers = pathToNumbers(pathB);

  if (actualNumbers.length !== expectedNumbers.length) {
    return false;
  }

  for (let i = 0; i < actualNumbers.length; i++) {
    if (Math.abs(actualNumbers[i] - expectedNumbers[i]) > tolerance) {
      return false;
    }
  }

  return true;
}

/**
 * Get an array of numeric values from an SVG path string.
 *
 * @example
 * `pathToNumber('M10,20L30,40')` => `[10, 20, 30, 40]`
 *
 * @param {string} path
 * @returns {number[]}
 */
export function pathToNumbers(path) {
  const normalized = path.toLowerCase();
  const parts = normalized.split(/[a-z,]/g).filter(s => s !== '');

  return parts.map(parseFloat);
}