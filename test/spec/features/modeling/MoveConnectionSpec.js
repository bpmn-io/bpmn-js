import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import { getDi } from 'lib/util/ModelUtil';


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
          sequenceFlowDi = getDi(sequenceFlowConnection);

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

      expect(sequenceFlowDi.waypoint).eql(diWaypoints);
    }));


    it('undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlowDi = getDi(sequenceFlowConnection);

      var oldWaypoints = sequenceFlowConnection.waypoints,
          oldDiWaypoints = sequenceFlowDi.waypoint;

      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      // when
      commandStack.undo();

      // then
      expect(sequenceFlowConnection.waypoints).eql(oldWaypoints);
      expect(sequenceFlowDi.waypoint).eql(oldDiWaypoints);
    }));


    it('redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlowDi = getDi(sequenceFlowConnection);

      modeling.moveConnection(sequenceFlowConnection, { x: 20, y: 10 });

      var newWaypoints = sequenceFlowConnection.waypoints,
          newDiWaypoints = sequenceFlowDi.waypoint;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sequenceFlowConnection.waypoints).eql(newWaypoints);
      expect(sequenceFlowDi.waypoint).eql(newDiWaypoints);
    }));

  });
});
