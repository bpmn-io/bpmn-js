'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var is = require('../../../../../lib/util/ModelUtil').is;

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');


describe('features/modeling - remove behavior', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('when removing participant in collaboration', function() {

    var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/collaboration-message-flows.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    describe('retain collaboration', function() {

      it('execute', inject(function(modeling, elementRegistry, canvas) {

        // given
        var participantShape = elementRegistry.get('Participant_2');

        // when
        modeling.removeShape(participantShape);

        // then
        var rootElement = canvas.getRootElement();

        expect(is(rootElement, 'bpmn:Collaboration')).toBeTruthy();
      }));

    });

  });


  describe('when removing last remaining participant', function() {

    var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/collaboration-empty-participant.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    describe('should transform diagram into process diagram', function() {

      it('execute', inject(function(modeling, elementRegistry, canvas) {

        // given
        var participantShape = elementRegistry.get('_Participant_2'),
            participant = participantShape.businessObject,
            participantDi = participant.di,
            process = participant.processRef,
            collaborationElement = participantShape.parent,
            collaboration = collaborationElement.businessObject,
            diPlane = collaboration.di,
            bpmnDefinitions = collaboration.$parent;

        // when
        modeling.removeShape(participantShape);

        // then
        expect(participant.$parent).toBeFalsy();

        var newRootShape = canvas.getRootElement(),
            newRootBusinessObject = newRootShape.businessObject;

        expect(newRootBusinessObject.$instanceOf('bpmn:Process')).toBe(true);

        // collaboration DI is unwired
        expect(participantDi.$parent).toBeFalsy();
        expect(collaboration.di).toBeFalsy();

        expect(bpmnDefinitions.rootElements).not.toContain(process);
        expect(bpmnDefinitions.rootElements).not.toContain(collaboration);

        // process DI is wired
        expect(diPlane.bpmnElement).toBe(newRootBusinessObject);
        expect(newRootBusinessObject.di).toBe(diPlane);

        expect(bpmnDefinitions.rootElements).toContain(newRootBusinessObject);
      }));


      it('undo', inject(function(modeling, elementRegistry, canvas, commandStack) {

        // given
        var participantShape = elementRegistry.get('_Participant_2'),
            participant = participantShape.businessObject,
            originalRootElement = participantShape.parent,
            originalRootElementBo = originalRootElement.businessObject,
            bpmnDefinitions = originalRootElementBo.$parent,
            participantDi = participant.di,
            diPlane = participantDi.$parent;

        modeling.removeShape(participantShape);

        // when
        commandStack.undo();

        // then
        expect(participant.$parent).toBe(originalRootElementBo);
        expect(originalRootElementBo.$parent).toBe(bpmnDefinitions);

        expect(canvas.getRootElement()).toBe(originalRootElement);

        // di is unwired
        expect(participantDi.$parent).toBe(originalRootElementBo.di);

        // new di is wired
        expect(diPlane.bpmnElement).toBe(originalRootElementBo);
      }));

    });

  });

});