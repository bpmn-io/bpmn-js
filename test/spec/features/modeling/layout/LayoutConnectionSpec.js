import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - layout connection', function() {

  var diagramXML = require('../../../../fixtures/bpmn/sequence-flows.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  describe('should not touch already layouted', function() {

    it('execute', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      var expectedWaypoints = sequenceFlowConnection.waypoints;

      // when
      modeling.layoutConnection(sequenceFlowConnection);

      // then

      // expect cropped, repaired connection
      // that was not actually modified

      expect(sequenceFlowConnection.waypoints).to.eql(expectedWaypoints);

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

      modeling.layoutConnection(sequenceFlowConnection);

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

      modeling.layoutConnection(sequenceFlowConnection);

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


  it('should remove un-needed waypoints', inject(function(elementRegistry, modeling) {

    // given
    var taskShape = elementRegistry.get('Task_2'),
        sequenceFlowConnection = elementRegistry.get('SequenceFlow_1');

    // when
    // moving task
    modeling.moveElements([ taskShape ], { x: 250, y: -95 });

    // then
    var newWaypoints = sequenceFlowConnection.waypoints;

    expect(newWaypoints.map(toPoint)).to.eql([
      { x: 578, y: 341 },
      { x: 982, y: 341 }
    ]);
  }));


  describe('integration', function() {

    it('should correctly layout after start re-connection', inject(function(elementRegistry, modeling) {

      // given
      var task1 = elementRegistry.get('Task_1'),
          connection = elementRegistry.get('SequenceFlow_1'),
          docking = { x: 292, y: 376 };

      // when
      modeling.reconnectStart(connection, task1, docking);

      // then
      var waypoints = connection.waypoints,
          i,
          first,
          second;

      for (i = 0; i < waypoints.length - 1; i++) {
        first = waypoints[i];
        second = waypoints[i + 1];

        expect(areOnSameAxis(first, second), 'points are on different axes').to.be.true;
      }

    }));


    it('should correctly layout after end re-connection', inject(function(elementRegistry, modeling) {

      // given
      var task1 = elementRegistry.get('Task_1'),
          connection = elementRegistry.get('SequenceFlow_1'),
          docking = { x: 292, y: 376 };

      // when
      modeling.reconnectEnd(connection, task1, docking);

      // then
      var waypoints = connection.waypoints,
          i,
          first,
          second;

      for (i = 0; i < waypoints.length - 1; i++) {
        first = waypoints[i];
        second = waypoints[i + 1];

        expect(areOnSameAxis(first, second), 'points are on different axes').to.be.true;
      }

    }));

  });

});



// helpers //////////////////////

function toPoint(p) {
  return {
    x: p.x,
    y: p.y
  };
}

function areOnSameAxis(a, b) {
  return a.x === b.x || a.y === b.y;
}