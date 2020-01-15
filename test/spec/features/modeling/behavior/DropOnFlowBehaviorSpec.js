import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  flatten
} from 'min-dash';

import coreModule from 'lib/core';
import moveModule from 'diagram-js/lib/features/move';
import modelingModule from 'lib/features/modeling';

var noTouchInteractionModule = { touchInteractionEvents: ['value', null ] };

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';


describe('modeling/behavior - drop on connection', function() {

  var diagramXML = require('./DropOnFlowBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      noTouchInteractionModule,
      moveModule,
      modelingModule,
      coreModule
    ]
  }));


  describe('execution', function() {

    describe('create', function() {

      it('should connect start -> target -> end', inject(
        function(modeling, elementRegistry, elementFactory) {

          // given
          var intermediateThrowEvent = elementFactory.createShape({
            type: 'bpmn:IntermediateThrowEvent'
          });

          var startEvent = elementRegistry.get('StartEvent'),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              task = elementRegistry.get('Task_1');

          var originalWaypoints = sequenceFlow.waypoints;

          var dropPosition = { x: 340, y: 120 }; // first bendpoint

          // when
          var newShape = modeling.createShape(
            intermediateThrowEvent,
            dropPosition,
            sequenceFlow
          );

          // then
          var targetConnection = newShape.outgoing[0];

          // new incoming connection
          expect(newShape.incoming.length).to.equal(1);
          expect(newShape.incoming[0]).to.eql(sequenceFlow);

          // new outgoing connection
          expect(newShape.outgoing.length).to.equal(1);
          expect(targetConnection).to.exist;
          expect(targetConnection.type).to.equal('bpmn:SequenceFlow');

          expect(startEvent.outgoing[0]).to.equal(newShape.incoming[0]);
          expect(task.incoming[1]).to.equal(newShape.outgoing[0]);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 1),
            { x: 322, y: 120 }
          ]));

          expect(sequenceFlow).to.have.endDocking(dropPosition);

          expect(targetConnection).to.have.waypoints(flatten([
            { x: 340, y: 138 },
            originalWaypoints.slice(2)
          ]));

          expect(targetConnection).to.have.startDocking(dropPosition);
        }
      ));


      it('should connect start -> target', inject(
        function(modeling, elementRegistry, elementFactory) {

          // given
          var endEventShape = elementFactory.createShape({ type: 'bpmn:EndEvent' });

          var sequenceFlow = elementRegistry.get('SequenceFlow_1');
          var originalWaypoints = sequenceFlow.waypoints;

          var dropPosition = { x: 340, y: 120 }; // first bendpoint

          // when
          var newShape = modeling.createShape(
            endEventShape,
            dropPosition,
            sequenceFlow
          );

          // then

          // new incoming connection
          expect(newShape.incoming.length).to.equal(1);
          expect(newShape.incoming[0]).to.eql(sequenceFlow);

          // no outgoing edges
          expect(newShape.outgoing.length).to.equal(0);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 1),
            { x: 322, y: 120 }
          ]));
        }
      ));


      it('should connect target -> end', inject(
        function(modeling, elementRegistry, elementFactory) {

          // given
          var startEventShape = elementFactory.createShape({
            type: 'bpmn:StartEvent'
          });

          var sequenceFlow = elementRegistry.get('SequenceFlow_1');
          var originalWaypoints = sequenceFlow.waypoints;

          var dropPosition = { x: 340, y: 120 }; // first bendpoint

          // when
          var newShape = modeling.createShape(
            startEventShape,
            dropPosition,
            sequenceFlow
          );

          // then

          // no incoming connection
          expect(newShape.incoming.length).to.equal(0);

          // no outgoing edges
          expect(newShape.outgoing.length).to.equal(1);
          expect(newShape.outgoing[0]).to.eql(sequenceFlow);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            { x: 340, y: 138 },
            originalWaypoints.slice(2)
          ]));
        }
      ));


      it('should connect start -> target -> end (with bendpointBefore inside bbox)', inject(
        function(modeling, elementRegistry, elementFactory) {

          // given
          var taskShape = elementFactory.createShape({ type: 'bpmn:Task' }),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              originalWaypoints = sequenceFlow.waypoints,
              dropPosition = { x: 340, y: 145 }; // 25 pixels below bendpoint

          // when
          modeling.createShape(taskShape, dropPosition, sequenceFlow);

          // then
          // split target but don't keep insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 1),
            { x: 290, y: 120 }
          ]));

          expect(sequenceFlow).to.have.endDocking({ x: 340, y: 120 });
        }
      ));


      it('should connect start -> target -> end (with bendpointAfter inside bbox)', inject(
        function(modeling, elementRegistry, elementFactory) {

          // given
          var taskShape = elementFactory.createShape({ type: 'bpmn:Task' }),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              originalWaypoints = sequenceFlow.waypoints,
              dropPosition = { x: 340, y: 280 }; // 25 pixels above bendpoint

          // when
          var newShape = modeling.createShape(taskShape, dropPosition, sequenceFlow),
              targetConnection = newShape.outgoing[0];

          // then
          // split target but don't keep insertion point
          expect(targetConnection).to.have.waypoints(flatten([
            { x: 390, y: 299 },
            originalWaypoints.slice(3)
          ]));

          expect(targetConnection).to.have.startDocking({ x: 340, y: 299 });
        }
      ));


      it('should handle shape created with bounds', inject(
        function(elementFactory, elementRegistry, modeling) {

          // given
          var intermediateThrowEvent = elementFactory.createShape({
            type: 'bpmn:IntermediateThrowEvent'
          });

          var startEvent = elementRegistry.get('StartEvent'),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              task = elementRegistry.get('Task_1');

          var originalWaypoints = sequenceFlow.waypoints;

          var dropBounds = { x: 322, y: 102, width: 36, height: 36 }; // first bendpoint

          // when
          var newShape = modeling.createShape(
            intermediateThrowEvent,
            dropBounds,
            sequenceFlow
          );

          // then
          var targetConnection = newShape.outgoing[0];

          // new incoming connection
          expect(newShape.incoming.length).to.equal(1);
          expect(newShape.incoming[0]).to.eql(sequenceFlow);

          // new outgoing connection
          expect(newShape.outgoing.length).to.equal(1);
          expect(targetConnection).to.exist;
          expect(targetConnection.type).to.equal('bpmn:SequenceFlow');

          expect(startEvent.outgoing[0]).to.equal(newShape.incoming[0]);
          expect(task.incoming[1]).to.equal(newShape.outgoing[0]);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 1),
            { x: 322, y: 120 }
          ]));

          expect(sequenceFlow).to.have.endDocking(getMid(dropBounds));

          expect(targetConnection).to.have.waypoints(flatten([
            { x: 340, y: 138 },
            originalWaypoints.slice(2)
          ]));

          expect(targetConnection).to.have.startDocking(getMid(dropBounds));
        }
      ));

    });


    describe('move', function() {

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should connect start -> target -> end', inject(
        function(dragging, move, elementRegistry, selection) {

          // given
          var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_foo');

          var startEvent = elementRegistry.get('StartEvent'),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow),
              task = elementRegistry.get('Task_1');

          var originalWaypoints = sequenceFlow.waypoints;

          // when
          selection.select(intermediateThrowEvent);

          move.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: 149, y: 0 }));

          dragging.end();

          // then
          var targetConnection = intermediateThrowEvent.outgoing[0];

          // new incoming connection
          expect(intermediateThrowEvent.incoming.length).to.equal(1);
          expect(intermediateThrowEvent.incoming[0]).to.eql(sequenceFlow);

          // new outgoing connection
          expect(intermediateThrowEvent.outgoing.length).to.equal(1);
          expect(targetConnection).to.exist;
          expect(targetConnection.type).to.equal('bpmn:SequenceFlow');

          expect(startEvent.outgoing[0]).to.equal(intermediateThrowEvent.incoming[0]);
          expect(task.incoming[1]).to.equal(intermediateThrowEvent.outgoing[0]);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 2),
            { x: 340, y: 192 }
          ]));

          expect(sequenceFlow).to.have.endDocking({ x: 340, y: 210 });

          expect(targetConnection).to.have.waypoints(flatten([
            { x: 340, y: 228 },
            originalWaypoints.slice(2)
          ]));

          expect(targetConnection).to.have.startDocking({ x: 340, y: 210 });
        }
      ));


      it('should connect start -> target -> end (hovering parent)', inject(
        function(dragging, move, elementRegistry, selection, canvas) {

          // given
          var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_foo');

          var startEvent = elementRegistry.get('StartEvent'),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              task = elementRegistry.get('Task_1'),
              rootElement = canvas.getRootElement(),
              rootElementGfx = elementRegistry.getGraphics(rootElement);

          var originalWaypoints = sequenceFlow.waypoints;

          // when
          selection.select(intermediateThrowEvent);

          move.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

          dragging.hover({
            element: rootElement,
            gfx: rootElementGfx
          });

          dragging.move(canvasEvent({ x: 149, y: 0 }));
          dragging.end();

          // then
          var targetConnection = intermediateThrowEvent.outgoing[0];

          // new incoming connection
          expect(intermediateThrowEvent.incoming.length).to.equal(1);
          expect(intermediateThrowEvent.incoming[0]).to.eql(sequenceFlow);

          // new outgoing connection
          expect(intermediateThrowEvent.outgoing.length).to.equal(1);
          expect(targetConnection).to.exist;
          expect(targetConnection.type).to.equal('bpmn:SequenceFlow');

          expect(startEvent.outgoing[0]).to.equal(intermediateThrowEvent.incoming[0]);
          expect(task.incoming[1]).to.equal(intermediateThrowEvent.outgoing[0]);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 2),
            { x: 340, y: 192 }
          ]));

          expect(sequenceFlow).to.have.endDocking({ x: 340, y: 210 });

          expect(targetConnection).to.have.waypoints(flatten([
            { x: 340, y: 228 },
            originalWaypoints.slice(2)
          ]));

          expect(targetConnection).to.have.startDocking({ x: 340, y: 210 });
        }
      ));


      it('should connect start -> target -> end (with bendpointBefore inside bbox)', inject(
        function(elementRegistry, selection, move, dragging) {

          // given
          var task3 = elementRegistry.get('Task_3'),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow),
              originalWaypoints = sequenceFlow.waypoints;

          // when
          selection.select(task3);

          move.start(canvasEvent({ x: 0, y: 0 }), task3);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: 149, y: -130 }));
          dragging.end();

          // then
          // split target but don't keep insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 2),
            { x: 340, y: 241 }
          ]));

          expect(sequenceFlow).to.have.endDocking({ x: 340, y: 281 });
        }
      ));


      it('should connect start -> target -> end (with bendpointAfter inside bbox)', inject(
        function(elementRegistry, selection, move, dragging) {

          // given
          var task3 = elementRegistry.get('Task_3'),
              sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow),
              originalWaypoints = sequenceFlow.waypoints;

          // when
          selection.select(task3);

          move.start(canvasEvent({ x: 0, y: 0 }), task3);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: 170, y: -110 }));
          dragging.end();

          // then
          // split target but don't keep insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 2),
            { x: 340, y: 261 }
          ]));

          expect(sequenceFlow).to.have.endDocking({ x: 340, y: 299 });
        }
      ));


      it('should connect start -> target -> end (keeping target outgoing flows)', inject(
        function(elementRegistry, selection, move, dragging) {

          // given
          var gateway_C = elementRegistry.get('Gateway_C'),
              task_B = elementRegistry.get('task_B'),
              sequenceFlow = elementRegistry.get('SequenceFlow_D'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow);

          // when
          selection.select(gateway_C);

          move.start(canvasEvent({ x: 0, y: 0 }), gateway_C);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: 160, y: -130 }));
          dragging.end();

          // then
          expect(gateway_C.outgoing).to.have.length(2);

          expect(gateway_C.outgoing[0].gateway_C).to.eql(task_B);
        }
      ));


      it('should connect start -> target', inject(
        function(modeling, elementRegistry, selection, move, dragging) {

          // given
          var endEventShape = elementRegistry.get('EndEvent_foo');

          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow),
              originalWaypoints = sequenceFlow.waypoints;

          // when
          selection.select(endEventShape);

          move.start(canvasEvent({ x: 0, y: 0 }), endEventShape);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: 150, y: 0 }));

          dragging.end();

          // then

          // new incoming connection
          expect(endEventShape.incoming.length).to.equal(1);
          expect(endEventShape.incoming[0]).to.eql(sequenceFlow);

          // no outgoing edges
          expect(endEventShape.outgoing.length).to.equal(0);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            originalWaypoints.slice(0, 2),
            { x: 340, y: 281 }
          ]));
        }
      ));


      it('should connect target -> end', inject(
        function(modeling, elementRegistry, dragging, selection, move) {

          var startEventShape = elementRegistry.get('StartEvent_foo');

          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow),
              originalWaypoints = sequenceFlow.waypoints;

          // when
          selection.select(startEventShape);

          move.start(canvasEvent({ x: 0, y: 0 }), startEventShape);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: -215, y: 0 }));

          dragging.end();

          // then

          // no incoming connection
          expect(startEventShape.incoming.length).to.equal(0);

          // 1 outgoing connection
          expect(startEventShape.outgoing.length).to.equal(1);
          expect(startEventShape.outgoing[0]).to.eql(sequenceFlow);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([
            { x: 338, y: 228 },
            originalWaypoints.slice(2)
          ]));
        }
      ));


      it('should undo', inject(
        function(modeling, elementRegistry, dragging, selection, move, commandStack) {

          // given
          var startEventShape = elementRegistry.get('StartEvent_foo');

          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow),
              originalWaypoints = sequenceFlow.waypoints;

          selection.select(startEventShape);

          move.start(canvasEvent({ x: 0, y: 0 }), startEventShape);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: -215, y: 0 }));

          dragging.end();

          // when
          commandStack.undo();

          // then

          // no incoming connection
          expect(startEventShape.incoming.length).to.equal(0);

          // no outgoing edges
          expect(startEventShape.outgoing.length).to.equal(0);

          // split target at insertion point
          expect(sequenceFlow).to.have.waypoints(flatten([ originalWaypoints ]));
        }
      ));


      it('should not insert on inaccuratly found intersection', inject(
        function(dragging, move, elementRegistry, selection) {

          // given
          var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_foo');

          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow);

          // when
          selection.select(intermediateThrowEvent);

          move.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

          dragging.hover({
            element: sequenceFlow,
            gfx: sequenceFlowGfx
          });

          dragging.move(canvasEvent({ x: 20, y: -90 }));

          dragging.end();

          // then
          expect(intermediateThrowEvent.incoming).to.have.lengthOf(0);
          expect(intermediateThrowEvent.outgoing).to.have.lengthOf(0);
        }
      ));


      it('should remove redundant flows', inject(
        function(elementRegistry, selection, move, dragging) {

          var existingIncoming = elementRegistry.get('SequenceFlow_3'),
              existingOutgoing = elementRegistry.get('SequenceFlow_4');

          // given
          var element = elementRegistry.get('Task_4');

          var targetFlow = elementRegistry.get('SequenceFlow_1'),
              targetFlowGfx = elementRegistry.getGraphics(targetFlow);

          // when
          selection.select(element);

          move.start(canvasEvent({ x: 0, y: 0 }), element);

          dragging.hover({
            element: targetFlow,
            gfx: targetFlowGfx
          });

          dragging.move(canvasEvent({ x: -40, y: 179 }));

          dragging.end();

          // then
          // existing connections are removed, as they are duplicates
          expect(element.incoming).not.to.contain(existingIncoming);
          expect(element.outgoing).not.to.contain(existingOutgoing);
        }
      ));

    });

  });


  describe('rules', function() {

    it('should be allowed for an IntermediateThrowEvent', inject(
      function(elementRegistry, bpmnRules, elementFactory) {

        // when
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');
        var intermediateThrowEvent = elementFactory.createShape({
          type: 'bpmn:IntermediateThrowEvent'
        });

        // then
        expect(bpmnRules.canCreate(intermediateThrowEvent, sequenceFlow)).to.be.true;
      }
    ));


    it('should not insert participant', inject(
      function(rules, elementRegistry, elementFactory) {

        // given
        var participantShape = elementFactory.createShape({
          type: 'bpmn:Participant'
        });

        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        var dropPosition = { x: 340, y: 120 }; // first bendpoint

        // when
        var canDrop = rules.allowed('shape.create', {
          shape: participantShape,
          parent: sequenceFlow,
          dropPosition: dropPosition
        });

        // then
        expect(canDrop).to.be.false;
      }
    ));


    it('should not insert multiple with "move"', inject(
      function(elementRegistry, selection, move, dragging) {

        // given
        var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_foo'),
            endEventShape = elementRegistry.get('EndEvent_foo');

        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow);

        var intInitPosition = {
              x: intermediateThrowEvent.x,
              y: intermediateThrowEvent.y
            },
            endInitPosition = {
              x: endEventShape.x,
              y: endEventShape.y
            };

        selection.select([ intermediateThrowEvent, endEventShape ]);

        // when
        move.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

        dragging.hover({
          element: sequenceFlow,
          gfx: sequenceFlowGfx
        });

        dragging.move(canvasEvent({ x: -215, y: 0 }));

        dragging.end();

        // then
        expect(intermediateThrowEvent).to.have.position(intInitPosition);
        expect(endEventShape).to.have.position(endInitPosition);
      }
    ));


    it('should not insert on sequence flow label', inject(
      function(bpmnRules, elementRegistry) {

        // given
        var eventShape = elementRegistry.get('IntermediateThrowEvent_foo'),
            sequenceFlowLabel = elementRegistry.get('SequenceFlow_2').label;

        var dropPosition = { x: 675, y: 275 }; // sequence flow label

        // when
        var canInsert = bpmnRules.canInsert(eventShape, sequenceFlowLabel, dropPosition);

        // then
        expect(canInsert).to.be.false;
      }
    ));

  });

});
