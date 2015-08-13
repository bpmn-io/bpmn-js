'use strict';

/**
 * Failsafe remove an element from a collection
 *
 * @param  {Array<Object>} [collection]
 * @param  {Object} [element]
 *
 * @return {Number} the previous index of the element
 */
module.exports.remove = function(collection, element) {

  if (!collection || !element) {
    return -1;
  }

  var idx = collection.indexOf(element);

  if (idx !== -1) {
    collection.splice(idx, 1);
  }

  return idx;
};

/**
 * Fail save add an element to the given connection, ensuring
 * it does not yet exist.
 *
 * @param {Array<Object>} collection
 * @param {Object} element
 * @param {Number} idx
 */
module.exports.add = function(collection, element, idx) {

  if (!collection || !element) {
    return;
  }

  if (typeof idx !== 'number') {
    idx = -1;
  }

  var currentIdx = collection.indexOf(element);

  if (currentIdx !== -1) {

    if (currentIdx === idx) {
      // nothing to do, position has not changed
      return;
    } else {

      if (idx !== -1) {
        // remove from current position
        collection.splice(currentIdx, 1);
      } else {
        // already exists in collection
        return;
      }
    }
  }

  if (idx !== -1) {
    // insert at specified position
    collection.splice(idx, 0, element);
  } else {
    // push to end
    collection.push(element);
  }
};


/**
 * Fail save get the index of an element in a collection.
 *
 * @param {Array<Object>} collection
 * @param {Object} element
 *
 * @return {Number} the index or -1 if collection or element do
 *                  not exist or the element is not contained.
 */
module.exports.indexOf = function(collection, element) {

  if (!collection || !element) {
    return -1;
  }

  return collection.indexOf(element);
};
