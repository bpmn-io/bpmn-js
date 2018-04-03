import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import {
  is
} from 'lib/util/ModelUtil';


describe('util/ModelUtil', function() {

  var diagramXML = require('../../fixtures/bpmn/simple.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));


  it('should work with diagram element', inject(function(elementFactory) {

    // given
    var messageFlowConnection = elementFactory.createConnection({ type: 'bpmn:MessageFlow' });

    // then
    expect(is(messageFlowConnection, 'bpmn:MessageFlow')).to.be.true;
    expect(is(messageFlowConnection, 'bpmn:BaseElement')).to.be.true;

    expect(is(messageFlowConnection, 'bpmn:SequenceFlow')).to.be.false;
    expect(is(messageFlowConnection, 'bpmn:Task')).to.be.false;
  }));


  it('should work with business object', inject(function(bpmnFactory) {

    // given
    var gateway = bpmnFactory.create('bpmn:Gateway');

    // then
    expect(is(gateway, 'bpmn:Gateway')).to.be.true;
    expect(is(gateway, 'bpmn:BaseElement')).to.be.true;

    expect(is(gateway, 'bpmn:SequenceFlow')).to.be.false;
  }));


  it('should work with untyped business object', inject(function() {

    // given
    var foo = { businessObject: 'BAR' };

    // then
    expect(is(foo, 'FOO')).to.be.false;
  }));


  it('should work with untyped diagram element', inject(function() {

    // given
    var foo = { };

    // then
    expect(is(foo, 'FOO')).to.be.false;
  }));

});