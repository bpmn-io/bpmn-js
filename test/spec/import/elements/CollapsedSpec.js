'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


var fs = require('fs');


describe('import - collapsed container', function() {

  beforeEach(Matchers.addDeepEquals);


  describe('in process', function() {

    var diagramXML = fs.readFileSync('test/fixtures/bpmn/import/collapsed.bpmn', 'utf8');

    beforeEach(bootstrapViewer(diagramXML));


    it('should import collapsed subProcess', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.getById('SubProcess_1');
      var childShape = elementRegistry.getById('IntermediateCatchEvent_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import collapsed transaction', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.getById('Transaction_1');
      var childShape = elementRegistry.getById('UserTask_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import collapsed adhocSubProcess', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.getById('AdHocSubProcess_1');
      var childShape = elementRegistry.getById('StartEvent_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import collapsed with nested elements', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.getById('SubProcess_4');
      var childShape = elementRegistry.getById('SubProcess_5');
      var nestedChildShape = elementRegistry.getById('Task_3');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
      expect(nestedChildShape.hidden).toBe(true);
    }));


    it('should import collapsed with nested elements', inject(function(elementRegistry) {
      var hiddenEventShape = elementRegistry.getById('StartEvent_2');
      expect(hiddenEventShape.label.hidden).toBe(true);

      var hiddenDataShape = elementRegistry.getById('DataObjectReference_1');
      expect(hiddenDataShape.label.hidden).toBe(true);
    }));


    it('should import expanded subProcess', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.getById('SubProcess_3');
      var childShape = elementRegistry.getById('Task_2');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    }));

  });


  describe('in collaboration', function() {

    var diagramXML = fs.readFileSync('test/fixtures/bpmn/import/collapsed-collaboration.bpmn', 'utf8');

    beforeEach(bootstrapViewer(diagramXML));


    it('should import collapsed subProcess in pool', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.getById('SubProcess_1');
      var childShape = elementRegistry.getById('Task_1');

      expect(expandedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import expanded subProcess in pool', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.getById('SubProcess_2');
      var childShape = elementRegistry.getById('StartEvent_1');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    }));


    it('should import collapsed subProcess in lane', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.getById('SubProcess_4');
      var childShape = elementRegistry.getById('Task_2');

      expect(expandedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import expanded subProcess in lane', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.getById('SubProcess_3');
      var childShape = elementRegistry.getById('StartEvent_2');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    }));

  });
});