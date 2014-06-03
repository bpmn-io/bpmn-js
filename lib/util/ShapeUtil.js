var _ = require('lodash');

/**
 * Adds an element to a collection and returns true if the
 * element was added.
 *
 * @param {Object[]} elements
 * @param {Object} e
 * @param {Boolean} unique
 */
function add(elements, e, unique) {
  var canAdd = !unique || elements.indexOf(e) === -1;

  if (canAdd) {
    elements.push(e);
  }

  return canAdd;
}

function each(shapes, fn, depth) {

  depth = depth || 0;

  _.forEach(shapes, function(s, i) {
    var filter = fn(s, i, depth);

    if (_.isArray(filter) && filter.length) {
      each(filter, fn, depth + 1);
    }
  });
}

/**
 * Collects self + child shapes up to a given depth from a list of shapes.
 *
 * @param  {djs.ShapeDescriptor[]} shapes the shapes to select the children from
 * @param  {Boolean} unique whether to return a unique result set (no duplicates)
 * @param  {Number} maxDepth the depth to search through or -1 for infinite
 *
 * @return {djs.ShapeDescriptor[]} found shapes
 */
function selfAndChildren(shapes, unique, maxDepth) {
  var result = [],
      processedChildren = [];

  each(shapes, function(shape, i, depth) {
    add(result, shape, unique);

    var children = shape.children;

    // max traversal depth not reached yet
    if (maxDepth === -1 || depth < maxDepth) {

      // children exist && children not yet processed
      if (children && add(processedChildren, children, unique)) {
        return children;
      }
    }
  });

  return result;
}

/**
 * Return self + direct children for a number of shapes
 *
 * @param  {djs.ShapeDescriptor[]} shapes to query
 * @param  {Boolean} allowDuplicates to allow duplicates in the result set
 *
 * @return {djs.ShapeDescriptor[]} the collected shapes
 */
function selfAndDirectChildren(shapes, allowDuplicates) {
  return selfAndChildren(shapes, !allowDuplicates, 1);
}

/**
 * Return self + ALL children for a number of shapes
 *
 * @param  {djs.ShapeDescriptor[]} shapes to query
 * @param  {Boolean} allowDuplicates to allow duplicates in the result set
 *
 * @return {djs.ShapeDescriptor[]} the collected shapes
 */
function selfAndAllChildren(shapes, allowDuplicates) {
  return selfAndChildren(shapes, !allowDuplicates, -1);
}

/**
 * Translate a shape
 * Move shape to shape.x + x and shape.y + y
 */
function translateShape(shape, x, y) {
  'use strict';

  shape.x += x;
  shape.y += y;
}

function setParent(shape, newParent) {
  // TODO(nre): think about parent->child magic

  var old = shape.parent;
  if (old && old.children) {
    var idx = old.children.indexOf(shape);
    if (idx !== -1) {
      old.children.splice(idx, 1);
    }
  }

  if (newParent) {
    if (!newParent.children) {
      newParent.children = [];
    }

    newParent.children.push(shape);
  }

  shape.parent = newParent;

  return old;
}

module.exports.eachShape = each;
module.exports.selfAndDirectChildren = selfAndDirectChildren;
module.exports.selfAndAllChildren = selfAndAllChildren;
module.exports.translateShape = translateShape;
module.exports.setParent = setParent;