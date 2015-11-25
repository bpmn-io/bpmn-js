'use strict';

require('../../TestHelper');

/* global bootstrapModeler, inject */

var coreModule = require('../../../lib/core'),
    modelingModule = require('../../../lib/features/modeling');

var ModelUtil = require('../../../lib/util/ModelUtil');


describe('ModelUtil', function() {

  var diagramXML = require('../../fixtures/bpmn/simple.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: [ coreModule, modelingModule ] }));


  it('should work with diagram element', inject(function(elementFactory) {

    // given
    var messageFlowConnection = elementFactory.createConnection({ type: 'bpmn:MessageFlow' });

    // then
    expect(ModelUtil.is(messageFlowConnection, 'bpmn:MessageFlow')).to.be.true;
    expect(ModelUtil.is(messageFlowConnection, 'bpmn:BaseElement')).to.be.true;

    expect(ModelUtil.is(messageFlowConnection, 'bpmn:SequenceFlow')).to.be.false;
    expect(ModelUtil.is(messageFlowConnection, 'bpmn:Task')).to.be.false;
  }));


  it('should work with business object', inject(function(bpmnFactory) {

    // given
    var gateway = bpmnFactory.create('bpmn:Gateway');

    // then
    expect(ModelUtil.is(gateway, 'bpmn:Gateway')).to.be.true;
    expect(ModelUtil.is(gateway, 'bpmn:BaseElement')).to.be.true;

    expect(ModelUtil.is(gateway, 'bpmn:SequenceFlow')).to.be.false;
  }));


  it('should work with untyped business object', inject(function() {

    // given
    var foo = { businessObject: 'BAR' };

    // then
    expect(ModelUtil.is(foo, 'FOO')).to.be.false;
  }));


  it('should work with untyped diagram element', inject(function() {

    // given
    var foo = { };

    // then
    expect(ModelUtil.is(foo, 'FOO')).to.be.false;
  }));

});