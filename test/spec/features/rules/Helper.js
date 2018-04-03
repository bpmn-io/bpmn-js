import {
  getBpmnJS
} from 'test/TestHelper';


export function expectCanConnect(source, target, rules) {

  var results = {};

  getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    source = elementRegistry.get(source);
    target = elementRegistry.get(target);

    expect(source).to.exist;
    expect(target).to.exist;

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

  var result;

  getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    element = elementRegistry.get(element);
    target = elementRegistry.get(target);

    expect(element).to.exist;
    expect(target).to.exist;

    result = bpmnRules.canDrop(element, target);
  });

  expect(result).to.eql(expectedResult);
}


export function expectCanMove(elements, target, rules) {

  var results = {};

  getBpmnJS().invoke(function(elementRegistry, bpmnRules) {

    target = elementRegistry.get(target);

    if ('attach' in rules) {
      results.attach = bpmnRules.canAttach(elements, target);
    }

    if ('move' in rules) {
      results.move = bpmnRules.canMove(elements, target);
    }
  });

  expect(results).to.eql(rules);
}