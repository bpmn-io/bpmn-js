'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - move elements', function() {

  var diagramXML = require('./MoveElements.flow-collaboration.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should keep flow parent', function() {

    it('when moving shapes', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var connectionSequenceFlow = elementRegistry.get('SequenceFlow'),
          shapeTask_A = elementRegistry.get('Task_A'),
          shapeTask_B = elementRegistry.get('Task_B'),
          shapeTask_C = elementRegistry.get('Task_C'),
          shapePool_A = elementRegistry.get('Pool_A'),
          shapePool_B = elementRegistry.get('Pool_B');

      // when
      modeling.moveElements(
        [ shapeTask_A, shapeTask_B, shapeTask_C ],
        { x: 0, y: -50 },
        shapePool_B,
        { primaryShape: shapeTask_C }
      );

      // then
      expect(connectionSequenceFlow.parent).to.eql(shapePool_A);
    }));


    it('when moving shapes with flow', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var connectionSequenceFlow = elementRegistry.get('SequenceFlow'),
          shapeTask_A = elementRegistry.get('Task_A'),
          shapeTask_B = elementRegistry.get('Task_B'),
          shapeTask_C = elementRegistry.get('Task_C'),
          shapePool_A = elementRegistry.get('Pool_A'),
          shapePool_B = elementRegistry.get('Pool_B');

      // when
      modeling.moveElements(
        [ shapeTask_A, shapeTask_B, shapeTask_C, connectionSequenceFlow ],
        { x: 0, y: -50 },
        shapePool_B,
        { primaryShape: shapeTask_C }
      );

      // then
      expect(connectionSequenceFlow.parent).to.eql(shapePool_A);
    }));

  });

});
