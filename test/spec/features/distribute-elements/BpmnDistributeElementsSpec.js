'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */

var bpmnDistributeElements = require('../../../../lib/features/distribute-elements'),
    modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

function last(arr) {
  return arr[arr.length - 1];
}


describe('features/distribute-elements', function() {

  var testModules = [ bpmnDistributeElements, modelingModule, coreModule ];
  var basicXML = require('../../../fixtures/bpmn/distribute-elements.bpmn');

  beforeEach(bootstrapModeler(basicXML, { modules: testModules }));


  describe('basics', function() {

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

});
