import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - id claim management', function() {

  var testModules = [ coreModule, modelingModule ];

  var processDiagramXML = require('./IdClaim.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

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
