import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import modelingModule from 'bpmn-js/lib/features/modeling';
import coreModule from 'bpmn-js/lib/core';

import processDiagramXML from './IdClaim.bpmn';


describe('features/modeling - id claim management', function() {

  beforeEach(bootstrapModeler(processDiagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));

  var element, moddleElement, id;

  beforeEach(inject(function(elementRegistry, moddle) {
    id = 'StartEvent_2';
    element = elementRegistry.get(id);
    moddleElement = element.businessObject;
  }));


  describe('unclaim', function() {

    it('should unclaim id when removing element', inject(function(modeling, moddle) {

      // when
      modeling.removeElements([ element ]);

      // then
      expect(moddle.ids.assigned(id)).to.be.false;
    }));


    it('should revert unclaim action on restoring element', inject(function(modeling, moddle, commandStack) {

      // given
      modeling.removeElements([ element ]);

      // when
      commandStack.undo();

      // then
      expect(moddle.ids.assigned(id)).to.eql(moddleElement);
    }));

  });

});
