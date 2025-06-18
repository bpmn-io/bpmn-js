import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  expectCanConnect,
  expectCanCopy,
  expectCanCreate,
  expectCanDrop,
  expectCanInsert,
  expectCanMove
} from './Helper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import { isInterrupting } from '../../../../lib/util/DiUtil';


describe.only('Debugging', function() {

  var testModules = [ coreModule, modelingModule ];

  var testXML = require('./BpmnRules.eventSubprocesses.bpmn');

  beforeEach(bootstrapModeler(testXML, { modules: testModules }));

  it('should replace non-interrupting start event with interrupting if moved out of even subprocess', inject(function(bpmnReplace, bpmnRules, elementRegistry, injector, modeling, selection) {

    // given
    const event = elementRegistry.get('NonInterruptingStartEvent');
    expect(isInterrupting(event)).to.be.false;

    // when
    bpmnReplace.replaceElement(event, {
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      isInterrupting: true
    });

    // then
    const replacedElement = elementRegistry.get('NonInterruptingStartEvent');
    expect(isInterrupting(replacedElement)).to.be.true;
  }));
});


