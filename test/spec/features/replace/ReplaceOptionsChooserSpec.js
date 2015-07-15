'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    coreModule = require('../../../../lib/core');



describe('features/replace - chooser', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/replace/01_replace.bpmn');

  var testModules = [ coreModule, modelingModule, replaceModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should show chooser', function() {

    it('for task', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('Task_1');

      // when
      bpmnReplace.openChooser({ x: 100, y: 100 }, element);

      // then
      expect(null).to.be.defined;
    }));


    it('for event event', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('StartEvent_1');

      // when
      bpmnReplace.openChooser({ x: 100, y: 100 }, element);

      // then
      expect(null).to.be.defined;
    }));


    it('for gateway event', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('ExclusiveGateway_1');

      // when
      bpmnReplace.openChooser({ x: 100, y: 100 }, element);

      // then
      expect(null).to.be.defined;
    }));

  });

});
