'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


describe('import - collapsed container', function() {

  describe('in process', function() {

    var diagramXML = require('../../../fixtures/bpmn/import/collapsed.bpmn');

    beforeEach(bootstrapViewer(diagramXML));


    it('should import collapsed subProcess', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.get('SubProcess_1');
      var childShape = elementRegistry.get('IntermediateCatchEvent_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import collapsed transaction', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.get('Transaction_1');
      var childShape = elementRegistry.get('UserTask_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import collapsed adhocSubProcess', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.get('AdHocSubProcess_1');
      var childShape = elementRegistry.get('StartEvent_1');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import collapsed with nested elements', inject(function(elementRegistry) {
      var collapsedShape = elementRegistry.get('SubProcess_4');
      var childShape = elementRegistry.get('SubProcess_5');
      var nestedChildShape = elementRegistry.get('Task_3');

      expect(collapsedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
      expect(nestedChildShape.hidden).toBe(true);
    }));


    it('should import collapsed with nested elements', inject(function(elementRegistry) {
      var hiddenEventShape = elementRegistry.get('StartEvent_2');
      expect(hiddenEventShape.label.hidden).toBe(true);

      var hiddenDataShape = elementRegistry.get('DataObjectReference_1');
      expect(hiddenDataShape.label.hidden).toBe(true);
    }));


    it('should import expanded subProcess', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.get('SubProcess_3');
      var childShape = elementRegistry.get('Task_2');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    }));

  });


  describe('in collaboration', function() {

    var diagramXML = require('../../../fixtures/bpmn/import/collapsed-collaboration.bpmn');

    beforeEach(bootstrapViewer(diagramXML));


    it('should import collapsed subProcess in pool', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.get('SubProcess_1');
      var childShape = elementRegistry.get('Task_1');

      expect(expandedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import expanded subProcess in pool', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.get('SubProcess_2');
      var childShape = elementRegistry.get('StartEvent_1');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    }));


    it('should import collapsed subProcess in lane', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.get('SubProcess_4');
      var childShape = elementRegistry.get('Task_2');

      expect(expandedShape.collapsed).toBe(true);
      expect(childShape.hidden).toBe(true);
    }));


    it('should import expanded subProcess in lane', inject(function(elementRegistry) {
      var expandedShape = elementRegistry.get('SubProcess_3');
      var childShape = elementRegistry.get('StartEvent_2');

      expect(expandedShape.collapsed).toBe(false);
      expect(childShape.hidden).toBe(false);
    }));

  });

});