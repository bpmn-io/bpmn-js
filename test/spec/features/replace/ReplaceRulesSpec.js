'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    coreModule = require('../../../../lib/core');



describe('features/replace', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/replace/association-gateways.bpmn');

  var testModules = [ coreModule, modelingModule, replaceModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should keep associations', function() {

    it('replacing Gateway -> EventBasedGateway', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('ExclusiveGateway_140v6lc');

      var target =  {
        type: 'bpmn:EventBasedGateway'
      };

      // when
      bpmnReplace.replaceElement(element, target);

      // then
      expect(elementRegistry.get('Association_0gzxvep')).toBeDefined();
      expect(elementRegistry.get('SequenceFlow_1rme11l')).toBeDefined();
      expect(elementRegistry.get('SequenceFlow_0608fzs')).not.toBeDefined();
    }));


    it('replacing StartEvent -> EndEvent', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('StartEvent_1');
      var target =  {
        type: 'bpmn:EndEvent'
      };

      // when
      bpmnReplace.replaceElement(element, target);

      // then
      expect(elementRegistry.get('Association_1ncsghq')).toBeDefined();
      expect(elementRegistry.get('SequenceFlow_0fn1a6r')).not.toBeDefined();
    }));


    it('replacing EndEvent -> StartEvent', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('EndEvent_1');
      var target =  {
        type: 'bpmn:StartEvent'
      };

      // when
      bpmnReplace.replaceElement(element, target);

      // then
      expect(elementRegistry.get('Association_06tpzma')).toBeDefined();
      expect(elementRegistry.get('SequenceFlow_19u6x8u')).not.toBeDefined();
    }));

  });

});
