import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import connectModule from 'lib/features/connect';
import createModule from 'lib/features/create';

import bendpointsModule from 'diagram-js/lib/features/bendpoints';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';


describe('features/modeling - layout connection', function() {

  var diagramXML = require('../../../../fixtures/bpmn/sequence-flows.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      connectModule,
      createModule,
      bendpointsModule
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


      it('should correctly lay out connection preview on create',
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

          var connectionPreview = context.connection;
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

          var connectionPreview = context.connection;
          var waypointsPreview = connectionPreview.waypoints.slice();

          dragging.end();

          // then
          expect(task1.incoming[0]).to.exist;
          expect(task1.incoming[0].waypoints).to.deep.eql(waypointsPreview);
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