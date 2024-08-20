import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import { is } from 'lib/util/ModelUtil';
import copyPasteModule from 'lib/features/copy-paste';

import diagramXML from './SetCompensationActivityAfterPasteBehaviorSpec.bpmn';


describe('features/modeling/behavior - compensation activity after paste', function() {

  const testModules = [
    copyPasteModule,
    coreModule,
    modelingModule
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('copy/paste compensation activity', function() {

    it('without boundary event', inject(function(canvas, elementRegistry, copyPaste) {

      // given
      copyPaste.copy([ elementRegistry.get('Compensation_Activity') ]);

      // when
      var copiedElements = copyPaste.paste({
        element: canvas.getRootElement(),
        point: {
          x: 100,
          y: 100
        }
      });

      // then
      expect(copiedElements).to.have.lengthOf(1);
      const taskElement = copiedElements.find(element => is(element, 'bpmn:Task'));
      expect(taskElement.businessObject.isForCompensation).to.be.false;
    }));


    it('with boundary event', inject(function(canvas, elementRegistry, copyPaste) {

      // given
      copyPaste.copy([
        elementRegistry.get('Compensation_Boundary_Task'),
        elementRegistry.get('Compensation_Activity') ]);

      // when
      var copiedElements = copyPaste.paste({
        element: canvas.getRootElement(),
        point: {
          x: 100,
          y: 100
        }
      });

      // then
      expect(copiedElements).to.have.lengthOf(4);
      expect(copiedElements.filter(element => is(element, 'bpmn:Association'))).to.have.length(1);
      expect(copiedElements.filter(element => is(element, 'bpmn:BoundaryEvent'))).to.have.length(1);
      expect(copiedElements.filter(element => is(element, 'bpmn:Task'))).to.have.length(2);

      // verify that for every Task element, if businessObject.isForCompensation exists, it should be true
      copiedElements.filter(element => is(element, 'bpmn:Task')).forEach(taskElement => {
        if (Object.prototype.hasOwnProperty.call(taskElement.businessObject, 'isForCompensation')) {
          expect(taskElement.businessObject.isForCompensation).to.be.true;
        }
      });
    }));

  });

});