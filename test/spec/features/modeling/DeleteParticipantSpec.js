import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { getDi } from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - delete participant', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('last remaining', function() {

    describe('should transform diagram into process diagram', function() {

      var processDiagramXML = require('../../../fixtures/bpmn/collaboration/collaboration-empty-participant.bpmn');

      beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


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
        expect(collaborationElement.di).not.to.be.ok;

        expect(bpmnDefinitions.rootElements).not.to.include(process);
        expect(bpmnDefinitions.rootElements).not.to.include(collaboration);

        // process DI is wired
        expect(diPlane.bpmnElement).to.eql(newRootBusinessObject);
        expect(newRootShape.di).to.eql(diPlane);

        expect(bpmnDefinitions.rootElements).to.include(newRootBusinessObject);
      }));


      it('undo', inject(function(modeling, elementRegistry, canvas, commandStack) {

        // given
        var participantShape = elementRegistry.get('_Participant_2'),
            participant = participantShape.businessObject,
            originalRootElement = participantShape.parent,
            originalRootElementBo = originalRootElement.businessObject,
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
        expect(participantDi.$parent).to.eql(getDi(originalRootElement));

        // new di is wired
        expect(diPlane.bpmnElement).to.eql(originalRootElementBo);
      }));

    });

  });

});
