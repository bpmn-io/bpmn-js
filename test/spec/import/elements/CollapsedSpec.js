import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('import - collapsed container', function() {

  describe('in process', function() {

    var diagramXML = require('../../../fixtures/bpmn/import/collapsed/process.bpmn');

    beforeEach(bootstrapViewer(diagramXML));


    it('should import collapsed subProcess', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('SubProcess_1');
      var subProcessRoot = canvas.findRoot(collapsedShape);
      var childShape = elementRegistry.get('IntermediateCatchEvent_1');
      var childRoot = canvas.findRoot(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(subProcessRoot).not.to.equal(childRoot);
    }));


    it('should import collapsed transaction', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('Transaction_1');
      var subProcessRoot = canvas.findRoot(collapsedShape);
      var childShape = elementRegistry.get('UserTask_1');
      var childRoot = canvas.findRoot(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(subProcessRoot).not.to.eql(childRoot);
    }));


    it('should import collapsed adhocSubProcess', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('AdHocSubProcess_1');
      var subProcessRoot = canvas.findRoot(collapsedShape);
      var childShape = elementRegistry.get('StartEvent_1');
      var childRoot = canvas.findRoot(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(subProcessRoot).not.to.eql(childRoot);
    }));


    it('should import collapsed with nested elements', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('SubProcess_4');
      var subProcessRoot = canvas.findRoot(collapsedShape);
      var childShape = elementRegistry.get('SubProcess_5');
      var childRoot = canvas.findRoot(childShape);
      var nestedChildShape = elementRegistry.get('Task_3');
      var nestedChildRoot = canvas.findRoot(nestedChildShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(childRoot).not.to.eql(subProcessRoot);
      expect(nestedChildRoot).not.to.eql(subProcessRoot);
    }));


    it('should import collapsed with nested hidden labels', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('SubProcess_2');
      var subProcessRoot = canvas.findRoot(collapsedShape);

      var hiddenEventShape = elementRegistry.get('StartEvent_2');
      var hiddenEventRoot = canvas.findRoot(hiddenEventShape);
      expect(hiddenEventRoot).not.to.eql(subProcessRoot);

      var hiddenDataShape = elementRegistry.get('DataObjectReference_1');
      var hiddenDataRoot = canvas.findRoot(hiddenDataShape);
      expect(hiddenDataRoot).not.to.eql(subProcessRoot);
    }));


    it('should import expanded subProcess', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_3');
      var expandedRoot = canvas.findRoot(expandedShape);
      var childShape = elementRegistry.get('Task_2');
      var childRoot = canvas.findRoot(childShape);

      expect(expandedShape.collapsed).to.be.false;
      expect(childShape.hidden).to.be.false;
      expect(expandedRoot).to.eql(childRoot);
    }));

  });


  describe('in collaboration', function() {

    var diagramXML = require('../../../fixtures/bpmn/import/collapsed/collaboration.bpmn');

    beforeEach(bootstrapViewer(diagramXML));


    it('should import collapsed subProcess in pool', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('SubProcess_1');
      var subProcessRoot = canvas.findRoot(collapsedShape);
      var childShape = elementRegistry.get('Task_1');
      var childRoot = canvas.findRoot(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(subProcessRoot).not.to.eql(childRoot);
    }));


    it('should import expanded subProcess in pool', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_2');
      var expandedRoot = canvas.findRoot(expandedShape);
      var childShape = elementRegistry.get('StartEvent_1');
      var childRoot = canvas.findRoot(childShape);

      expect(expandedShape.collapsed).to.be.false;
      expect(childShape.hidden).to.be.false;
      expect(expandedRoot).to.eql(childRoot);
    }));


    it('should import collapsed subProcess in lane', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_4');
      var subProcessRoot = canvas.findRoot(expandedShape);
      var childShape = elementRegistry.get('Task_2');
      var childRoot = canvas.findRoot(childShape);

      expect(expandedShape.collapsed).to.be.true;
      expect(subProcessRoot).not.to.eql(childRoot);
    }));


    it('should import expanded subProcess in lane', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_3');
      var expandedRoot = canvas.findRoot(expandedShape);
      var childShape = elementRegistry.get('StartEvent_2');
      var childRoot = canvas.findRoot(childShape);

      expect(expandedShape.collapsed).to.be.false;
      expect(childShape.hidden).to.be.false;
      expect(expandedRoot).to.eql(childRoot);
    }));

  });

});