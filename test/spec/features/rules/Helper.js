import {
  getBpmnJS
} from 'test/TestHelper';

import {
  isArray,
  isString,
  map
} from 'min-dash';


export function expectCanConnect(source, target, rules) {

  var results = {};

  getBpmnJS().invoke(function(bpmnRules) {

    source = get(source);
    target = get(target);

    if ('sequenceFlow' in rules) {
      results.sequenceFlow = bpmnRules.canConnectSequenceFlow(source, target);
    }

    if ('messageFlow' in rules) {
      results.messageFlow = bpmnRules.canConnectMessageFlow(source, target);
    }

    if ('association' in rules) {
      results.association = bpmnRules.canConnectAssociation(source, target);
    }

    if ('dataAssociation' in rules) {
      results.dataAssociation = bpmnRules.canConnectDataAssociation(source, target);
    }
  });

  expect(results).to.eql(rules);
}


export function expectCanDrop(element, target, expectedResult) {

  var result = getBpmnJS().invoke(function(bpmnRules) {
    return bpmnRules.canDrop(get(element), get(target));
  });

  expect(result).to.eql(expectedResult);
}


export function expectCanCreate(shape, target, expectedResult) {

  var result = getBpmnJS().invoke(function(rules) {

    if (isArray(shape)) {
      return rules.allowed('elements.create', {
        elements: get(shape),
        target: get(target)
      });
    }

    return rules.allowed('shape.create', {
      shape: get(shape),
      target: get(target)
    });
  });

  expect(result).to.eql(expectedResult);
}


export function expectCanCopy(element, elements, expectedResult) {

  var result = getBpmnJS().invoke(function(rules) {
    return rules.allowed('element.copy', {
      element: element,
      elements: elements
    });
  });

  expect(result).to.eql(expectedResult);
}


export function expectCanInsert(element, target, expectedResult) {

  var result = getBpmnJS().invoke(function(bpmnRules) {
    return bpmnRules.canInsert(get(element), get(target));
  });

  expect(result).to.eql(expectedResult);
}


export function expectCanMove(elements, target, rules) {

  var results = {};

  elements = elements.map(get);

  getBpmnJS().invoke(function(bpmnRules) {

    target = get(target);

    if ('attach' in rules) {
      results.attach = bpmnRules.canAttach(elements, target);
    }

    if ('move' in rules) {
      results.move = bpmnRules.canMove(elements, target);
    }
  });

  expect(results).to.eql(rules);
}


/**
 * Retrieve element, resolving an ID with
 * the actual element.
 */
function get(elementId) {

  if (isArray(elementId)) {
    return map(elementId, get);
  }

  var element;

  if (isString(elementId)) {
    element = getBpmnJS().invoke(function(elementRegistry) {
      return elementRegistry.get(elementId);
    });

    if (!element) {
      throw new Error('element #' + elementId + ' not found');
    }

    return element;
  }

  return elementId;
}