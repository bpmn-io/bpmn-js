import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import coreModule from 'lib/core';
import snappingModule from 'lib/features/snapping';
import modelingModule from 'lib/features/modeling';
import createModule from 'diagram-js/lib/features/create';
import resizeModule from 'diagram-js/lib/features/resize';
import moveModule from 'diagram-js/lib/features/move';
import rulesModule from 'lib/features/rules';
import connectModule from 'diagram-js/lib/features/connect';


describe('features/snapping - BpmnSnapping', function() {

  var testModules = [
    coreModule,
    snappingModule,
    modelingModule,
    createModule,
    rulesModule,
    moveModule,
    connectModule
  ];

  describe('on Boundary Events', function() {

    var diagramXML = require('../../../fixtures/bpmn/collaboration/process.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var task, intermediateThrowEvent;

    beforeEach(inject(function(elementFactory, elementRegistry, dragging) {
      task = elementRegistry.get('Task_1');

      intermediateThrowEvent = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent'
      });

      dragging.setOptions({ manual: true });
    }));

    afterEach(inject(function(dragging) {
      dragging.setOptions({ manual: false });
    }));


    it('should snap on create to the bottom',
      inject(function(canvas, create, dragging, elementRegistry) {

        // given
        var taskGfx = canvas.getGraphics(task);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

        dragging.hover({ element: task, gfx: taskGfx });

        dragging.move(canvasEvent({ x: 382, y: 170 }));
        dragging.end();

        var boundaryEvent = elementRegistry.get(task.attachers[0].id);

        // then
        expect(boundaryEvent).to.have.bounds({ x: 364, y: 167, width: 36, height: 36 });
      })
    );


    it('should snap on create to the left',
      inject(function(canvas, create, dragging, elementRegistry) {

        // given
        var taskGfx = canvas.getGraphics(task);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

        dragging.hover({ element: task, gfx: taskGfx });

        dragging.move(canvasEvent({ x: 382, y: 115 }));
        dragging.end();

        var boundaryEvent = elementRegistry.get(task.attachers[0].id);

        // then
        expect(boundaryEvent).to.have.bounds({ x: 364, y: 87, width: 36, height: 36 });
      })
    );

  });


  describe('on Sequence Flows', function() {

    var diagramXML = require('./BpmnSnapping.sequenceFlow.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var sequenceFlow, task;

    beforeEach(inject(function(elementFactory, elementRegistry, dragging) {
      sequenceFlow = elementRegistry.get('SequenceFlow_1');

      task = elementFactory.createShape({
        type: 'bpmn:Task'
      });

      dragging.setOptions({ manual: true });
    }));

    afterEach(inject(function(dragging) {
      dragging.setOptions({ manual: false });
    }));


    it('should snap vertically',
      inject(function(canvas, create, dragging) {

        // given
        var sequenceFlowGfx = canvas.getGraphics(sequenceFlow);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), task);

        dragging.hover({ element: sequenceFlow, gfx: sequenceFlowGfx });

        dragging.move(canvasEvent({ x: 300, y: 245 }));
        dragging.end();

        // then
        expect(task.x).to.eql(254);
      })
    );


    it('should snap horizontally',
      inject(function(canvas, create, dragging) {

        // given
        var sequenceFlowGfx = canvas.getGraphics(sequenceFlow);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), task);

        dragging.hover({ element: sequenceFlow, gfx: sequenceFlowGfx });

        dragging.move(canvasEvent({ x: 410, y: 320 }));
        dragging.end();

        // then
        expect(task.y).to.eql(285);
      })
    );


    it('should NOT snap shape to first waypoint',
      inject(function(canvas, elementRegistry, move, dragging) {

        // given
        var shape = elementRegistry.get('StartEvent_1');

        var originalPosition = {
          x: shape.x,
          y: shape.y
        };

        var rootElement = canvas.getRootElement();

        // when
        move.start(canvasEvent(originalPosition), shape);

        dragging.hover({
          element: rootElement,
          gfx: canvas.getGraphics(rootElement)
        });

        dragging.move(canvasEvent({
          x: originalPosition.x + 10,
          y: originalPosition.y
        }));

        dragging.move(canvasEvent({
          x: originalPosition.x + 20,
          y: originalPosition.y - 5
        }));

        dragging.end();

        // then
        // no horizontal snap
        expect(shape.x).to.eql(originalPosition.x + 20);

        // vertical snap though!
        expect(shape.y).to.eql(originalPosition.y);
      })
    );


    it('should NOT snap shape to last waypoint',
      inject(function(canvas, elementRegistry, move, dragging) {

        // given
        var shape = elementRegistry.get('Task_1');

        var originalPosition = {
          x: shape.x,
          y: shape.y
        };

        var rootElement = canvas.getRootElement();

        // when
        move.start(canvasEvent(originalPosition), shape);

        dragging.hover({
          element: rootElement,
          gfx: canvas.getGraphics(rootElement)
        });

        dragging.move(canvasEvent({
          x: originalPosition.x,
          y: originalPosition.y - 10
        }));

        dragging.move(canvasEvent({
          x: originalPosition.x + 5,
          y: originalPosition.y - 20
        }));

        dragging.end();

        // then
        // no vertical snap
        expect(shape.y).to.eql(originalPosition.y - 20);

        // horizontal snap though!
        expect(shape.x).to.eql(originalPosition.x);
      })
    );
  });


  describe('on Participant create', function() {

    describe('in non-empty process', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/process.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should snap to process children bounds / top left',
        inject(function(canvas, create, dragging, elementFactory) {

          // given
          var participantShape = elementFactory.createParticipantShape(false),
              rootElement = canvas.getRootElement(),
              rootGfx = canvas.getGraphics(rootElement);

          // when
          create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

          dragging.hover({ element: rootElement, gfx: rootGfx });

          dragging.move(canvasEvent({ x: 65, y: 65 }));
          dragging.end(canvasEvent({ x: 65, y: 65 }));

          // then
          expect(participantShape).to.have.bounds({
            width: 600, height: 250, x: 18, y: -8
          });
        })
      );


      it('should snap to process children bounds / bottom right',
        inject(function(canvas, create, dragging, elementFactory) {

          // given
          var participantShape = elementFactory.createParticipantShape(false),
              rootElement = canvas.getRootElement(),
              rootGfx = canvas.getGraphics(rootElement);

          // when
          create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

          dragging.hover({ element: rootElement, gfx: rootGfx });

          dragging.move(canvasEvent({ x: 400, y: 400 }));
          dragging.end(canvasEvent({ x: 400, y: 400 }));

          // then
          expect(participantShape).to.have.bounds({
            width: 600, height: 250, x: 100, y: 52
          });
        })
      );

    });


    describe('in empty process', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/process-empty.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should not snap', inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 400, y: 400 }));
        dragging.end(canvasEvent({ x: 400, y: 400 }));

        // then
        expect(participantShape).to.have.bounds({
          x: 100, y: 275, width: 600, height: 250
        });
      }));

    });


    describe('in collaboration', function() {

      var diagramXML = require('../../../fixtures/bpmn/collaboration/collaboration-participant.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should not snap to diagram contents', inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 400, y: 400 }));
        dragging.end(canvasEvent({ x: 400, y: 400 }));

        // then
        expect(participantShape).to.have.bounds({
          x: 100, y: 275, width: 600, height: 250
        });
      }));


      it('should snap to participant border', inject(function(canvas, create, dragging, elementFactory) {

        // given
        var participantShape = elementFactory.createParticipantShape(false),
            rootElement = canvas.getRootElement(),
            rootGfx = canvas.getGraphics(rootElement);

        // when
        create.start(canvasEvent({ x: 50, y: 50 }), participantShape);

        dragging.hover({ element: rootElement, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 390, y: 400 }));
        dragging.end(canvasEvent({ x: 390, y: 400 }));

        // then
        expect(participantShape).to.have.bounds({
          x: 84, y: 275, width: 600, height: 250
        });
      }));

    });

  });


  describe('on Participant resize', function() {

    describe('snap min bounds', function() {

      var diagramXML = require('./BpmnSnapping.participant-resize.bpmn');

      var testResizeModules = [
        coreModule,
        resizeModule,
        modelingModule,
        rulesModule,
        snappingModule
      ];

      beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


      it('should snap to children from <se>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_2');

        resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(482);
        expect(participant.height).to.equal(252);
      }));


      it('should snap to children from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_2');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(467);
        expect(participant.height).to.equal(287);
      }));


      it('should snap to min dimensions from <se>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_1');

        resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(300);
        expect(participant.height).to.equal(60);
      }));


      it('should snap to min dimensions from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_1');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(300);
        expect(participant.height).to.equal(60);
      }));


      it('should snap to min dimensions + children from <se>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_3');

        resize.activate(canvasEvent({ x: 500, y: 500 }), participant, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        expect(participant.width).to.equal(305);

        // snap to children rather than min dimensions
        expect(participant.height).to.equal(143);
      }));


      it('should snap to min dimensions + children from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant_3');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(353);
        expect(participant.height).to.equal(177);
      }));

    });


    describe('snap child lanes', function() {

      var diagramXML = require('./BpmnSnapping.lanes-resize.bpmn');

      var testResizeModules = [
        coreModule,
        resizeModule,
        modelingModule,
        rulesModule,
        snappingModule
      ];

      beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


      it('should snap to child lanes from <nw>', inject(function(elementRegistry, resize, dragging) {

        var participant = elementRegistry.get('Participant');

        resize.activate(canvasEvent({ x: 0, y: 0 }), participant, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        expect(participant.width).to.equal(563);
        expect(participant.height).to.equal(223);
      }));


      it('should snap to nested child lanes from <se>', inject(function(elementRegistry, resize, dragging) {

        var lane = elementRegistry.get('Lane_B_0');

        resize.activate(canvasEvent({ x: 0, y: 0 }), lane, 'se');
        dragging.move(canvasEvent({ x: -500, y: -500 }));
        dragging.end();

        expect(lane.width).to.equal(313);
        expect(lane.height).to.equal(122);
      }));

    });

  });


  describe('on SubProcess resize', function() {

    var diagramXML = require('./BpmnSnapping.subProcess-resize.bpmn');

    var testResizeModules = [
      coreModule,
      modelingModule,
      resizeModule,
      rulesModule,
      snappingModule
    ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


    it('should snap to minimum bounds', inject(function(elementRegistry, resize, dragging) {

      var subProcess = elementRegistry.get('SubProcess');

      resize.activate(canvasEvent({ x: 0, y: 0 }), subProcess, 'se');
      dragging.move(canvasEvent({ x: -400, y: -400 }));
      dragging.end();

      expect(subProcess.width).to.equal(140);
      expect(subProcess.height).to.equal(120);
    }));

  });


  describe('on TextAnnotation resize', function() {

    var diagramXML = require('./BpmnSnapping.textAnnotation-resize.bpmn');

    var testResizeModules = [
      coreModule,
      modelingModule,
      resizeModule,
      rulesModule,
      snappingModule
    ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testResizeModules }));


    it('should snap to minimum bounds', inject(function(elementRegistry, resize, dragging) {

      var textAnnotation = elementRegistry.get('TextAnnotation');

      resize.activate(canvasEvent({ x: 0, y: 0 }), textAnnotation, 'se');
      dragging.move(canvasEvent({ x: -400, y: -400 }));
      dragging.end();

      expect(textAnnotation.width).to.equal(50);
      expect(textAnnotation.height).to.equal(30);
    }));

  });


  describe('labels', function() {

    var diagramXML = require('./BpmnSnapping.labels.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    it('should snap to start events', inject(function(canvas, elementRegistry, move, dragging) {

      var label = elementRegistry.get('StartEvent_1_label'),
          rootElement = canvas.getRootElement();

      var originalPosition = { x: label.x, y: label.y };

      move.start(canvasEvent({ x: label.x + 3, y: label.y + 3 }), label);

      dragging.hover({
        element: rootElement,
        gfx: elementRegistry.getGraphics(rootElement)
      });

      dragging.move(canvasEvent({ x: label.x + 4, y: label.y + 40 }));
      dragging.move(canvasEvent({ x: label.x + 4, y: label.y + 40 }));

      dragging.end();

      expect(label.x).to.be.within(originalPosition.x, originalPosition.x + 1);
    }));


    it('should snap to boundary events', inject(function(canvas, elementRegistry, move, dragging) {

      var label = elementRegistry.get('BoundaryEvent_1_label'),
          rootElement = canvas.getRootElement();

      var originalPosition = { x: label.x, y: label.y };

      move.start(canvasEvent({ x: label.x + 2, y: label.y + 2 }), label);

      dragging.hover({
        element: rootElement,
        gfx: elementRegistry.getGraphics(rootElement)
      });

      dragging.move(canvasEvent({ x: label.x + 4, y: label.y + 40 }));
      dragging.move(canvasEvent({ x: label.x + 4, y: label.y + 40 }));

      dragging.end();

      expect(label.x).to.be.within(originalPosition.x, originalPosition.x + 1);
    }));


    it('should snap to siblings', inject(function(canvas, elementRegistry, move, dragging) {

      var label = elementRegistry.get('BoundaryEvent_1_label'),
          task = elementRegistry.get('Task_1'),
          rootElement = canvas.getRootElement();

      move.start(canvasEvent({ x: label.x + 2, y: label.y + 2 }), label);

      dragging.hover({
        element: rootElement,
        gfx: elementRegistry.getGraphics(rootElement)
      });

      dragging.move(canvasEvent({ x: label.x-23, y: label.y+40 }));
      dragging.move(canvasEvent({ x: label.x-23, y: label.y+40 }));

      dragging.end();

      var labelCenterX = label.x + Math.ceil(label.width / 2),
          taskCenterX = task.x + Math.ceil(task.width / 2);

      expect(labelCenterX).to.equal(taskCenterX);
    }));

  });


  describe('on connect', function() {

    var diagramXML = require('./BpmnSnapping.connect.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    describe('sequence flow', function() {

      it('should snap on global connect', inject(function(connect, dragging, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            task = elementRegistry.get('Task_1');

        var mid = {
          x: startEvent.x + startEvent.width / 2,
          y: startEvent.y + startEvent.height / 2
        };

        // when
        connect.start(canvasEvent({ x: mid.x + 10, y: mid.y + 10 }), startEvent);

        dragging.hover({
          element: task,
          gfx: elementRegistry.getGraphics(task)
        });

        dragging.move(canvasEvent({
          x: task.x + task.width / 2,
          y: task.y + task.height / 2
        }));

        dragging.end();

        // then
        var expected = [
          {
            original:
            {
              x: startEvent.x + startEvent.width / 2,
              y: startEvent.y + startEvent.height / 2
            },
            x: startEvent.x + startEvent.width,
            y: startEvent.y + startEvent.height / 2
          },
          {
            original:
            {
              x: task.x + task.width / 2,
              y: task.y + task.height / 2
            },
            x: task.x,
            y: task.y + task.height / 2
          }
        ];

        expect(startEvent.outgoing[0].waypoints).to.eql(expected);

      }));


      it('should snap on connect', inject(function(connect, dragging, elementRegistry) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            task = elementRegistry.get('Task_1');

        var mid = { x: task.x + task.width / 2, y: task.y + task.height / 2 };

        // when
        connect.start(canvasEvent({ x: 0, y: 0 }), startEvent);

        dragging.hover({
          element: task,
          gfx: elementRegistry.getGraphics(task)
        });

        dragging.move(canvasEvent({ x: mid.x + 10, y: mid.y + 10 }));

        dragging.end();

        // then
        var expected = [
          {
            original:
            {
              x: startEvent.x + startEvent.width / 2,
              y: startEvent.y + startEvent.height / 2
            },
            x: startEvent.x + startEvent.width,
            y: startEvent.y + startEvent.height / 2
          },
          {
            original:
            {
              x: task.x + task.width / 2,
              y: task.y + task.height / 2
            },
            x: task.x,
            y: task.y + task.height / 2
          }
        ];

        expect(startEvent.outgoing[0].waypoints).to.eql(expected);

      }));

    });


    it('should snap data output association', inject(function(connect, dragging, elementRegistry) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1'),
          dataObjectReference = elementRegistry.get('DataObjectReference_1');

      var mid = { x: dataObjectReference.x + dataObjectReference.width / 2, y: dataObjectReference.y + dataObjectReference.height / 2 };

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), startEvent);

      dragging.hover({
        element: dataObjectReference,
        gfx: elementRegistry.getGraphics(dataObjectReference)
      });

      dragging.move(canvasEvent({ x: mid.x + 10, y: mid.y + 10 }));

      dragging.end();

      // then
      var expected = [
        {
          original:
          {
            x: startEvent.x + startEvent.width / 2,
            y: startEvent.y + startEvent.height / 2
          },
          x: startEvent.x + startEvent.width,
          y: startEvent.y + startEvent.height / 2
        },
        {
          original:
          {
            x: dataObjectReference.x + dataObjectReference.width / 2,
            y: dataObjectReference.y + dataObjectReference.height / 2
          },
          x: dataObjectReference.x,
          y: dataObjectReference.y + dataObjectReference.height / 2
        }
      ];

      expect(startEvent.outgoing[0].waypoints).to.eql(expected);

    }));


    it('should snap data input association', inject(function(connect, dragging, elementRegistry) {

      // given
      var dataStoreReference = elementRegistry.get('DataStoreReference_1'),
          task = elementRegistry.get('Task_2');

      var mid = { x: task.x + task.width / 2, y: task.y + task.height / 2 };

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), dataStoreReference);

      dragging.hover({
        element: task,
        gfx: elementRegistry.getGraphics(task)
      });

      dragging.move(canvasEvent({ x: mid.x + 10, y: mid.y + 10 }));

      dragging.end();

      // then
      var expected = [
        {
          original:
          {
            x: dataStoreReference.x + dataStoreReference.width / 2,
            y: dataStoreReference.y + dataStoreReference.height / 2
          },
          x: dataStoreReference.x + dataStoreReference.width,
          y: dataStoreReference.y + dataStoreReference.height / 2
        },
        {
          original:
          {
            x: task.x + task.width / 2,
            y: task.y + task.height / 2
          },
          x: task.x,
          y: task.y + task.height / 2
        }
      ];

      expect(dataStoreReference.outgoing[0].waypoints).to.eql(expected);

    }));


    describe('message flow', function() {

      it('should NOT snap Task -> Task on global connect', inject(function(connect, dragging, elementRegistry) {

        // given
        var task1 = elementRegistry.get('Task_1'),
            task2 = elementRegistry.get('Task_2');

        var task1Mid = { x: task1.x + task1.width / 2, y: task1.y + task1.height / 2 },
            task2Mid = { x: task2.x + task2.width / 2, y: task2.y + task2.height / 2 };

        // when
        connect.start(null, task1, { x: 320, y: task1Mid.y + 20 });

        dragging.hover({
          element: task2,
          gfx: elementRegistry.getGraphics(task2)
        });

        dragging.move(canvasEvent({
          x: 320,
          y: task2Mid.y - 20
        }));

        dragging.end();

        // then
        var expected = [
          {
            original:
            {
              x: 320,
              y: task1Mid.y + 20
            },
            x: 320,
            y: task1.y + task1.height
          },
          {
            original:
            {
              x: 320,
              y: task2Mid.y - 20
            },
            x: 320,
            y: task2.y
          }
        ];

        expect(task1.outgoing[0].waypoints).to.eql(expected);

      }));


      it('should NOT snap Task -> Task on connect', inject(function(connect, dragging, elementRegistry) {

        // given
        var task1 = elementRegistry.get('Task_1'),
            task2 = elementRegistry.get('Task_2');

        var task1Mid = { x: task1.x + task1.width / 2, y: task1.y + task1.height / 2 },
            task2Mid = { x: task2.x + task2.width / 2, y: task2.y + task2.height / 2 };

        // when
        connect.start(canvasEvent({ x: 0, y: 0 }), task1);

        dragging.hover({
          element: task2,
          gfx: elementRegistry.getGraphics(task2)
        });

        dragging.move(canvasEvent({
          x: task2Mid.x + 20,
          y: task2Mid.y - 20
        }));

        dragging.end();

        // then
        expect(task1.outgoing[0].waypoints.length).to.equal(4);

        expect(task1.outgoing[0].waypoints[0]).to.eql({
          original:
          {
            x: task1Mid.x,
            y: task1Mid.y
          },
          x: task1Mid.x,
          y: task1.y + task1.height
        });

        expect(task1.outgoing[0].waypoints[3]).to.eql({
          original:
          {
            x: task2Mid.x + 20,
            y: task2Mid.y - 20
          },
          x: task2Mid.x + 20,
          y: task2.y
        });

      }));


      it('should snap Task -> Event on connect', inject(function(connect, dragging, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_2'),
            event = elementRegistry.get('StartEvent_1');

        var taskMid = { x: task.x + task.width / 2, y: task.y + task.height / 2 },
            eventMid = { x: event.x + event.width / 2, y: event.y + event.height / 2 };

        // when
        connect.start(canvasEvent({ x: 0, y: 0 }), task);

        dragging.hover({
          element: event,
          gfx: elementRegistry.getGraphics(event)
        });

        dragging.move(canvasEvent({
          x: eventMid.x + 10,
          y: eventMid.y - 10
        }));

        dragging.end();

        // then
        var connection = task.outgoing[0];

        expect(connection.waypoints.length).to.equal(4);

        expect(connection.waypoints[0]).to.eql({
          original:
          {
            x: taskMid.x,
            y: taskMid.y
          },
          x: taskMid.x,
          y: task.y
        });

        expect(connection.waypoints[3]).to.eql({
          original:
          {
            x: eventMid.x,
            y: eventMid.y
          },
          x: eventMid.x,
          y: event.y + event.height
        });

      }));


      it('should snap IntermediateEvent -> Task on global connect', inject(function(connect, dragging, elementRegistry) {

        // given
        var event = elementRegistry.get('IntermediateEvent'),
            task = elementRegistry.get('Task_1');

        var eventMid = { x: event.x + event.width / 2, y: event.y + event.height / 2 },
            taskMid = { x: task.x + task.width / 2, y: task.y + task.height / 2 };

        // when
        connect.start(null, event, { x: eventMid.x - 10, y: eventMid.y + 10 });

        dragging.hover({
          element: task,
          gfx: elementRegistry.getGraphics(task)
        });

        dragging.move(canvasEvent({
          x: taskMid.x + 10,
          y: taskMid.y - 10
        }));

        dragging.end();

        // then
        var connection = event.outgoing[0];

        expect(connection.waypoints.length).to.equal(4);

        expect(connection.waypoints[0]).to.eql({
          original:
          {
            x: eventMid.x,
            y: eventMid.y
          },
          x: eventMid.x,
          y: event.y
        });

        expect(connection.waypoints[3]).to.eql({
          original:
          {
            x: taskMid.x + 10,
            y: taskMid.y - 10
          },
          x: taskMid.x + 10,
          y: task.y + task.height
        });

      }));

    });

  });

});
