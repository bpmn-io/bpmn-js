'use strict';


/**
 * Remove from the beginning of a collection until it is empty.
 *
 * This is a null-safe operation that ensures elements
 * are being removed from the given collection until the
 * collection is empty.
 *
 * The implementation deals with the fact that a remove operation
 * may touch, i.e. remove multiple elements in the collection
 * at a time.
 *
 * @param {Array<Object>} [collection]
 * @param {Function} removeFn
 *
 * @return {Array<Object>} the cleared collection
 */
module.exports.saveClear = function(collection, removeFn) {

  if (typeof removeFn !== 'function') {
    throw new Error('removeFn iterator must be a function');
  }

  if (!collection) {
    return;
  }

  var e;

  while (!!(e = collection[0])) {
    removeFn(e);
  }

  return collection;
};
