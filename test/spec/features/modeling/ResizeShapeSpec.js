'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - resize shape', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple-resizable.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('shape', function() {


    it('should resize', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1');

      var sequenceFlowElement = elementRegistry.get('SequenceFlow_2'),
          sequenceFlow = sequenceFlowElement.businessObject;

      // when

      // Decreasing width by 100px
      modeling.resizeShape(subProcessElement, { x: 339, y: 142, width: 250, height: 200 });

      // then

      // expect flow layout
      var diWaypoints = bpmnFactory.createDiWaypoints([
        { x: 589, y: 242 },
        { x: 821, y: 242 }
      ]);

      expect(sequenceFlow.di.waypoint).eql(diWaypoints);
    }));


    it('should move', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var subProcessElement = elementRegistry.get('SubProcess_1');

      var sequenceFlowElement = elementRegistry.get('SequenceFlow_2'),
          sequenceFlow = sequenceFlowElement.businessObject;

      // when
      modeling.moveShape(subProcessElement, { x: -50, y: 0 });

      // then

      // expect flow layout
      var diWaypoints = bpmnFactory.createDiWaypoints([
        { x: 639, y: 242 },
        { x: 821, y: 242 }
      ]);

      expect(sequenceFlow.di.waypoint).eql(diWaypoints);
    }));

  });

});
