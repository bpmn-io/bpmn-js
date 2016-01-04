'use strict';

var TestHelper = require('../../../TestHelper');

var map = require('lodash/collection/map');

// polyfill, because Math.sign is not available in PhantomJS, IE and Safari
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
Math.sign = Math.sign || function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
};

function move(elementIds, delta, targetId, isAttach) {

  if (typeof elementIds === 'string') {
    elementIds = [ elementIds ];
  }

  if (typeof delta !== 'object') {
    isAttach = targetId;
    targetId = delta;
    delta = { x: 0, y: 0 };
  }

  if (typeof targetId !== 'string') {
    isAttach = targetId;
    targetId = null;
  }

  return TestHelper.getBpmnJS().invoke(function(canvas, elementRegistry, modeling) {

    function getElement(id) {

      var element = elementRegistry.get(id);

      expect(element).to.exist;

      return element;
    }

    var elements = map(elementIds, getElement),
        target;

    if (targetId === 'Root') {
      target = canvas.getRootElement();
    } else {
      target = targetId && getElement(targetId);
    }

    return modeling.moveElements(elements, delta, target, isAttach);
  });
}

module.exports.move = move;


function add(attrs, position, target, isAttach) {

  return TestHelper.getBpmnJS().invoke(function(canvas, elementRegistry, modeling) {

    function getElement(id) {

      var element = elementRegistry.get(id);

      expect(element).to.exist;

      return element;
    }

    if (!target) {
      target = canvas.getRootElement();
    } else
    if (typeof target === 'string') {
      target = getElement(target);
    }

    return modeling.createShape(attrs, position, target, isAttach);
  });
}

module.exports.add = add;


function attach(attrs, position, target) {
  return add(attrs, position, target, true);
}

module.exports.attach = attach;


function getAncestors(element) {
  var ancestors = [];

  while (element) {
    ancestors.push(element);

    element = element.parent;
  }

  return ancestors;
}


function compareZOrder(aId, bId) {

  var elementA,
      elementB;

  TestHelper.getBpmnJS().invoke(function(elementRegistry) {

    function getElement(id) {

      var element = elementRegistry.get(id);
      expect(element).to.exist;

      return element;
    }

    elementA = getElement(aId);
    elementB = getElement(bId);
  });


  var aAncestors = getAncestors(elementA),
      bAncestors = getAncestors(elementB);

  var sharedRoot = aAncestors.reduce(function(result, aAncestor, aParentIndex) {

    if (result) {
      return result;
    }

    var bParentIndex = bAncestors.indexOf(aAncestor);

    if (bParentIndex !== -1) {
      return {
        a: aAncestors[aParentIndex - 1],
        b: bAncestors[bParentIndex - 1],
        parent: aAncestor
      };
    }
  }, false);

  // b contained in a
  if (!sharedRoot.a) {
    return -1;
  }

  // a contained in b
  if (!sharedRoot.b) {
    return 1;
  }

  var aIndex = sharedRoot.parent.children.indexOf(sharedRoot.a),
      bIndex = sharedRoot.parent.children.indexOf(sharedRoot.b);

  return Math.sign(aIndex - bIndex);
}


var forEach = require('lodash/collection/forEach');

function expectZOrder() {

  var elements = Array.prototype.slice.call(arguments);

  var next;

  forEach(elements, function(e, idx) {

    next = elements[idx + 1];

    if (next) {
      expect(compareZOrder(e, next)).to.eql(-1);
    }
  });

  return true;
}

module.exports.expectZOrder = expectZOrder;
