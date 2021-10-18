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
      var collapsedPlane = canvas.findPlane(collapsedShape);
      var childShape = elementRegistry.get('IntermediateCatchEvent_1');
      var childPlane = canvas.findPlane(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(collapsedPlane).to.not.eql(childPlane);
    }));


    it('should import collapsed transaction', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('Transaction_1');
      var collapsedPlane = canvas.findPlane(collapsedShape);
      var childShape = elementRegistry.get('UserTask_1');
      var childPlane = canvas.findPlane(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(collapsedPlane).to.not.eql(childPlane);
    }));


    it('should import collapsed adhocSubProcess', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('AdHocSubProcess_1');
      var collapsedPlane = canvas.findPlane(collapsedShape);
      var childShape = elementRegistry.get('StartEvent_1');
      var childPlane = canvas.findPlane(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(collapsedPlane).to.not.eql(childPlane);
    }));


    it('should import collapsed with nested elements', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('SubProcess_4');
      var collapsedPlane = canvas.findPlane(collapsedShape);
      var childShape = elementRegistry.get('SubProcess_5');
      var childPlane = canvas.findPlane(childShape);
      var nestedChildShape = elementRegistry.get('Task_3');
      var nestedChildPlane = canvas.findPlane(nestedChildShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(childPlane).to.not.eql(collapsedPlane);
      expect(nestedChildPlane).to.not.eql(collapsedPlane);
    }));


    it('should import collapsed with nested hidden labels', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('SubProcess_2');
      var collapsedPlane = canvas.findPlane(collapsedShape);

      var hiddenEventShape = elementRegistry.get('StartEvent_2');
      var hiddenEventPlane = canvas.findPlane(hiddenEventShape);
      expect(hiddenEventPlane).to.not.eql(collapsedPlane);

      var hiddenDataShape = elementRegistry.get('DataObjectReference_1');
      var hiddenDataPlane = canvas.findPlane(hiddenDataShape);
      expect(hiddenDataPlane).to.not.eql(collapsedPlane);
    }));


    it('should import expanded subProcess', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_3');
      var expandedPlane = canvas.findPlane(expandedShape);
      var childShape = elementRegistry.get('Task_2');
      var childPlane = canvas.findPlane(childShape);

      expect(expandedShape.collapsed).to.be.false;
      expect(childShape.hidden).to.be.false;
      expect(expandedPlane).to.eql(childPlane);
    }));

  });


  describe('in collaboration', function() {

    var diagramXML = require('../../../fixtures/bpmn/import/collapsed/collaboration.bpmn');

    beforeEach(bootstrapViewer(diagramXML));


    it('should import collapsed subProcess in pool', inject(function(elementRegistry, canvas) {
      var collapsedShape = elementRegistry.get('SubProcess_1');
      var collapsedPlane = canvas.findPlane(collapsedShape);
      var childShape = elementRegistry.get('Task_1');
      var childPlane = canvas.findPlane(childShape);

      expect(collapsedShape.collapsed).to.be.true;
      expect(collapsedPlane).to.not.eql(childPlane);
    }));


    it('should import expanded subProcess in pool', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_2');
      var expandedPlane = canvas.findPlane(expandedShape);
      var childShape = elementRegistry.get('StartEvent_1');
      var childPlane = canvas.findPlane(childShape);

      expect(expandedShape.collapsed).to.be.false;
      expect(childShape.hidden).to.be.false;
      expect(expandedPlane).to.eql(childPlane);
    }));


    it('should import collapsed subProcess in lane', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_4');
      var collapsedPlane = canvas.findPlane(expandedShape);
      var childShape = elementRegistry.get('Task_2');
      var childPlane = canvas.findPlane(childShape);

      expect(expandedShape.collapsed).to.be.true;
      expect(collapsedPlane).to.not.eql(childPlane);
    }));


    it('should import expanded subProcess in lane', inject(function(elementRegistry, canvas) {
      var expandedShape = elementRegistry.get('SubProcess_3');
      var expandedPlane = canvas.findPlane(expandedShape);
      var childShape = elementRegistry.get('StartEvent_2');
      var childPlane = canvas.findPlane(childShape);

      expect(expandedShape.collapsed).to.be.false;
      expect(childShape.hidden).to.be.false;
      expect(expandedPlane).to.eql(childPlane);
    }));

  });

});