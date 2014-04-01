/**
 * @name modeler.util.emptyArray
 *
 * Fastest way to empty an array. see http://jsperf.com/array-destroy/67
 *
 * @param {Array} array that is emptied.
 * @return {Array} array the empty array.
 */
function emptyArray(array) {
  'use strict';

  while (array.length > 0) {
    array.shift();
  }
  return array;
}

module.exports.emptyArray = emptyArray;

