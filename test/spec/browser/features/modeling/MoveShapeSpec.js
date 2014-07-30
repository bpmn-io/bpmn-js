'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapBpmnJS, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../../lib/features/modeling'),
    drawModule = require('../../../../../lib/draw');


describe('features/modeling - move shape', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf-8');

  var testModules = [ drawModule, modelingModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('shape handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.getById('StartEvent_1'),
          startEvent = startEventShape.businessObject;

      var oldPosition = {
        x: startEventShape.x,
        y: startEventShape.y
      };

      // when
      modeling.moveShape(startEventShape, { dx: 0, dy: 50 });

      // then
      expect(startEvent.di.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.bounds.y).toBe(oldPosition.y + 50);
    }));


    it('should execute on label', inject(function(elementRegistry, modeling) {

      // given
      var labelShape = elementRegistry.getById('StartEvent_1_label'),
          startEvent = labelShape.businessObject;

      var oldPosition = {
        x: labelShape.x,
        y: labelShape.y
      };

      // when
      modeling.moveShape(labelShape, { dx: 0, dy: 50 });

      // then
      expect(startEvent.di.label.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.label.bounds.y).toBe(oldPosition.y + 50);
    }));

  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var startEventShape = elementRegistry.getById('StartEvent_1'),
          startEvent = startEventShape.businessObject;

      var oldPosition = {
        x: startEventShape.x,
        y: startEventShape.y
      };

      modeling.moveShape(startEventShape, { dx: 0, dy: 50 });

      // when
      commandStack.undo();

      // then
      expect(startEvent.di.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.bounds.y).toBe(oldPosition.y);
    }));


    it('should undo on label', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var labelShape = elementRegistry.getById('StartEvent_1_label'),
          startEvent = labelShape.businessObject;

      var oldPosition = {
        x: labelShape.x,
        y: labelShape.y
      };

      modeling.moveShape(labelShape, { dx: 0, dy: 50 });

      // when
      commandStack.undo();

      // then
      expect(startEvent.di.label.bounds.x).toBe(oldPosition.x);
      expect(startEvent.di.label.bounds.y).toBe(oldPosition.y);
    }));

  });

});