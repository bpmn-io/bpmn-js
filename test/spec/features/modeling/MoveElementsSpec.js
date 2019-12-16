import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - move elements', function() {

  describe('flow parent', function() {

    var diagramXML = require('./MoveElements.flow-collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('should keep when moving shapes', inject(function(elementRegistry, modeling, bpmnFactory) {

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


    it('should keep when moving shapes with flow', inject(function(elementRegistry, modeling, bpmnFactory) {

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


  describe('boundary connection with tasks', function() {

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


  describe('data input / data output', function() {

    var diagramXML = require('./MoveElements.data-input-output.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('should move', inject(function(elementRegistry, modeling) {

      // given
      var dataInput = elementRegistry.get('DataInput');
      var dataOutput = elementRegistry.get('DataOutput');

      var elements = [
        dataInput,
        dataOutput,
        elementRegistry.get('Task')
      ];

      // when
      modeling.moveElements(
        elements,
        { x: -10, y: -10 }
      );

      // then
      expect(dataOutput).to.have.bounds({
        x: 275,
        y: 140,
        width: 34,
        height: 40
      });

      expect(dataInput).to.have.bounds({
        x: 90,
        y: 90,
        width: 34,
        height: 40
      });
    }));


    it('should wrap in participant', inject(
      function(elementRegistry, elementFactory, modeling, canvas) {

        // given
        var dataInput = elementRegistry.get('DataInput');
        var dataOutput = elementRegistry.get('DataOutput');

        var processShape = canvas.getRootElement(),
            processBo = processShape.businessObject,
            participantShape = elementFactory.createParticipantShape(true);

        // when
        modeling.createShape(participantShape, { x: 350, y: 200 }, processShape);

        // then
        expect(dataInput.businessObject.$parent).to.eql(processBo.ioSpecification);
        expect(dataOutput.businessObject.$parent).to.eql(processBo.ioSpecification);
      }
    ));

  });


  describe('association', function() {

    var testXML = require('./MoveElements.collaboration-association.bpmn');

    beforeEach(bootstrapModeler(testXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('move association', inject(function(elementRegistry, modeling) {

      // given
      var association = elementRegistry.get('Association_1'),
          participant = elementRegistry.get('Process_Engine_1');

      var elements = [
        elementRegistry.get('DataStoreReference_1'),
        association,
        elementRegistry.get('prepareBankTransfer')
      ];

      // when
      modeling.moveElements(elements, { x: 10, y: 10 }, participant);

      // then
      expect(association.parent).to.exist;
    }));

  });


  describe('incoming sequence flows of event based targets', function() {

    var diagramXML = require('./MoveElements.eventBasedTargets.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));

    it('should keep when moving source flow object', inject(function(elementRegistry, modeling) {

      // given
      var shapeTask_A = elementRegistry.get('Task_A'),
          shapeTask_B = elementRegistry.get('Task_B'),
          shapeTask_C = elementRegistry.get('Task_C'),
          shapeTask_D = elementRegistry.get('Task_D'),
          shapeTask_E = elementRegistry.get('Task_E'),
          connectionSequenceFlow_A = elementRegistry.get('SequenceFlow_A'),
          connectionSequenceFlow_B = elementRegistry.get('SequenceFlow_B'),
          connectionSequenceFlow_C = elementRegistry.get('SequenceFlow_C'),
          connectionSequenceFlow_D = elementRegistry.get('SequenceFlow_D'),
          connectionSequenceFlow_E = elementRegistry.get('SequenceFlow_E');

      // when
      modeling.moveElements([
        shapeTask_A,
        shapeTask_B,
        shapeTask_C,
        shapeTask_D,
        shapeTask_E
      ], {
        x: 0, y: -50
      });

      // then
      expect(elementRegistry.get(connectionSequenceFlow_A.id)).to.exist;
      expect(elementRegistry.get(connectionSequenceFlow_B.id)).to.exist;
      expect(elementRegistry.get(connectionSequenceFlow_C.id)).to.exist;
      expect(elementRegistry.get(connectionSequenceFlow_D.id)).to.exist;
      expect(elementRegistry.get(connectionSequenceFlow_E.id)).to.exist;
    }));
  });


  describe('center-to-center connection', function() {

    var diagramXML = require('./MoveElements.centered-connection.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));

    it('should properly adjust connection', inject(function(elementRegistry, modeling) {

      // given
      var targetElement = elementRegistry.get('Task_2');

      var sequenceFlow = elementRegistry.get('SequenceFlow_1');

      // move from centric-left to centric-below
      var delta = { x: -150, y: 150 };

      var expectedWaypoints = [
        { x: 200, y: 160 },
        { x: 200, y: 230 }
      ];

      // when
      modeling.moveElements([ targetElement ], delta);

      // then
      expect(sequenceFlow).to.have.waypoints(expectedWaypoints);
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
