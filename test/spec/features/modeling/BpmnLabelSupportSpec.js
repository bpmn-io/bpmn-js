'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

describe('features - bpmn-label-support', function() {

  var diagramXML = require('../../../fixtures/bpmn/basic.bpmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

  describe('should not add a label on create', function() {

    it('should not add a label on create', inject(function(elementFactory, elementRegistry, modeling, canvas) {
      // when
      var startEvent = elementRegistry.get('StartEvent_1'),
          task = elementRegistry.get('Task_1');

      modeling.connect(startEvent, task);

      var labels = elementRegistry.filter(function(element) {
        return element.type === 'label';
      });

      // then
      expect(labels).to.have.length(2);
    }));

  });

});
