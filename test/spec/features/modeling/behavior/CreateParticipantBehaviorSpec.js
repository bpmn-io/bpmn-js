import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'diagram-js/lib/features/create';
import modelingModule from 'lib/features/modeling';

import {
  getBBox
} from 'diagram-js/lib/util/Elements';

import { asTRBL } from 'diagram-js/lib/layout/LayoutUtil';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';


describe('features/modeling - create participant', function() {

  var testModules = [
    coreModule,
    createModule,
    modelingModule
  ];

  describe('process', function() {

    describe('should turn process into collaboration', function() {

      var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/process-empty.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      var collaboration,
          collaborationBo,
          collaborationDi,
          diRoot,
          participant,
          participant2,
          participants,
          participantBo,
          participant2Bo,
          participantDi,
          participant2Di,
          process,
          processBo,
          processDi;

      beforeEach(inject(function(canvas, elementFactory) {

        // given
        process = canvas.getRootElement();
        processBo = process.businessObject;
        processDi = processBo.di;

        diRoot = processBo.di.$parent;

        participant = elementFactory.createParticipantShape({ x: 100, y: 100 });
        participantBo = participant.businessObject;
        participantDi = participantBo.di;

        participant2 = elementFactory.createParticipantShape({ x: 100, y: 400 });
        participant2Bo = participant2.businessObject;
        participant2Di = participant2Bo.di;

        participants = [ participant, participant2 ];
      }));


      describe('creating one participant', function() {

        beforeEach(inject(function(canvas, modeling) {

          // when
          modeling.createShape(participant, { x: 400, y: 225 }, process);

          collaboration = canvas.getRootElement();
          collaborationBo = collaboration.businessObject;
          collaborationDi = collaborationBo.di;
        }));


        it('execute', function() {

          // then
          expect(participantBo.$parent).to.equal(collaborationBo);
          expect(participantBo.processRef).to.equal(processBo);

          expect(collaborationBo.$instanceOf('bpmn:Collaboration')).to.be.true;
          expect(collaborationBo.$parent).to.equal(processBo.$parent);
          expect(collaborationBo.participants).to.include(participantBo);

          expect(participantDi.$parent).to.equal(collaborationDi);
          expect(collaborationDi.$parent).to.equal(diRoot);
        });


        it('undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(participantBo.$parent).not.to.exist;
          expect(participantBo.processRef).not.to.equal(processBo);

          expect(collaborationBo.$parent).not.to.exist;
          expect(collaborationBo.participants).not.to.include(participantBo);

          expect(processDi.$parent).to.equal(diRoot);
        }));

      });


      describe('creating two participants', function() {

        beforeEach(inject(function(canvas, modeling) {

          // when
          modeling.createElements(participants, { x: 400, y: 375 }, process);

          collaboration = canvas.getRootElement();
          collaborationBo = collaboration.businessObject;
          collaborationDi = collaborationBo.di;
        }));


        it('execute', function() {

          // then
          expect(participantBo.$parent).to.equal(collaborationBo);
          expect(participantBo.processRef).to.equal(processBo);

          expect(participant2Bo.$parent).to.equal(collaborationBo);
          expect(participant2Bo.processRef).not.to.equal(processBo);

          expect(collaborationBo.$instanceOf('bpmn:Collaboration')).to.be.true;
          expect(collaborationBo.$parent).to.equal(processBo.$parent);
          expect(collaborationBo.participants).to.include(participantBo);

          expect(participantDi.$parent).to.equal(collaborationDi);
          expect(participant2Di.$parent).to.equal(collaborationDi);
          expect(collaborationDi.$parent).to.equal(diRoot);
        });


        it('undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(participantBo.$parent).not.to.exist;
          expect(participantBo.processRef).not.to.equal(processBo);

          expect(participant2Bo.$parent).not.to.exist;
          expect(participant2Bo.processRef).not.to.equal(processBo);

          expect(collaborationBo.$parent).not.to.exist;
          expect(collaborationBo.participants).not.to.include(participantBo);
          expect(collaborationBo.participants).not.to.include(participant2Bo);

          expect(processDi.$parent).to.equal(diRoot);
        }));

      });

    });


    describe('should move existing elements', function() {

      var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/process.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      var collaboration,
          collaborationBo,
          collaborationDi,
          participant,
          process,
          processBo,
          processDi;

      beforeEach(inject(function(canvas, elementFactory, modeling) {

        // given
        process = canvas.getRootElement();
        processBo = process.businessObject;
        processDi = processBo.di;

        participant = elementFactory.createParticipantShape();

        // when
        modeling.createShape(participant, { x: 350, y: 200 }, process);

        collaboration = canvas.getRootElement();
        collaborationBo = collaboration.businessObject;
        collaborationDi = collaborationBo.di;
      }));


      it('execute', function() {

        // then
        expect(collaboration.children).to.have.length(4);

        collaboration.children.forEach(function(child) {
          var childBo = child.businessObject,
              childDi = childBo.di;

          expect(childDi.$parent).to.eql(collaborationDi);
          expect(collaborationDi.planeElement).to.include(childDi);
        });

        expect(participant.children).to.have.length(5);

        participant.children.forEach(function(child) {
          var childBo = child.businessObject,
              childDi = childBo.di;

          expect(childDi.$parent).to.eql(collaborationDi);
          expect(collaborationDi.planeElement).to.include(childDi);
        });
      });


      it('undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        expect(process.children).to.have.length(8);

        process.children.forEach(function(child) {
          var childBo = child.businessObject,
              childDi = childBo.di;

          expect(childDi.$parent).to.eql(processDi);
          expect(processDi.planeElement).to.include(childDi);
        });

        expect(participant.children.length).to.equal(0);
      }));


      it('should detach DI when turning process into collaboration', inject(function(modeling) {

        // when
        modeling.makeCollaboration();

        // then
        process.children.forEach(function(child) {
          var childBo = child.businessObject,
              childDi = childBo.di;

          expect(childDi.$parent).not.to.exist;
          expect(processDi.planeElement).not.to.include(childDi);
        });
      }));

    });


    describe('hovering process when creating first participant', function() {

      var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/process.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      var participant,
          process,
          processGfx,
          subProcess,
          subProcessGfx;

      beforeEach(inject(function(canvas, elementFactory, elementRegistry) {

        // given
        process = canvas.getRootElement();
        processGfx = canvas.getGraphics(process);

        participant = elementFactory.createParticipantShape();

        subProcess = elementRegistry.get('SubProcess_1');
        subProcessGfx = canvas.getGraphics(subProcess);
      }));


      it('should ensure hovering process', inject(function(create, dragging, eventBus) {

        // given
        create.start(canvasEvent({ x: 100, y: 100 }), participant);

        var event = eventBus.createEvent({
          element: subProcess,
          gfx: subProcessGfx
        });

        // when
        eventBus.fire('element.hover', event);

        // then
        expect(event.element).to.equal(process);
        expect(event.gfx).to.equal(processGfx);
      }));


      it('should clean up', inject(function(create, dragging, eventBus) {

        // given
        create.start(canvasEvent({ x: 100, y: 100 }), participant);

        // when
        dragging.end();

        // then
        var event = eventBus.createEvent({
          element: subProcess,
          gfx: subProcessGfx
        });

        eventBus.fire('element.hover', event);

        expect(event.element).to.equal(subProcess);
        expect(event.gfx).to.equal(subProcessGfx);
      }));

    });


    describe('fitting participant (default size)', function() {

      var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/process.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      var participant,
          participantBo,
          process,
          processGfx;

      beforeEach(inject(function(canvas, create, dragging, elementFactory) {

        // given
        process = canvas.getRootElement();
        processGfx = canvas.getGraphics(process);

        participant = elementFactory.createParticipantShape();
        participantBo = participant.businessObject;

        create.start(canvasEvent({ x: 100, y: 100 }), participant);

        dragging.hover({ element: process, gfx: processGfx });
      }));


      it('should fit participant', inject(function(elementFactory) {

        // then
        var defaultSize = elementFactory._getDefaultSize(participantBo);

        expect(participant.width).to.equal(defaultSize.width);
        expect(participant.height).to.equal(defaultSize.height);
      }));


      describe('create constraints', function() {

        function expectBoundsWithin(inner, outer, padding) {
          expect(inner.top >= outer.top + padding.top).to.be.true;
          expect(inner.right <= outer.right - padding.right).to.be.true;
          expect(inner.bottom <= outer.bottom - padding.bottom).to.be.true;
          expect(inner.left >= outer.left + padding.left).to.be.true;
        }

        var padding = {
          top: 20,
          right: 20,
          bottom: 20,
          left: 50
        };


        [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 0, y: 1000 },
          { x: 1000, y: 1000 }
        ].forEach(function(position) {

          it('should constrain ' + JSON.stringify(position), inject(function(dragging) {

            // when
            dragging.move(canvasEvent(position));

            dragging.end();

            // then
            expectBoundsWithin(
              asTRBL(getBBox(participant.children)),
              asTRBL(getBBox(participant)),
              padding
            );
          }));

        });

      });

    });


    describe('fitting participant (only groups)', function() {

      var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/process-empty.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

      it('should fit participant', inject(
        function(canvas, create, dragging, elementFactory, modeling) {

          // given
          var process = canvas.getRootElement(),
              processGfx = canvas.getGraphics(process),
              participant = elementFactory.createParticipantShape(),
              participantBo = participant.businessObject,
              groupElement = elementFactory.createShape({ type: 'bpmn:Group' });

          modeling.createShape(groupElement, { x: 100, y: 100 }, process);

          // when
          create.start(canvasEvent({ x: 100, y: 100 }), participant);
          dragging.hover({ element: process, gfx: processGfx });

          // then
          var defaultSize = elementFactory._getDefaultSize(participantBo);

          expect(participant.width).to.equal(defaultSize.width);
          expect(participant.height).to.equal(defaultSize.height);
        }
      ));

    });

  });


  describe('collaboration', function() {

    var collaborationDiagramXML =
      require('../../../../fixtures/bpmn/collaboration/collaboration-participant.bpmn');

    beforeEach(bootstrapModeler(collaborationDiagramXML, { modules: testModules }));

    var collaborationBo,
        participant,
        participantBo,
        rootElement;

    beforeEach(inject(function(canvas, elementFactory, modeling) {

      // given
      rootElement = canvas.getRootElement();
      collaborationBo = rootElement.businessObject;

      participant = elementFactory.createParticipantShape();
      participantBo = participant.businessObject;

      // when
      modeling.createShape(participant, { x: 350, y: 500 }, rootElement);
    }));


    it('execute', function() {

      // then
      expect(rootElement.children).to.include(participant);

      expect(participantBo.$parent).to.equal(collaborationBo);
      expect(collaborationBo.participants).to.include(participantBo);
    });


    it('undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      expect(rootElement.children).not.to.include(participant);

      expect(participantBo.$parent).not.to.exist;
      expect(collaborationBo.participants).not.to.include(participantBo);
    }));

  });

});
