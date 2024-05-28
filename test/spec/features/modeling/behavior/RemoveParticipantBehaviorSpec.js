import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  getDi,
  is
} from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - remove participant behavior', function() {

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

        expect(is(rootElement, 'bpmn:Collaboration')).to.be.ok;
      }));

    });

  });


  describe('when removing last remaining participant', function() {

    var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/collaboration-data-store.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    describe('should transform diagram into process diagram', function() {

      it('execute', inject(function(modeling, elementRegistry, canvas) {

        // given
        var participantShape = elementRegistry.get('_Participant_2'),
            participant = participantShape.businessObject,
            participantDi = getDi(participantShape),
            process = participant.processRef,
            collaborationElement = participantShape.parent,
            collaboration = collaborationElement.businessObject,
            diPlane = getDi(collaborationElement),
            bpmnDefinitions = collaboration.$parent;

        // when
        modeling.removeShape(participantShape);

        // then
        expect(participant.$parent).not.to.be.ok;

        var newRootShape = canvas.getRootElement(),
            newRootBusinessObject = newRootShape.businessObject;

        expect(newRootBusinessObject.$instanceOf('bpmn:Process')).to.be.true;

        // collaboration DI is unwired
        expect(participantDi.$parent).not.to.be.ok;
        expect(getDi(collaborationElement)).not.to.be.ok;

        expect(bpmnDefinitions.rootElements).not.to.include(process);
        expect(bpmnDefinitions.rootElements).not.to.include(collaboration);

        // process DI is wired
        expect(diPlane.bpmnElement).to.eql(newRootBusinessObject);
        expect(getDi(newRootShape)).to.eql(diPlane);

        expect(bpmnDefinitions.rootElements).to.include(newRootBusinessObject);

        // data store is preserved
        expect(newRootShape.children).to.have.length(1);
      }));


      it('undo', inject(function(modeling, elementRegistry, canvas, commandStack) {

        // given
        var participantShape = elementRegistry.get('_Participant_2'),
            participant = participantShape.businessObject,
            originalRootElement = participantShape.parent,
            originalRootElementBo = originalRootElement.businessObject,
            originalRootElementDi = getDi(originalRootElement),
            bpmnDefinitions = originalRootElementBo.$parent,
            participantDi = getDi(participantShape),
            diPlane = participantDi.$parent;

        modeling.removeShape(participantShape);

        // when
        commandStack.undo();

        // then
        expect(participant.$parent).to.eql(originalRootElementBo);
        expect(originalRootElementBo.$parent).to.eql(bpmnDefinitions);

        expect(canvas.getRootElement()).to.eql(originalRootElement);

        // di is unwired
        expect(participantDi.$parent).to.eql(originalRootElementDi);

        // new di is wired
        expect(diPlane.bpmnElement).to.eql(originalRootElementBo);
      }));

    });

  });


  describe('when removing all diagram content', function() {

    var processDiagramXML = require('../../../../fixtures/bpmn/collaboration/collaboration-data-store.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    describe('should transform diagram into process diagram', function() {

      it('execute', inject(function(modeling, elementRegistry, canvas) {

        // given
        var participantShape = elementRegistry.get('_Participant_2'),
            participant = participantShape.businessObject,
            participantDi = getDi(participantShape),
            process = participant.processRef,
            collaborationElement = participantShape.parent,
            collaboration = collaborationElement.businessObject,
            diPlane = getDi(collaborationElement),
            bpmnDefinitions = collaboration.$parent;

        // when
        var rootElement = canvas.getRootElement();

        var elements = elementRegistry.filter(function(element) {
          return element !== rootElement;
        });

        modeling.removeElements(elements);

        // then
        expect(participant.$parent).not.to.be.ok;

        var newRootShape = canvas.getRootElement(),
            newRootBusinessObject = newRootShape.businessObject;

        expect(newRootBusinessObject.$instanceOf('bpmn:Process')).to.be.true;

        // collaboration DI is unwired
        expect(participantDi.$parent).not.to.be.ok;
        expect(getDi(collaborationElement)).not.to.be.ok;

        expect(bpmnDefinitions.rootElements).not.to.include(process);
        expect(bpmnDefinitions.rootElements).not.to.include(collaboration);

        // process DI is wired
        expect(diPlane.bpmnElement).to.eql(newRootBusinessObject);
        expect(getDi(newRootShape)).to.eql(diPlane);

        expect(bpmnDefinitions.rootElements).to.include(newRootBusinessObject);
      }));


      it('undo', inject(function(modeling, elementRegistry, canvas, commandStack) {

        // given
        var participantShape = elementRegistry.get('_Participant_2'),
            participant = participantShape.businessObject,
            originalRootElement = participantShape.parent,
            originalRootElementBo = originalRootElement.businessObject,
            originalRootElementDi = getDi(originalRootElement),
            bpmnDefinitions = originalRootElementBo.$parent,
            participantDi = getDi(participantShape),
            diPlane = participantDi.$parent;

        var rootElement = canvas.getRootElement();

        var elements = elementRegistry.filter(function(element) {
          return element !== rootElement;
        });

        modeling.removeElements(elements);

        // when
        commandStack.undo();

        // then
        expect(participant.$parent).to.eql(originalRootElementBo);
        expect(originalRootElementBo.$parent).to.eql(bpmnDefinitions);

        expect(canvas.getRootElement()).to.eql(originalRootElement);

        // di is unwired
        expect(participantDi.$parent).to.eql(originalRootElementDi);

        // new di is wired
        expect(diPlane.bpmnElement).to.eql(originalRootElementBo);
      }));

    });

  });

});