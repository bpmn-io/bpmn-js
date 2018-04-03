import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - move connection', function() {

  describe('should move connection', function() {

    var diagramXML = require('../../../fixtures/bpmn/sequence-flows.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule
      ]
    }));


    it('execute', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      // when
      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      var expectedWaypoints = [
        { x: 598, y: 351 },
        { x: 954, y: 351 },
        { x: 954, y: 446 },
        { x: 852, y: 446 }
      ];

      // then

      // expect cropped connection
      expect(sequenceFlowConnection).to.have.waypoints(expectedWaypoints);

      // expect cropped waypoints in di
      var diWaypoints = bpmnFactory.createDiWaypoints(expectedWaypoints);

      expect(sequenceFlow.di.waypoint).eql(diWaypoints);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      var oldWaypoints = sequenceFlowConnection.waypoints,
          oldDiWaypoints = sequenceFlow.di.waypoint;

      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      // when
      commandStack.undo();

      // then
      expect(sequenceFlowConnection.waypoints).eql(oldWaypoints);
      expect(sequenceFlow.di.waypoint).eql(oldDiWaypoints);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      var newWaypoints = sequenceFlowConnection.waypoints,
          newDiWaypoints = sequenceFlow.di.waypoint;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sequenceFlowConnection.waypoints).eql(newWaypoints);
      expect(sequenceFlow.di.waypoint).eql(newDiWaypoints);
    }));

  });
});
