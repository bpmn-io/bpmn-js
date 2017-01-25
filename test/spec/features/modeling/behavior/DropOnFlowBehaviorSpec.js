'use strict';

require('../../../../TestHelper');

/* global inject, bootstrapModeler */

var flatten = require('lodash/array/flatten');

var coreModule = require('../../../../../lib/core'),
    moveModule = require('diagram-js/lib/features/move'),
    modelingModule = require('../../../../../lib/features/modeling'),
    noTouchInteractionModule = { touchInteractionEvents: ['value', null ] };

var canvasEvent = require('../../../../util/MockEvents').createCanvasEvent;


describe('modeling/behavior - drop on connection', function() {

  var diagramXML = require('./DropOnFlowBehavior.bpmn');

  var testModules = [ noTouchInteractionModule, moveModule, modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('rules', function() {

    it('should be allowed for an IntermediateThrowEvent', inject(function(elementRegistry, bpmnRules, elementFactory) {

      // when
      var sequenceFlow = elementRegistry.get('SequenceFlow');
      var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

      // then
      expect(bpmnRules.canCreate(intermediateThrowEvent, sequenceFlow)).to.be.true;
    }));

  });


  describe('execution', function() {

    describe('create', function() {

      it('should connect start -> target -> end', inject(function(modeling, elementRegistry, elementFactory) {

        // given
        var intermediateThrowEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

        var startEvent = elementRegistry.get('StartEvent'),
            sequenceFlow = elementRegistry.get('SequenceFlow'),
            task = elementRegistry.get('Task');

        var originalWaypoints = sequenceFlow.waypoints;

        var dropPosition = { x: 340, y: 120 }; // first bendpoint

        // when
        var newShape = modeling.createShape(intermediateThrowEvent, dropPosition, sequenceFlow);

        // then

        var targetConnection = newShape.outgoing[0];

        // new incoming connection
        expect(newShape.incoming.length).to.equal(1);
        expect(newShape.incoming[0]).to.eql(sequenceFlow);

        // new outgoing connection
        expect(newShape.outgoing.length).to.equal(1);
        expect(targetConnection).to.be.ok;
        expect(targetConnection.type).to.equal('bpmn:SequenceFlow');

        expect(startEvent.outgoing[0]).to.equal(newShape.incoming[0]);
        expect(task.incoming[0]).to.equal(newShape.outgoing[0]);

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
      }));


      it('should connect start -> target', inject(function(modeling, elementRegistry, elementFactory) {

        // given
        var endEventShape = elementFactory.createShape({ type: 'bpmn:EndEvent' });

        var sequenceFlow = elementRegistry.get('SequenceFlow');
        var originalWaypoints = sequenceFlow.waypoints;

        var dropPosition = { x: 340, y: 120 }; // first bendpoint

        // when
        var newShape = modeling.createShape(endEventShape, dropPosition, sequenceFlow);

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
      }));


      it('should connect target -> end', inject(function(modeling, elementRegistry, elementFactory) {

        // given
        var startEventShape = elementFactory.createShape({ type: 'bpmn:StartEvent' });

        var sequenceFlow = elementRegistry.get('SequenceFlow');
        var originalWaypoints = sequenceFlow.waypoints;

        var dropPosition = { x: 340, y: 120 }; // first bendpoint

        // when
        var newShape = modeling.createShape(startEventShape, dropPosition, sequenceFlow);

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
      }));

    });

    describe('move', function() {

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));

      it('should connect start -> target -> end', inject(function(dragging, move, elementRegistry, selection) {

        // given
        var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_foo');

        var startEvent = elementRegistry.get('StartEvent'),
            sequenceFlow = elementRegistry.get('SequenceFlow'),
            sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow),
            task = elementRegistry.get('Task');

        var originalWaypoints = sequenceFlow.waypoints;

        // when
        selection.select(intermediateThrowEvent);

        move.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

        dragging.hover({
          element: sequenceFlow,
          gfx: sequenceFlowGfx
        });

        dragging.move(canvasEvent({ x: 150, y: 0 }));

        dragging.end();

        // then
        var targetConnection = intermediateThrowEvent.outgoing[0];

        // new incoming connection
        expect(intermediateThrowEvent.incoming.length).to.equal(1);
        expect(intermediateThrowEvent.incoming[0]).to.eql(sequenceFlow);

        // new outgoing connection
        expect(intermediateThrowEvent.outgoing.length).to.equal(1);
        expect(targetConnection).to.be.ok;
        expect(targetConnection.type).to.equal('bpmn:SequenceFlow');

        expect(startEvent.outgoing[0]).to.equal(intermediateThrowEvent.incoming[0]);
        expect(task.incoming[0]).to.equal(intermediateThrowEvent.outgoing[0]);

        // split target at insertion point
        expect(sequenceFlow).to.have.waypoints(flatten([
          originalWaypoints.slice(0, 2),
          { x: 341, y: 192 }
        ]));

        expect(sequenceFlow).to.have.endDocking({ x: 341, y: 210 });

        expect(targetConnection).to.have.waypoints(flatten([
          { x: 341, y: 228 },
          originalWaypoints.slice(2)
        ]));

        expect(targetConnection).to.have.startDocking({ x: 341, y: 210 });
      }));


      it('should connect start -> target', inject(function(modeling, elementRegistry, selection, move, dragging) {

        // given
        var endEventShape = elementRegistry.get('EndEvent_foo');

        var sequenceFlow = elementRegistry.get('SequenceFlow'),
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
      }));


      it('should connect target -> end', inject(function(modeling, elementRegistry, dragging, selection, move) {

        var startEventShape = elementRegistry.get('StartEvent_foo');

        var sequenceFlow = elementRegistry.get('SequenceFlow'),
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

        // no outgoing edges
        expect(startEventShape.outgoing.length).to.equal(1);
        expect(startEventShape.outgoing[0]).to.eql(sequenceFlow);

        // split target at insertion point
        expect(sequenceFlow).to.have.waypoints(flatten([
          { x: 338, y: 228 },
          originalWaypoints.slice(2)
        ]));
      }));

    });

  });


  describe('rules', function() {

    it('should not insert participant', inject(function(rules, elementRegistry, elementFactory) {

      // given
      var participantShape = elementFactory.createShape({ type: 'bpmn:Participant' });

      var sequenceFlow = elementRegistry.get('SequenceFlow');

      var dropPosition = { x: 340, y: 120 }; // first bendpoint

      // when
      var canDrop = rules.allowed('shape.create', {
        shape: participantShape,
        parent: sequenceFlow,
        dropPosition: dropPosition
      });

      // then
      expect(canDrop).to.be.false;
    }));


    it('should not insert multiple with "move"', inject(function(elementRegistry, selection, move, dragging) {

      // given
      var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_foo'),
          endEventShape = elementRegistry.get('EndEvent_foo');

      var sequenceFlow = elementRegistry.get('SequenceFlow'),
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
    }));

  });

});
