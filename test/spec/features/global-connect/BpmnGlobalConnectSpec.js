'use strict';

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    providerModule = require('../../../../lib/features/global-connect'),
    coreModule = require('../../../../lib/core');


describe('features/bpmn-global-connect-provider', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ coreModule, modelingModule, providerModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should allow start for given element types', inject(function(bpmnGlobalConnect, elementFactory) {
    // given
    var types = [
      'bpmn:FlowNode',
      'bpmn:InteractionNode',
      'bpmn:DataObjectReference',
      'bpmn:DataStoreReference'
    ];

    // when
    var results = types.map(function(type) {
      var e = elementFactory.createShape({ type: type });
      return bpmnGlobalConnect.canStartConnect(e);
    });

    // then
    results.forEach(function(r) {
      expect(r).to.be.true;
    });
  }));


  it('should ignore label elements', inject(function(canvas, bpmnGlobalConnect, modeling, elementFactory) {
    // given
    var label = elementFactory.createShape({ type: 'bpmn:FlowNode', labelTarget: {} });

    // when
    var result = bpmnGlobalConnect.canStartConnect(label);

    // then
    expect(result).to.be.null;
  }));


  it('should NOT allow start on unknown element', inject(function(bpmnGlobalConnect) {
    // when
    var result = bpmnGlobalConnect.canStartConnect({ type: 'bpmn:SomeUnknownType' });

    // then
    expect(result).to.be.false;
  }));

});
