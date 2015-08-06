'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling/behavior - create boundary events', function() {

  var testModules = [ coreModule, modelingModule ];


  var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/process-empty.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules.concat(modelingModule) }));


  it('should execute on attach', inject(function(canvas, elementFactory, modeling) {

    // given
    var rootElement = canvas.getRootElement(),
        task = elementFactory.createShape({ type: 'bpmn:Task' }),
        intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

    modeling.createShape(task, { x: 100, y: 100 }, rootElement);

    // when
    var newEvent = modeling.createShape(intermediateEvent, { x: 50 + 15, y: 100 }, task, true);

    // then
    expect(newEvent.type).to.equal('bpmn:BoundaryEvent');
    expect(newEvent.businessObject.attachedToRef).to.equal(task.businessObject);
  }));


  it('should NOT execute on drop', inject(function(canvas, elementFactory, modeling) {

    // given
    var rootElement = canvas.getRootElement(),
        subProcess = elementFactory.createShape({ type: 'bpmn:SubProcess', isExpanded: true }),
        intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });


    modeling.createShape(subProcess, { x: 300, y: 200 }, rootElement);

    // when
    var newEvent = modeling.createShape(intermediateEvent, { x: 300, y: 200 }, subProcess);

    // then
    expect(newEvent).to.exist;
    expect(newEvent.type).to.equal('bpmn:IntermediateThrowEvent');
  }));

});
