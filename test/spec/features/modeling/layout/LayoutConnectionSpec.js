import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import bendpointsModule from 'diagram-js/lib/features/bendpoints';
import connectionPreviewModule from 'diagram-js/lib/features/connection-preview';
import connectModule from 'diagram-js/lib/features/connect';
import createModule from 'diagram-js/lib/features/create';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';


var testModules = [
  bendpointsModule,
  connectionPreviewModule,
  connectModule,
  coreModule,
  createModule,
  modelingModule
];


describe('features/modeling - layout connection', function() {

  var diagramXML = require('../../../../fixtures/bpmn/sequence-flows.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
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

    describe('re-connection', function() {

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


    describe('connection preview', function() {

      var task;

      beforeEach(inject(function(elementFactory, dragging) {
        task = elementFactory.createShape({
          type: 'bpmn:Task'
        });

        dragging.setOptions({ manual: true });
      }));

      afterEach(inject(function(dragging) {
        dragging.setOptions({ manual: false });
      }));


      it.skip('should correctly lay out connection preview on create',
        inject(function(canvas, create, dragging, elementRegistry) {

          // given
          var rootShape = canvas.getRootElement(),
              rootShapeGfx = canvas.getGraphics(rootShape),
              task1 = elementRegistry.get('Task_1');

          // when
          create.start(canvasEvent({ x: 0, y: 0 }), task, task1);

          dragging.move(canvasEvent({ x: 175, y: 175 }));
          dragging.hover({ element: rootShape, gfx: rootShapeGfx });
          dragging.move(canvasEvent({ x: 200, y: 200 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(
            context.canExecute.connect,
            context.source,
            context.shape
          );

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(task1.outgoing[0]).to.exist;
          expect(task1.outgoing[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );


      it('should correctly lay out new connection preview',
        inject(function(connect, dragging, elementRegistry) {

          // given
          var task1 = elementRegistry.get('Task_1'),
              task2 = elementRegistry.get('Task_2');

          // when
          connect.start(canvasEvent({ x: 0, y: 0 }), task1);

          dragging.move(canvasEvent({ x: 760, y: 420 }));
          dragging.hover({ element: task2 });
          dragging.move(canvasEvent({ x: 782, y: 436 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(
            context.canExecute,
            context.source,
            context.target
          );

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(task1.outgoing[0]).to.exist;
          expect(task1.outgoing[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );


      it('should correctly lay out connection preview on reconnect start',
        inject(function(canvas, bendpointMove, dragging, elementRegistry) {

          // given
          var task1 = elementRegistry.get('Task_1'),
              task1Gfx = canvas.getGraphics(task1),
              sequenceFlow2 = elementRegistry.get('SequenceFlow_2');

          // when
          bendpointMove.start(canvasEvent({ x: 0, y: 0 }), sequenceFlow2, 0);

          dragging.move(canvasEvent({ x: 230, y: 360 }));
          dragging.hover({ element: task1, gfx: task1Gfx });
          dragging.move(canvasEvent({ x: 248, y: 382 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(
            context.allowed,
            context.source,
            context.target
          );

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(task1.outgoing[0]).to.exist;
          expect(task1.outgoing[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );


      it('should correctly lay out connection preview on reconnect end',
        inject(function(canvas, bendpointMove, dragging, elementRegistry) {

          // given
          var task1 = elementRegistry.get('Task_1'),
              task1Gfx = canvas.getGraphics(task1),
              sequenceFlow2 = elementRegistry.get('SequenceFlow_2');

          // when
          bendpointMove.start(canvasEvent({ x: 0, y: 0 }), sequenceFlow2, 2);

          dragging.move(canvasEvent({ x: 230, y: 360 }));
          dragging.hover({ element: task1, gfx: task1Gfx });
          dragging.move(canvasEvent({ x: 248, y: 382 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(
            context.allowed,
            context.source,
            context.target
          );

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(task1.incoming[0]).to.exist;
          expect(task1.incoming[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );


      it('should correctly lay out connection preview on inserted bendpoint move',
        inject(function(bendpointMove, dragging, elementRegistry) {

          // given
          var task2 = elementRegistry.get('Task_2'),
              sequenceFlow1 = elementRegistry.get('SequenceFlow_1');

          // when
          bendpointMove.start(canvasEvent({ x: 700, y: 341 }), sequenceFlow1, 1, true);

          dragging.move(canvasEvent({ x: 700, y: 400 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(context.allowed);

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(task2.incoming[0]).to.exist;
          expect(task2.incoming[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );


      it('should correctly lay out connection preview on existing bendpoint move',
        inject(function(bendpointMove, dragging, elementRegistry) {

          // given
          var task2 = elementRegistry.get('Task_2'),
              sequenceFlow1 = elementRegistry.get('SequenceFlow_1');

          // when
          bendpointMove.start(canvasEvent({ x: 934, y: 341 }), sequenceFlow1, 1);

          dragging.move(canvasEvent({ x: 960, y: 340 }));

          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(context.allowed);

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(task2.incoming[0]).to.exist;
          expect(task2.incoming[0].waypoints).to.deep.eql(waypointsPreview);
        })
      );
    });


    describe('connection preview with connection type replacement', function() {

      var diagramXML = require('test/spec/features/modeling/behavior/ReplaceConnectionBehavior.message-sequence-flow.bpmn');

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));

      afterEach(inject(function(dragging) {
        dragging.setOptions({ manual: false });
      }));

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should correctly lay out connection preview when reconnecting with replacement',
        inject(function(canvas, bendpointMove, dragging, elementRegistry) {

          // given
          var participant2 = elementRegistry.get('Participant_2'),
              participant2Gfx = canvas.getGraphics(participant2),
              sequenceFlow1 = elementRegistry.get('SequenceFlow_1');

          // when
          bendpointMove.start(canvasEvent(sequenceFlow1.waypoints[1]), sequenceFlow1, 1);

          dragging.move(canvasEvent({ x: participant2.x + 100, y: participant2.y + 10 }));
          dragging.hover({ element: participant2, gfx: participant2Gfx });
          dragging.move(canvasEvent({ x: participant2.x + 105, y: participant2.y + 10 }));


          var ctx = dragging.context();
          var context = ctx.data.context;

          var connectionPreview = context.getConnection(context.allowed);

          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          var newWaypoints = participant2.incoming.slice(-1)[0].waypoints;

          // then
          expect(newWaypoints).to.exist;
          expect(newWaypoints).to.deep.eql(waypointsPreview);
        })
      );
    });


    describe('attaching event', function() {

      var diagramXML = require('test/spec/features/rules/BpmnRules.attaching.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should correctly lay out connection after replacement',
        inject(function(elementRegistry, modeling) {

          // given
          var event = elementRegistry.get('IntermediateThrowEventWithConnections'),
              parent = elementRegistry.get('SubProcess_1');

          // when
          modeling.moveElements([ event ], { x: 0, y: -90 }, parent, { attach: true });

          // then
          var boundaryEvent = elementRegistry.get('IntermediateThrowEventWithConnections');

          expect(boundaryEvent.outgoing[0]).to.have.waypoints([
            { x: 769, y: 297 },
            { x: 769, y: 369 },
            { x: 837, y: 369 }
          ]);
        })
      );

    });
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