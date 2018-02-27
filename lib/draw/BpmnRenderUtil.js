'use strict';

var every = require('lodash/collection/every'),
    some = require('lodash/collection/some');

var componentsToPath = require('diagram-js/lib/util/RenderUtil').componentsToPath;


// element utils //////////////////////

/**
 * Checks if eventDefinition of the given element matches with semantic type.
 *
 * @return {boolean} true if element is of the given semantic type
 */
function isTypedEvent(event, eventDefinitionType, filter) {

  function matches(definition, filter) {
    return every(filter, function(val, key) {

      // we want a == conversion here, to be able to catch
      // undefined == false and friends
      /* jshint -W116 */
      return definition[key] == val;
    });
  }

  return some(event.eventDefinitions, function(definition) {
    return definition.$type === eventDefinitionType && matches(event, filter);
  });
}

module.exports.isTypedEvent = isTypedEvent;

function isThrowEvent(event) {
  return (event.$type === 'bpmn:IntermediateThrowEvent') || (event.$type === 'bpmn:EndEvent');
}

module.exports.isThrowEvent = isThrowEvent;

function isCollection(element) {
  var dataObject = element.dataObjectRef;

  return element.isCollection || (dataObject && dataObject.isCollection);
}

module.exports.isCollection = isCollection;

function getDi(element) {
  return element.businessObject.di;
}

module.exports.getDi = getDi;

function getSemantic(element) {
  return element.businessObject;
}

module.exports.getSemantic = getSemantic;


// color access //////////////////////

function getFillColor(element, defaultColor) {
  return getDi(element).get('bioc:fill') || defaultColor || 'white';
}

module.exports.getFillColor = getFillColor;

function getStrokeColor(element, defaultColor) {
  return getDi(element).get('bioc:stroke') || defaultColor || 'black';
}

module.exports.getStrokeColor = getStrokeColor;


// cropping path customizations //////////////////////

function getCirclePath(shape) {

  var cx = shape.x + shape.width / 2,
      cy = shape.y + shape.height / 2,
      radius = shape.width / 2;

  var circlePath = [
    ['M', cx, cy],
    ['m', 0, -radius],
    ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
    ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
    ['z']
  ];

  return componentsToPath(circlePath);
}

module.exports.getCirclePath = getCirclePath;

function getRoundRectPath(shape, borderRadius) {

  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var roundRectPath = [
    ['M', x + borderRadius, y],
    ['l', width - borderRadius * 2, 0],
    ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
    ['l', 0, height - borderRadius * 2],
    ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
    ['l', borderRadius * 2 - width, 0],
    ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
    ['l', 0, borderRadius * 2 - height],
    ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
    ['z']
  ];

  return componentsToPath(roundRectPath);
}

module.exports.getRoundRectPath = getRoundRectPath;

function getDiamondPath(shape) {

  var width = shape.width,
      height = shape.height,
      x = shape.x,
      y = shape.y,
      halfWidth = width / 2,
      halfHeight = height / 2;

  var diamondPath = [
    ['M', x + halfWidth, y],
    ['l', halfWidth, halfHeight],
    ['l', -halfWidth, halfHeight],
    ['l', -halfWidth, -halfHeight],
    ['z']
  ];

  return componentsToPath(diamondPath);
}

module.exports.getDiamondPath = getDiamondPath;

function getRectPath(shape) {
  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var rectPath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', 0, height],
    ['l', -width, 0],
    ['z']
  ];

  return componentsToPath(rectPath);
}

module.exports.getRectPath = getRectPath;