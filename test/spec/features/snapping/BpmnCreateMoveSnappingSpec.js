import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';
import moveModule from 'diagram-js/lib/features/move';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';

import {
  isSnapped,
  mid
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import {
  DEFAULT_LABEL_SIZE,
  getExternalLabelMid
} from 'lib/util/LabelUtil';

import { queryAll as domQueryAll } from 'min-dom';

import { attr as svgAttr } from 'tiny-svg';


describe('features/snapping - BpmnCreateMoveSnapping', function() {

  var testModules = [
    coreModule,
    createModule,
    modelingModule,
    moveModule,
    rulesModule,
    snappingModule,
    {
      __init__: [ function(dragging) {
        dragging.setOptions({ manual: true });
      } ]
    }
  ];


  describe('create participant', function() {

    describe('process', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.process.bpmn');


      it('should snap particpant if constrained', function(done) {

        bootstrapModeler(diagramXML, {
          container: TestContainer.get(this),
          modules: testModules
        })().then(function() {

          // when
          inject(function(canvas, create, dragging, elementFactory, eventBus) {

            // given
            dragging.setOptions({ manual: true });

            var participantShape = elementFactory.createParticipantShape(false),
                rootElement = canvas.getRootElement(),
                rootGfx = canvas.getGraphics(rootElement);

            create.start(canvasEvent({ x: 0, y: 0 }), participantShape);

            dragging.hover({ element: rootElement, gfx: rootGfx });

            eventBus.once('create.move', function(event) {

              // then
              // expect snapped to avoid snapping outside of constraints
              expect(isSnapped(event)).to.be.true;

              done();
            });

            // when
            dragging.move(canvasEvent({ x: 1000, y: 1000 }));
          })();

        });

      });

    });


    describe('collaboration', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.collaboration.bpmn');


      it('should snap to participant border with higher priority', function(done) {

        var container = TestContainer.get(this);

        bootstrapModeler(diagramXML, {
          container: container,
          modules: testModules
        })().then(function() {

          // when
          inject(function(create, dragging, elementFactory, elementRegistry, eventBus) {

            // given
            dragging.setOptions({ manual: true });

            var participant = elementFactory.createParticipantShape(false),
                collaboration = elementRegistry.get('Collaboration_1'),
                collaborationGfx = elementRegistry.getGraphics(collaboration);

            create.start(canvasEvent({ x: 0, y: 0 }), participant);

            dragging.hover({ element: collaboration, gfx: collaborationGfx });

            dragging.move(canvasEventTopLeft({ x: 0, y: 0 }, participant));

            eventBus.once('create.move', function(event) {

              // then
              // expect snap line at left border of participant
              expect(svgAttr(domQueryAll('.djs-snap-line', container)[1], 'd'))
                .to.equal('M 100,-100000 L 100, +100000');

              done();
            });

            // when
            dragging.move(canvasEventTopLeft({ x: 95, y: 400 }, participant));
          })();

        });

      });

    });

  });


  describe('boundary events', function() {

    describe('creating boundary event', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.process.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));

      var task, taskGfx, intermediateThrowEvent;


      describe('without label', function() {

        beforeEach(inject(function(create, dragging, elementRegistry, elementFactory) {
          task = elementRegistry.get('Task_1');

          taskGfx = elementRegistry.getGraphics(task);

          intermediateThrowEvent = elementFactory.createShape({
            type: 'bpmn:IntermediateThrowEvent'
          });

          create.start(canvasEvent({ x: 0, y: 0 }), intermediateThrowEvent);

          dragging.hover({ element: task, gfx: taskGfx });
        }));


        it('should snap to top', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 150, y: 95 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 150,
            y: 100 // 95 snapped to 100
          });
        }));


        it('should snap to right', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 195, y: 140 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 200, // 195 snapped to 200
            y: 140
          });
        }));


        it('should snap to bottom', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 150, y: 175 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 150,
            y: 180 // 175 snapped to 180
          });
        }));


        it('should snap to left', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 95, y: 140 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 100, // 95 snapped to 100
            y: 140
          });
        }));
      });


      describe('with label', function() {

        beforeEach(inject(function(
            bpmnFactory,
            create,
            dragging,
            elementFactory,
            elementRegistry,
            textRenderer
        ) {
          task = elementRegistry.get('Task_1');

          taskGfx = elementRegistry.getGraphics(task);

          intermediateThrowEvent = elementFactory.createShape({
            businessObject: bpmnFactory.create('bpmn:IntermediateThrowEvent', {
              name: 'Foo'
            }),
            type: 'bpmn:IntermediateThrowEvent',
            x: 0,
            y: 0
          });

          var externalLabelMid = getExternalLabelMid(intermediateThrowEvent);

          var externalLabelBounds = textRenderer.getExternalLabelBounds(DEFAULT_LABEL_SIZE, 'Foo');

          var label = elementFactory.createLabel({
            labelTarget: intermediateThrowEvent,
            x: externalLabelMid.x - externalLabelBounds.width / 2,
            y: externalLabelMid.y - externalLabelBounds.height / 2,
            width: externalLabelBounds.width,
            height: externalLabelBounds.height
          });

          create.start(canvasEvent({ x: 0, y: 0 }), [ intermediateThrowEvent, label ]);

          dragging.hover({ element: task, gfx: taskGfx });
        }));


        it('should snap to top-left', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 90, y: 95 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 100, // 90 snapped to 100
            y: 100 // 95 snapped to 100
          });
        }));


        it('should snap to top-right', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 210, y: 95 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 200, // 210 snapped to 200
            y: 100 // 95 snapped to 100
          });
        }));


        it('should snap to bottom-left', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 90, y: 190 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 100, // 90 snapped to 100
            y: 180 // 190 snapped to 180
          });
        }));


        it('should snap to bottom-right', inject(function(dragging) {

          // when
          dragging.move(canvasEvent({ x: 210, y: 190 }));

          dragging.end();

          // then
          var boundaryEvent = getBoundaryEvent(task);

          expect(mid(boundaryEvent)).to.eql({
            x: 200, // 210 snapped to 200
            y: 180 // 190 snapped to 180
          });
        }));
      });

    });


    describe('snapping to boundary events', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.boundary-events.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));

      var task;

      beforeEach(inject(function(dragging, elementRegistry, move) {
        task = elementRegistry.get('Task_1');

        var process = elementRegistry.get('Process_1'),
            processGfx = elementRegistry.getGraphics(process);

        move.start(canvasEventTopLeft({ x: 100, y: 400 }, task), task, true);

        dragging.hover({ element: process, gfx: processGfx });

        dragging.move(canvasEventTopLeft({ x: 100, y: 400 }, task));
      }));


      it('should snap to boundary events', inject(function(dragging) {

        // when
        dragging.move(canvasEventTopLeft({ x: 245, y: 400 }, task));

        dragging.end();

        // then
        expect(task).to.have.bounds({
          x: 250, // 245 snapped to 250
          y: 400,
          width: 100,
          height: 80
        });
      }));

    });

  });


  describe('sequence flows', function() {

    var diagramXML = require('./BpmnCreateMoveSnapping.sequence-flows.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var sequenceFlow, sequenceFlowGfx, task;

    beforeEach(inject(function(create, dragging, elementRegistry, elementFactory) {
      sequenceFlow = elementRegistry.get('SequenceFlow_1');
      sequenceFlowGfx = elementRegistry.getGraphics(sequenceFlow);

      task = elementFactory.createShape({
        type: 'bpmn:Task'
      });

      create.start(canvasEvent({ x: 0, y: 0 }), task);

      dragging.hover({ element: sequenceFlow, gfx: sequenceFlowGfx });
    }));


    it('should add snap targets of sequence flow parent', inject(function(dragging) {

      // when
      dragging.move(canvasEventTopLeft({ x: 195, y: 60 }, task));

      dragging.end();

      // then
      expect(task).to.have.bounds({
        x: 200, // 195 snapped to 200
        y: 60,
        width: 100,
        height: 80
      });
    }));

  });


  describe('lanes', function() {

    var diagramXML = require('./BpmnCreateMoveSnapping.collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var task;

    beforeEach(inject(function(dragging, elementRegistry, move) {
      task = elementRegistry.get('Task_1');

      move.start(canvasEvent({ x: 200, y: 165 }), task);
    }));


    it('should should NOT snap to lanes', inject(function(dragging) {

      // when
      // lane mid is { x: 415, y: 162.5 }
      dragging.move(canvasEvent({ x: 410, y: 160 }));

      dragging.end();

      // then
      expect(task).to.have.bounds({
        x: 360,
        y: 120,
        width: 100,
        height: 80
      });
    }));

  });


  describe('docking points', function() {

    describe('move mode', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.docking-points.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));

      var participant,
          participantGfx;

      beforeEach(inject(function(dragging, elementRegistry, move) {
        participant = elementRegistry.get('Participant_2');
        participantGfx = elementRegistry.getGraphics(participant);
      }));

      it('should snap to docking point (incoming connections)', inject(
        function(dragging, elementRegistry, move) {

          // given
          var task = elementRegistry.get('Task_2');

          move.start(canvasEvent({ x: 400, y: 540 }), task);

          dragging.hover({ element: participant, gfx: participantGfx });

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          // when
          dragging.move(canvasEvent({ x: 270, y: 540 }));

          dragging.end();

          // then
          expect(mid(task)).to.eql({
            x: 275,
            y: 540
          });
        }
      ));


      it('should snap to docking point (outgoing connections)', inject(
        function(dragging, elementRegistry, move) {

          // given
          var task = elementRegistry.get('Task_4');

          move.start(canvasEvent({ x: 600, y: 540 }), task);

          dragging.hover({ element: participant, gfx: participantGfx });

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          // when
          dragging.move(canvasEvent({ x: 475, y: 540 }));

          dragging.end();

          // then
          expect(mid(task)).to.eql({
            x: 480,
            y: 540
          });
        }
      ));
    });


    describe('create mode', function() {

      var diagramXML = require('./BpmnCreateMoveSnapping.docking-create-mode.bpmn');


      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should correctly set snap origins', function(done) {

        var test = inject(function(elementRegistry, copyPaste, eventBus) {

          // given
          var task1 = elementRegistry.get('Task_1');
          eventBus.on('create.start', function(event) {

            var snapContext = event.context.snapContext;
            var snapLocations = snapContext.getSnapLocations();
            var sequenceFlowSnapOrigin = snapContext.getSnapOrigin(snapLocations[3]);

            // then
            try {
              expect(sequenceFlowSnapOrigin.x).to.be.eql(-30);
              expect(sequenceFlowSnapOrigin.y).to.be.eql(-10);

              done();
            } catch (error) {
              done(error);
            }
          });

          // when
          copyPaste.copy(task1);
          copyPaste.paste();

        });

        test();
      });
    });
  });


  describe('TRBL snapping', function() {

    var diagramXML = require('./BpmnCreateMoveSnapping.trbl-snapping.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    function get(element) {
      return getBpmnJS().invoke(function(elementRegistry) {
        return elementRegistry.get(element);
      });
    }

    function absoluteMove(element, toPosition) {

      getBpmnJS().invoke(function(elementRegistry, move, dragging, canvas) {

        var parent = element.parent;

        move.start(canvasEvent({ x: 0, y: 0 }), element);

        dragging.hover({
          element: parent,
          gfx: canvas.getGraphics(parent)
        });

        dragging.move(canvasEvent({ x: 100, y: 100 }), element);

        dragging.move(canvasEvent({
          x: toPosition.x - element.x,
          y: toPosition.y - element.y
        }));

        dragging.end();
      });

    }


    it('should snap text annotations', function() {

      // given
      var annotation = get('TEXT_1');
      var otherAnnotation = get('TEXT_2');

      // when
      absoluteMove(annotation, {
        x: otherAnnotation.x + 5,
        y: otherAnnotation.y - 5
      });

      // then
      expect(annotation).to.have.position(otherAnnotation);
    });


    it('should snap task to container', function() {

      // given
      var task = get('TASK');
      var subProcess = get('SUB_PROCESS_1');

      // when
      absoluteMove(task, {
        x: subProcess.x,
        y: subProcess.y - 5
      });

      // then
      expect(task).to.have.position(subProcess);
    });


    it('should snap container to container', function() {

      // given
      var participant = get('PARTICIPANT_1');
      var otherParticipant = get('PARTICIPANT_2');

      // when
      absoluteMove(participant, {
        x: otherParticipant.x + 5,
        y: otherParticipant.y
      });

      // then
      expect(participant).to.have.position(otherParticipant);
    });


    it('should snap container to container right', function() {

      // given
      var participant = get('PARTICIPANT_1');
      var otherParticipant = get('PARTICIPANT_2');

      // when
      absoluteMove(participant, {
        x: otherParticipant.x + otherParticipant.width - participant.width + 5,
        y: 5
      });

      // then
      expect(participant).to.have.position({
        x: otherParticipant.x + otherParticipant.width - participant.width,
        y: 5
      });

    });

  });

});

// helpers //////////

function canvasEventTopLeft(position, shape) {
  return canvasEvent({
    x: position.x + shape.width / 2,
    y: position.y + shape.height / 2
  });
}

function getBoundaryEvent(element) {
  return element.attachers[0];
}
