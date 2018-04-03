import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - move elements', function() {

  describe('should keep flow parent', function() {

    var diagramXML = require('./MoveElements.flow-collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


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


  describe('should move boundary connection with tasks', function() {

    var diagramXML = require('./MoveElements.boundary-connection.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('should properly adjust connection', inject(function(elementRegistry, modeling) {

      // given
      var elements = [
        elementRegistry.get('Task_1'),
        elementRegistry.get('Task_2'),
        elementRegistry.get('BoundaryEvent')
      ];

      var boundaryFlow = elementRegistry.get('Boundary_Flow');

      var delta = { x: 0, y: 20 };

      var expectedWaypoints = moveWaypoints(boundaryFlow.waypoints, delta);

      // when
      modeling.moveElements(elements, delta);

      // then
      expect(boundaryFlow).to.have.waypoints(expectedWaypoints);
    }));

  });

});


// helpers //////////////////////

function moveWaypoint(p, delta) {
  return {
    x: p.x + delta.x || 0,
    y: p.y + delta.y || 0
  };
}

function moveWaypoints(waypoints, delta) {

  return waypoints.map(function(p) {

    var original = p.original;

    var moved = moveWaypoint(p, delta);

    if (original) {
      moved.original = moveWaypoint(original, delta);
    }

    return moved;
  });
}