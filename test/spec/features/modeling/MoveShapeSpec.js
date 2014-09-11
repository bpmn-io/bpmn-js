'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    drawModule = require('../../../../lib/draw');


describe('features/modeling - move shape', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf-8');

  var testModules = [ drawModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('shape handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var startEventElement = elementRegistry.getById('StartEvent_1'),
          startEvent = startEventElement.businessObject;

      var sequenceFlowElement = elementRegistry.getById('SequenceFlow_1'),
          sequenceFlow = sequenceFlowElement.businessObject;

      var oldPosition = {
        x: startEventElement.x,
        y: startEventElement.y
      };

      // when
      modeling.moveShape(startEventElement, { x: 0, y: 50 });

      // then
      expect(startEvent.di.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.bounds.y).toBe(oldPosition.y + 50);

      // expect flow layout
      expect(sequenceFlowElement.waypoints).toDeepEqual([
        { original: { x: 370, y: 310 }, x: 388, y: 310 },
        { x: 404, y: 310 },
        { x: 404, y: 260 },
        { original: { x: 470, y: 260 }, x: 420, y: 260 }
      ]);

      expect(sequenceFlow.di.waypoint).toDeepEqual([
        { $type: 'dc:Point', x: 388, y: 310 },
        { $type: 'dc:Point', x: 404, y: 310 },
        { $type: 'dc:Point', x: 404, y: 260 },
        { $type: 'dc:Point', x: 420, y: 260 }
      ]);
    }));


    it('should execute on label', inject(function(elementRegistry, modeling) {

      // given
      var labelElement = elementRegistry.getById('StartEvent_1_label'),
          startEvent = labelElement.businessObject;

      var oldPosition = {
        x: labelElement.x,
        y: labelElement.y
      };

      // when
      modeling.moveShape(labelElement, { x: 0, y: 50 });

      // then
      expect(startEvent.di.label.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.label.bounds.y).toBe(oldPosition.y + 50);
    }));


    it('should move label with element', inject(function(elementRegistry, modeling) {

      // given
      var startEventElement = elementRegistry.getById('StartEvent_1'),
          startEvent = startEventElement.businessObject;

      var label = startEventElement.label;

      var labelPosition = {
        x: label.x,
        y: label.y
      };

      // when
      modeling.moveShape(startEventElement, { x: 40, y: -80 });

      // then
      expect(label.x).toBe(labelPosition.x + 40);
      expect(label.y).toBe(labelPosition.y - 80);
    }));

  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var startEventElement = elementRegistry.getById('StartEvent_1'),
          startEvent = startEventElement.businessObject;

      var oldPosition = {
        x: startEventElement.x,
        y: startEventElement.y
      };

      modeling.moveShape(startEventElement, { x: 0, y: 50 });

      // when
      commandStack.undo();

      // then
      expect(startEvent.di.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.bounds.y).toBe(oldPosition.y);
    }));


    it('should undo on label', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var labelElement = elementRegistry.getById('StartEvent_1_label'),
          startEvent = labelElement.businessObject;

      var oldPosition = {
        x: labelElement.x,
        y: labelElement.y
      };

      modeling.moveShape(labelElement, { x: 0, y: 50 });

      // when
      commandStack.undo();

      // then
      expect(startEvent.di.label.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.label.bounds.y).toBe(oldPosition.y);
    }));

  });


  describe('redo support', function() {

    it('should redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var startEventElement = elementRegistry.getById('StartEvent_1'),
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
      expect(startEvent.di.bounds.x).toBe(newPosition.x);
      expect(startEvent.di.bounds.y).toBe(newPosition.y);
    }));


    it('should redo on label', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var labelElement = elementRegistry.getById('StartEvent_1_label'),
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
      expect(startEvent.di.label.bounds.x).toBe(newPosition.x);
      expect(startEvent.di.label.bounds.y).toBe(newPosition.y);
    }));

  });

});