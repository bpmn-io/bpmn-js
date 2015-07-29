'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - move shape', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('shape', function() {

    it('should move', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var startEventElement = elementRegistry.get('StartEvent_1'),
          startEvent = startEventElement.businessObject;

      var sequenceFlowElement = elementRegistry.get('SequenceFlow_1'),
          sequenceFlow = sequenceFlowElement.businessObject;

      var oldPosition = {
        x: startEventElement.x,
        y: startEventElement.y
      };

      // when
      modeling.moveShape(startEventElement, { x: 0, y: 50 });

      // then
      expect(startEvent.di.bounds.x).to.equal(oldPosition.x);
      expect(startEvent.di.bounds.y).to.equal(oldPosition.y + 50);

      var newWaypoints = sequenceFlowElement.waypoints;

      var expectedDiWaypoints = bpmnFactory.createDiWaypoints(newWaypoints.map(function(p) {
        return { x: p.x, y: p.y };
      }));

      // see LayoutSpec for actual connection layouting tests

      // expect di waypoints update
      expect(sequenceFlow.di.waypoint).to.eql(expectedDiWaypoints);
    }));


    it('should move label', inject(function(elementRegistry, modeling) {

      // given
      var labelElement = elementRegistry.get('StartEvent_1_label'),
          startEvent = labelElement.businessObject;

      var oldPosition = {
        x: labelElement.x,
        y: labelElement.y
      };

      // when
      modeling.moveShape(labelElement, { x: 0, y: 50 });

      // then
      expect(startEvent.di.label.bounds.x).to.equal(oldPosition.x);
      expect(startEvent.di.label.bounds.y).to.equal(oldPosition.y + 50);
    }));


    it('should move label to new parent', inject(function(elementRegistry, modeling) {

      // given
      var startEventElement = elementRegistry.get('StartEvent_1'),
          labelElement = elementRegistry.get('StartEvent_1_label'),
          processElement = elementRegistry.get('Process_1'),
          subProcessElement = elementRegistry.get('SubProcess_1'),
          startEvent = labelElement.businessObject,
          subProcess = subProcessElement.businessObject;

      // when
      modeling.moveShape(labelElement, { x: 0, y: 50 }, processElement);

      // then
      expect(labelElement.parent).to.eql(processElement);

      // expect actual element + businessObject to be unchanged
      expect(startEventElement.parent).to.eql(subProcessElement);
      expect(startEvent.$parent).to.eql(subProcess);
    }));


    describe('undo support', function() {

      it('should undo', inject(function(elementRegistry, commandStack, modeling) {

        // given
        var startEventElement = elementRegistry.get('StartEvent_1'),
            startEvent = startEventElement.businessObject;

        var oldPosition = {
          x: startEventElement.x,
          y: startEventElement.y
        };

        modeling.moveShape(startEventElement, { x: 0, y: 50 });

        // when
        commandStack.undo();

        // then
        expect(startEvent.di.bounds.x).to.equal(oldPosition.x);
        expect(startEvent.di.bounds.y).to.equal(oldPosition.y);
      }));


      it('should undo on label', inject(function(elementRegistry, commandStack, modeling) {

        // given
        var labelElement = elementRegistry.get('StartEvent_1_label'),
            startEvent = labelElement.businessObject;

        var oldPosition = {
          x: labelElement.x,
          y: labelElement.y
        };

        modeling.moveShape(labelElement, { x: 0, y: 50 });

        // when
        commandStack.undo();

        // then
        expect(startEvent.di.label.bounds.x).to.equal(oldPosition.x);
        expect(startEvent.di.label.bounds.y).to.equal(oldPosition.y);
      }));

    });


    describe('redo support', function() {

      it('should redo', inject(function(elementRegistry, commandStack, modeling) {

        // given
        var startEventElement = elementRegistry.get('StartEvent_1'),
            startEvent = startEventElement.businessObject;


        modeling.moveShape(startEventElement, { x: 0, y: 50 });

        var newPosition = {
          x: startEventElement.x,
          y: startEventElement.y
        };

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(startEvent.di.bounds.x).to.equal(newPosition.x);
        expect(startEvent.di.bounds.y).to.equal(newPosition.y);
      }));


      it('should redo on label', inject(function(elementRegistry, commandStack, modeling) {

        // given
        var labelElement = elementRegistry.get('StartEvent_1_label'),
            startEvent = labelElement.businessObject;

        modeling.moveShape(labelElement, { x: 0, y: 50 });

        var newPosition = {
          x: labelElement.x,
          y: labelElement.y
        };

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(startEvent.di.label.bounds.x).to.equal(newPosition.x);
        expect(startEvent.di.label.bounds.y).to.equal(newPosition.y);
      }));

    });

  });


  describe('label suport', function() {

    it('should move label with shape', inject(function(elementRegistry, modeling) {

      // given
      var startEventElement = elementRegistry.get('StartEvent_1');

      var label = startEventElement.label;

      var labelPosition = {
        x: label.x,
        y: label.y
      };

      // when
      modeling.moveShapes([ startEventElement ], { x: 40, y: -80 });

      // then
      expect(label.x).to.equal(labelPosition.x + 40);
      expect(label.y).to.equal(labelPosition.y - 80);
    }));


    it('should move label with connection', inject(function(elementRegistry, modeling) {

      // given
      var startEventElement = elementRegistry.get('StartEvent_2'),
          subProcessElement = elementRegistry.get('SubProcess_1'),
          flowLabel = elementRegistry.get('SequenceFlow_3_label');

      var labelPosition = {
        x: flowLabel.x,
        y: flowLabel.y
      };

      // when
      modeling.moveShapes([ startEventElement, subProcessElement ], { x: 40, y: -80 });

      // then
      expect(flowLabel.x).to.equal(labelPosition.x + 40);
      expect(flowLabel.y).to.equal(labelPosition.y - 80);
    }));


    describe('undo', function() {

      it('should undo label with shape', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventElement = elementRegistry.get('StartEvent_1');

        var label = startEventElement.label;

        var labelPosition = {
          x: label.x,
          y: label.y
        };

        modeling.moveShapes([ startEventElement ], { x: 40, y: -80 });

        // when
        commandStack.undo();

        // then
        expect(label.x).to.equal(labelPosition.x);
        expect(label.y).to.equal(labelPosition.y);
      }));


      it('should move label with connection', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventElement = elementRegistry.get('StartEvent_2'),
            subProcessElement = elementRegistry.get('SubProcess_1'),
            flowLabel = elementRegistry.get('SequenceFlow_3_label');

        var labelPosition = {
          x: flowLabel.x,
          y: flowLabel.y
        };

        modeling.moveShapes([ startEventElement, subProcessElement ], { x: 40, y: -80 });

        // when
        commandStack.undo();

        // then
        expect(flowLabel.x).to.equal(labelPosition.x);
        expect(flowLabel.y).to.equal(labelPosition.y);
      }));

    });


    describe('redo', function() {

      it('should redo move label with shape', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventElement = elementRegistry.get('StartEvent_1');

        var label = startEventElement.label;

        var labelPosition = {
          x: label.x,
          y: label.y
        };

        modeling.moveShapes([ startEventElement ], { x: 40, y: -80 });
        commandStack.undo();

        // when
        commandStack.redo();

        // then
        expect(label.x).to.equal(labelPosition.x + 40);
        expect(label.y).to.equal(labelPosition.y - 80);
      }));


      it('should redo move label with connection', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventElement = elementRegistry.get('StartEvent_2'),
            subProcessElement = elementRegistry.get('SubProcess_1'),
            flowLabel = elementRegistry.get('SequenceFlow_3_label');

        var labelPosition = {
          x: flowLabel.x,
          y: flowLabel.y
        };

        modeling.moveShapes([ startEventElement, subProcessElement ], { x: 40, y: -80 });
        commandStack.undo();

        // when
        commandStack.redo();

        // then
        expect(flowLabel.x).to.equal(labelPosition.x + 40);
        expect(flowLabel.y).to.equal(labelPosition.y - 80);
      }));

    });

  });

});
