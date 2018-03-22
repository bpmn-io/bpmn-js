'use strict';

var some = require('min-dash').some;

var is = require('../../../util/ModelUtil').is;


/**
 * Return true if element has some of the given types.
 *
 * @param {djs.model.Base} element
 * @param {Array<String>} types
 *
 * @return {Boolean}
 */
function isAny(element, types) {
  return some(types, function(t) {
    return is(element, t);
  });
}

module.exports.isAny = isAny;


/**
 * Return the parent of the element with some of the given types.
 *
 * @param {djs.model.Base} element
 * @param {String|Array<String>} anyType
 *
 * @return {djs.model.Base}
 */
function getParent(element, anyType) {

  if (typeof anyType === 'string') {
    anyType = [ anyType ];
  }

  while ((element = element.parent)) {
    if (isAny(element, anyType)) {
      return element;
    }
  }

  return null;
}

module.exports.getParent = getParent;
