import {
  getBpmnJS
} from 'test/TestHelper';

import {
  map,
  forEach
} from 'min-dash';

function sign(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
}


export function move(elementIds, delta, targetId, isAttach) {

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

  return getBpmnJS().invoke(function(canvas, elementRegistry, modeling) {

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

    var hints = isAttach ? { attach: true } : {};

    return modeling.moveElements(elements, delta, target, hints);
  });
}


export function add(attrs, position, target, isAttach) {

  return getBpmnJS().invoke(function(canvas, elementRegistry, modeling) {

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

    return modeling.createShape(attrs, position, target, { attach: isAttach });
  });
}


export function connect(source, target) {

  return getBpmnJS().invoke(function(canvas, elementRegistry, modeling) {

    function getElement(id) {

      var element = elementRegistry.get(id);

      expect(element).to.exist;

      return element;
    }

    if (typeof target === 'string') {
      target = getElement(target);
    }

    if (typeof source === 'string') {
      source = getElement(source);
    }

    return modeling.connect(source, target);
  });
}


export function attach(attrs, position, target) {
  return add(attrs, position, target, true);
}


function getAncestors(element) {
  var ancestors = [];

  while (element) {
    ancestors.push(element);

    element = element.parent;
  }

  return ancestors;
}


function compareZOrder(a, b) {

  var elementA,
      elementB;

  getBpmnJS().invoke(function(elementRegistry) {

    function getElement(id) {

      var element = elementRegistry.get(id);
      expect(element).to.exist;

      return element;
    }

    if (typeof a === 'string') {
      a = getElement(a);
    }

    if (typeof b === 'string') {
      b = getElement(b);
    }

    elementA = a;
    elementB = b;
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

  return sign(aIndex - bIndex);
}


export function expectZOrder() {

  var elements = Array.prototype.slice.call(arguments);

  var next;

  forEach(elements, function(e, idx) {

    next = elements[idx + 1];

    if (next && compareZOrder(e, next) !== -1) {
      throw new Error(
        'expected <element#' + next + '> to be in front of <element#' + e + '>'
      );
    }
  });

  return true;
}