import {
  getBpmnJS
} from 'test/TestHelper';

import {
  isString
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


export function expectCanInsert(element, target, expectedResult) {

  var result = getBpmnJS().invoke(function(bpmnRules) {
    return bpmnRules.canInsert(get(element), get(target));
  });

  expect(result).to.eql(expectedResult);
}


export function expectCanMove(elements, target, rules) {

  var results = {};

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
function get(element) {

  var actualElement;

  if (isString(element)) {
    actualElement = getBpmnJS().invoke(function(elementRegistry) {
      return elementRegistry.get(element);
    });

    if (!actualElement) {
      throw new Error('element #' + element + ' not found');
    }

    return actualElement;
  }

  return element;
}