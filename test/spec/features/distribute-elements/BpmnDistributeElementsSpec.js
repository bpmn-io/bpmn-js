import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import bpmnDistributeElements from 'lib/features/distribute-elements';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

function last(arr) {
  return arr[arr.length - 1];
}


describe('features/distribute-elements', function() {

  var testModules = [ bpmnDistributeElements, modelingModule, coreModule ];


  describe('basics', function() {

    var basicXML = require('../../../fixtures/bpmn/distribute-elements.bpmn');

    beforeEach(bootstrapModeler(basicXML, { modules: testModules }));

    var elements;

    beforeEach(inject(function(elementRegistry, canvas) {
      elements = elementRegistry.filter(function(element) {
        return element.parent;
      });
    }));


    it('should align horizontally', inject(function(distributeElements) {

      // when
      var rangeGroups = distributeElements.trigger(elements, 'horizontal'),
          margin = rangeGroups[1].range.min - rangeGroups[0].range.max;

      // then
      expect(rangeGroups).to.have.length(9);

      expect(margin).to.equal(83);

      expect(rangeGroups[0].range).to.eql({
        min: 132, max: 158
      });

      expect(last(rangeGroups).range).to.eql({
        min: 1195, max: 1221
      });

    }));


    it('should align vertically', inject(function(distributeElements) {

      // when
      var rangeGroups = distributeElements.trigger(elements, 'vertical'),
          margin = rangeGroups[1].range.min - rangeGroups[0].range.max;

      // then
      expect(rangeGroups).to.have.length(4);

      expect(margin).to.equal(17);

      expect(rangeGroups[0].range).to.eql({
        min: -42, max: 38
      });

      expect(last(rangeGroups).range).to.eql({
        min: 373, max: 413
      });

    }));

  });

  describe('filtering elements', function() {

    var xml = require('../../../fixtures/bpmn/distribute-elements-filtering.bpmn');

    beforeEach(bootstrapModeler(xml, { modules: testModules }));

    var elements;

    beforeEach(inject(function(elementRegistry, canvas) {
      elements = elementRegistry.filter(function(element) {
        return element.parent;
      });
    }));


    it('should not distribute boundary events', inject(function(distributeElements, elementRegistry) {

      // given
      var boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      // when
      var rangeGroups = distributeElements.trigger(elements, 'horizontal');

      // then
      expect(rangeGroups).to.have.length(3);

      expect(rangeGroups[1].elements).not.to.include(boundaryEvent);

    }));

  });

});
