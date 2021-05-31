import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/mixed-diagram-support', function() {

  var diagramXML = require('../../../fixtures/bpmn/import/mixed.bpmn');

  var testModules = [ coreModule, modelingModule ];
  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('appending shape', function() {

    it.only('should execute', inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('Task_2');

      // when
      var targetShape = modeling.appendShape(task, { type: 'bpmn:Task' }),
          target = targetShape.businessObject;

      // then
      expect(targetShape).to.exist;
      expect(target.$instanceOf('bpmn:Task')).to.be.true;
    }));
  });
});
