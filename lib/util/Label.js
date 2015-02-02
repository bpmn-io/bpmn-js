'use strict';

var assign = require('lodash/object/assign');


var DEFAULT_LABEL_SIZE = module.exports.DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20
};


/**
 * Returns true if the given semantic has an external label
 *
 * @param {BpmnElement} semantic
 * @return {Boolean} true if has label
 */
module.exports.hasExternalLabel = function(semantic) {

  return semantic.$instanceOf('bpmn:Event') ||
         semantic.$instanceOf('bpmn:Gateway') ||
         semantic.$instanceOf('bpmn:DataStoreReference') ||
         semantic.$instanceOf('bpmn:DataObjectReference') ||
         semantic.$instanceOf('bpmn:SequenceFlow') ||
         semantic.$instanceOf('bpmn:MessageFlow');
};


/**
 * Get the middle of a number of waypoints
 *
 * @param  {Array<Point>} waypoints
 * @return {Point} the mid point
 */
var getWaypointsMid = module.exports.getWaypointsMid = function(waypoints) {

  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  };
};


var getExternalLabelMid = module.exports.getExternalLabelMid = function(element) {

  if (element.waypoints) {
    return getWaypointsMid(element.waypoints);
  } else {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height + DEFAULT_LABEL_SIZE.height / 2
    };
  }
};

/**
 * Returns the bounds of an elements label, parsed from the elements DI or
 * generated from its bounds.
 *
 * @param {BpmnElement} semantic
 * @param {djs.model.Base} element
 */
module.exports.getExternalLabelBounds = function(semantic, element) {

  var mid,
      size,
      bounds,
      di = semantic.di,
      label = di.label;

  if (label && label.bounds) {
    bounds = label.bounds;

    size = {
      width: Math.max(DEFAULT_LABEL_SIZE.width, bounds.width),
      height: bounds.height
    };

    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
  } else {

    mid = getExternalLabelMid(element);

    size = DEFAULT_LABEL_SIZE;
  }

  return assign({
    x: mid.x - size.width / 2,
    y: mid.y - size.height / 2
  }, size);
};