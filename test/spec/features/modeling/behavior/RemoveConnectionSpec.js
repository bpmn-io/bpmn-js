import { bootstrapModeler, inject } from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

describe('features/modeling - change subprocess type', function () {
  var testModules = [coreModule, modelingModule];

  var processDiagramXML = require('./RemoveTodo.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

  var subprocessShape, taskShape;

  beforeEach(inject(function (elementRegistry) {
    subprocessShape = elementRegistry.get('Subprocess');
    taskShape = elementRegistry.get('Task');
  }));

  describe('change activity type', function () {
    it('should execute', inject(function (
      bpmnReplace,
      elementRegistry
    ) {

      // when
      bpmnReplace.replaceElement(subprocessShape, {
        type: 'bpmn:AdHocSubProcess',
      });
      taskShape = elementRegistry.get('Task');

      // then
      expect(taskShape.businessObject.dataOutputAssociations).to.not.be.empty;
    }));
  });
});

