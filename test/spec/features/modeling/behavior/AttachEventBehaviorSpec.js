import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/behavior - attach events', function() {

  var testModules = [ coreModule, modelingModule ];

  var processDiagramXML = require('../../../../fixtures/bpmn/boundary-events.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


  it('should execute on attach', inject(function(elementRegistry, modeling) {

    // given
    var eventId = 'IntermediateThrowEvent_1',
        intermediateThrowEvent = elementRegistry.get(eventId),
        subProcess = elementRegistry.get('SubProcess_1'),
        boundaryEvent;

    var elements = [ intermediateThrowEvent ];

    // when
    modeling.moveElements(elements, { x: 60, y: -131 }, subProcess, { attach: true });

    // then
    boundaryEvent = elementRegistry.get(eventId);

    expect(intermediateThrowEvent.parent).to.not.exist;
    expect(boundaryEvent).to.exist;
    expect(boundaryEvent.type).to.equal('bpmn:BoundaryEvent');
    expect(boundaryEvent.businessObject.attachedToRef).to.equal(subProcess.businessObject);
  }));


  it('should NOT execute on drop', inject(function(elementRegistry, modeling) {

    // given
    var eventId = 'IntermediateThrowEvent_1',
        intermediateThrowEvent = elementRegistry.get(eventId),
        subProcess = elementRegistry.get('SubProcess_1');

    var elements = [ intermediateThrowEvent ];

    // when
    modeling.moveElements(elements, { x: 60, y: -191 }, subProcess);

    // then
    expect(intermediateThrowEvent.parent).to.eql(subProcess);
    expect(intermediateThrowEvent.type).to.equal('bpmn:IntermediateThrowEvent');
  }));

});
