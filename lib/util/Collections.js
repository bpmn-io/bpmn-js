'use strict';

/**
 * Failsafe remove an element from a collection
 *
 * @param  {Array<Object>} [collection]
 * @param  {Object} [element]
 *
 * @return {Object} the element that got removed or undefined
 */
module.exports.remove = function(collection, element) {

  if (!collection || !element) {
    return;
  }

  var idx = collection.indexOf(element);
  if (idx === -1) {
    return;
  }

  collection.splice(idx, 1);

  return element;
};