import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';


import {
  assign,
  map,
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

describe('behavior - LayoutConnectionBehavior', function() {

  var diagramXML = require('./LayoutConnectionBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      modelingModule,
      coreModule
    ]
  }));


  describe('incomming association', function() {

    it('should reconnect on bendpoint move', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');
      var association = elementRegistry.get('Association_1');

      // when
      var newWaypoints = copyWaypoints(sequenceFlow);
      newWaypoints.splice(1, 0,
        { x: 500, y: 300 }
      );

      var hints = {
        bendpointMove: {
          bendpointIndex: 1,
          insert: true
        }
      };

      modeling.updateWaypoints(sequenceFlow, newWaypoints, hints);

      // then
      expectApproximateWaypoints(association, [
        { x: 525, y: 110 },
        { x: 355, y: 229 },
      ]);
    }));


    it('should reconnect on connection move', inject(function(elementRegistry, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');
      var endEvent = elementRegistry.get('EndEvent_1');
      var association = elementRegistry.get('Association_1');

      // when
      modeling.moveElements([ startEvent, endEvent ], { x: 0, y: 200 });

      // then
      expectApproximateWaypoints(association, [
        { x: 525, y: 110 },
        { x: 460, y: 350 },
      ]);

    }));

    it('should reconnect on waypoint update', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');
      var association = elementRegistry.get('Association_1');

      // when
      var newWaypoints = [
        sequenceFlow.waypoints[0],
        { x: sequenceFlow.waypoints[0].x, y: 300 },
        { x: sequenceFlow.waypoints[1].x, y: 300 },
        sequenceFlow.waypoints[1],
      ];

      modeling.updateWaypoints(sequenceFlow, newWaypoints);

      // then
      expectApproximateWaypoints(association, [
        { x: 525, y: 110 },
        { x: 460, y: 300 }
      ]);
    }));

  });


  describe('outgoing association', function() {

    it('should reconnect on bendpoint move', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');
      var association = elementRegistry.get('Association_2');

      // when
      var newWaypoints = copyWaypoints(sequenceFlow);
      newWaypoints.splice(1, 0,
        { x: 500, y: 300 }
      );

      var hints = {
        bendpointMove: {
          bendpointIndex: 1,
          insert: true
        }
      };

      modeling.updateWaypoints(sequenceFlow, newWaypoints, hints);

      // then
      expectApproximateWaypoints(association, [
        { x: 355, y: 229 },
        { x: 525, y: 110 }
      ]);
    }));


    it('should reconnect on connection move', inject(function(elementRegistry, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1');
      var endEvent = elementRegistry.get('EndEvent_1');
      var association = elementRegistry.get('Association_2');

      // when
      modeling.moveElements([ startEvent, endEvent ], { x: 0, y: 200 });

      // then
      expectApproximateWaypoints(association, [
        { x: 460, y: 350 },
        { x: 525, y: 110 }
      ]);

    }));


    it('should reconnect on waypoint update', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_1');
      var association = elementRegistry.get('Association_2');

      // when
      var newWaypoints = [
        sequenceFlow.waypoints[0],
        { x: sequenceFlow.waypoints[0].x, y: 300 },
        { x: sequenceFlow.waypoints[1].x, y: 300 },
        sequenceFlow.waypoints[1],
      ];

      modeling.updateWaypoints(sequenceFlow, newWaypoints);

      // then
      expectApproximateWaypoints(association, [
        { x: 460, y: 300 },
        { x: 525, y: 110 }
      ]);
    }));

  });

});


// helpers //////////

function copyWaypoint(waypoint) {
  return assign({}, waypoint);
}

function copyWaypoints(connection) {
  return map(connection.waypoints, function(waypoint) {

    waypoint = copyWaypoint(waypoint);

    if (waypoint.original) {
      waypoint.original = copyWaypoint(waypoint.original);
    }

    return waypoint;
  });
}

function expectApproximateWaypoints(connection, expectedWaypoints) {

  var actualWaypoints = connection.waypoints;

  expect(actualWaypoints).to.exist;
  expect(expectedWaypoints).to.exist;

  expect(connection.waypoints.length).to.eql(expectedWaypoints.length);

  for (var i in actualWaypoints) {
    expect(actualWaypoints[i].x).to.be.closeTo(expectedWaypoints[i].x, 1);
    expect(actualWaypoints[i].y).to.be.closeTo(expectedWaypoints[i].y, 1);
  }
}