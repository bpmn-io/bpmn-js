'use strict';

var TestHelper = require('../../../TestHelper');
 
describe('drop on conection', function(){

  var bpmnRules = require('../../../../lib/features/modeling/rules');
  var diagramXML = require('./diagram.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {modules: bpmnRules}));

  it('should be allowed for an IntermediateThrowEvent', inject(function(elementRegistry, bpmnRules, elementFactory) {
    var sequenceFlow = elementRegistry.get('SequenceFlow_0lk9mnl');
    var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

    expect(bpmnRules.canCreate(intermediateThrowEvent, sequenceFlow)).toBe(true);
  }));

  it('should rearrange connections', inject(function(modeling, elementRegistry, elementFactory){
    var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });
    var startEvent = elementRegistry.get('StartEvent_1');
    var sequenceFlow = elementRegistry.get('SequenceFlow_0lk9mnl');
    var task = elementRegistry.get('Task_195jx60');
    var position = {x: startEvent.x + startEvent.height/2 + 100,
                    y: startEvent.y + startEvent.width/2};
    
    // create new intermediateThrowEvent onto sequenceFlow
    modeling.createShape(intermediateThrowEvent, position, sequenceFlow);

    // check rearragned connection
    expect(startEvent.outgoing[0].id).toBe(intermediateThrowEvent.incoming[0].id);

    // check newly created connection
    expect(intermediateThrowEvent.outgoing[0].id).toBe(task.incoming[0].id);
  }));
});