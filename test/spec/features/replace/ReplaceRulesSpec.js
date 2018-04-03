import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';
import coreModule from 'lib/core';



describe('features/replace - rules', function() {

  var diagramXML = require('../../../fixtures/bpmn/features/replace/association-gateways.bpmn');

  var testModules = [ coreModule, modelingModule, replaceModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should keep associations', function() {

    it('replacing Gateway -> EventBasedGateway', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('ExclusiveGateway_140v6lc');

      var target = {
        type: 'bpmn:EventBasedGateway'
      };

      // when
      bpmnReplace.replaceElement(element, target);

      // then
      expect(elementRegistry.get('Association_0gzxvep')).to.exist;
      expect(elementRegistry.get('SequenceFlow_1rme11l')).to.exist;
      expect(elementRegistry.get('SequenceFlow_0608fzs')).not.to.exist;
    }));


    it('replacing StartEvent -> EndEvent', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('StartEvent_1');
      var target = {
        type: 'bpmn:EndEvent'
      };

      // when
      bpmnReplace.replaceElement(element, target);

      // then
      expect(elementRegistry.get('Association_1ncsghq')).to.exist;
      expect(elementRegistry.get('SequenceFlow_0fn1a6r')).not.to.exist;
    }));


    it('replacing EndEvent -> StartEvent', inject(function(elementRegistry, modeling, bpmnReplace) {

      // given
      var element = elementRegistry.get('EndEvent_1');
      var target = {
        type: 'bpmn:StartEvent'
      };

      // when
      bpmnReplace.replaceElement(element, target);

      // then
      expect(elementRegistry.get('Association_06tpzma')).to.exist;
      expect(elementRegistry.get('SequenceFlow_19u6x8u')).not.to.exist;
    }));

  });

});
