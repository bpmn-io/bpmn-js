import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import mixedDiagramSupportModule from 'lib/features/mixed-diagram-support';


describe('features/mixed-diagram-support', function() {

  var diagramXML = require('../../../fixtures/bpmn/import/mixed.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    mixedDiagramSupportModule
  ];
  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('#getTopLevelProcess', function() {

    function verify(diagram, shouldExist) {
      return function() {
        var bootstrap = bootstrapModeler(diagram, { modules: testModules });

        // when
        return bootstrap()
          .then(inject(function(mixedDiagramSupport) {
            var topLevelProcess = mixedDiagramSupport.getTopLevelProcess();

            // then
            if (shouldExist) {
              expect(topLevelProcess).to.exist;
            } else {
              expect(topLevelProcess).not.to.exist;
            }
          }));
      };
    }


    it('should initialize on a mixed diagram', verify(
      require('../../../fixtures/bpmn/import/mixed.bpmn'),
      true
    ));


    it('should NOT initialize on a collaboration diagram', verify(
      require('../../../fixtures/bpmn/import/collaboration.bpmn'),
      false
    ));


    it('should NOT initialize on a process diagram', verify(
      require('../../../fixtures/bpmn/import/process.bpmn'),
      false
    ));
  });


  describe.skip('appending shape', function() {


    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('Task_2');
      console.log(task.parent, task.businessObject.$parent);

      // when
      try {

        var targetShape = modeling.appendShape(task, { type: 'bpmn:Task' }),
            target = targetShape.businessObject;
      } finally {

        console.log(task.parent, task.businessObject.$parent);
      }



      // then
      expect(targetShape).to.exist;
      expect(target.$instanceOf('bpmn:Task')).to.be.true;
    }));
  });
});
