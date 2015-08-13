'use strict';

var TestHelper = require('../helper');

var getCenter = require('diagram-js/lib/layout/LayoutUtil').getCenter;

var isArray = require('lodash/lang/isArray'),
    map = require('lodash/collection/map'),
    pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');


function invoke(fn) {
  return TestHelper.getBpmnJS().invoke(fn);
}

function normalizeDelta(delta) {
  return assign({ x: 0, y: 0 }, delta);
}


module.exports.getRelativeCenter = function(element, delta) {

  var normalizedDelta = normalizeDelta(delta);

  var center = getCenter(element);

  return {
    x: center.x + normalizedDelta.x,
    y: center.y + normalizedDelta.y
  };
};


function getElement(id) {

  // assume
  expect(id).to.exist;

  return invoke(function(elementRegistry) {
    return elementRegistry.get(id.id || id);
  });
}

module.exports.getElement = getElement;


module.exports.appendShape = function(source, shape, distance, target, connection, connectionParent) {

  source = getElement(source);
  target = target && getElement(target);
  connectionParent = connectionParent && getElement(connectionParent);

  return invoke(function(rules, modeling) {

    var allowed = rules.allowed('shape.append', {
      source: source,
      shape: shape,
      target: target
    });

    // assume append to be allowed
    expect(allowed).to.eql(true);
  });

};


module.exports.moveElements = function(elements, distance, target, isAttach, hints) {

  var actualElements = elements.map(function(e) {
    var actualElement = getElement(e);

    // assume the elements we want to move exist
    expect(actualElement).to.exist;

    return actualElement;
  });


  invoke(function(elementRegistry, modeling, rules) {

    var delta = normalizeDelta(distance);

    var allowed = rules.allowed('elements.move', {
      shapes: actualElements,
      delta: delta,
      target: target
    });

    // assume we can actually move
    expect(allowed).to.eql(typeof isAttach === 'boolean' ? 'attach' : true);

    // perform actual move
    modeling.moveElements(actualElements, delta, target, isAttach, hints);
  });
};


module.exports.getBounds = function() {

  var args = Array.prototype.slice.call(arguments);

  if (isArray(args[0])) {
    args = args[0];
  }

  return map(args, function(e) {

    e = getElement(e);

    if (e.waypoints) {
      return null;
    }

    return pick(e, [ 'x', 'y', 'width', 'height' ]);
  });
};