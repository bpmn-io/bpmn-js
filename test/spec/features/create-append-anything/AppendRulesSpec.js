import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import createAppendAnything from 'lib/features/create-append-anything';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import rulesModule from 'diagram-js/lib/features/rules';


describe('features/create-append-anything - rules', function() {

  var testModules = [ modelingModule, coreModule, rulesModule, createAppendAnything ];

  var testXML = require('./AppendMenuProvider.bpmn');

  beforeEach(bootstrapModeler(testXML, { modules: testModules }));


  describe('element append', function() {

    it('should not allow for given element types', inject(function(elementFactory, rules) {

      // given
      var types = [
        'bpmn:EndEvent',
        'bpmn:Group',
        'bpmn:TextAnnotation',
        'bpmn:SequenceFlow',
        'bpmn:Lane',
        'bpmn:Participant',
        'bpmn:DataStoreReference',
        'bpmn:DataObjectReference'
      ];

      // when

      var results = types.map(function(type) {
        var element = elementFactory.createShape({ type: type });
        return rules.allowed('shape.append', { element });
      });

      // then
      results.forEach(function(result) {
        expect(result).to.be.false;
      });
    }));


    it('should not allow for event subprocess', inject(function(elementFactory, rules) {

      // given
      var element = elementFactory.createShape({ type: 'bpmn:SubProcess', triggeredByEvent: true });

      // when
      var result = rules.allowed('shape.append', { element });

      // then
      expect(result).to.be.false;
    }));


    it('should not allow for link intermediate throw event', inject(function(elementFactory, rules) {

      // given
      var element = elementFactory.createShape({
        type: 'bpmn:IntermediateThrowEvent',
        cancelActivity: false,
        eventDefinitionType: 'bpmn:LinkEventDefinition'
      });

      // when
      var result = rules.allowed('shape.append', { element });

      // then
      expect(result).to.be.false;
    }));

  });

});