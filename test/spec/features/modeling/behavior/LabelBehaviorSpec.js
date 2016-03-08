'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var assign = require('lodash/object/assign');

var modelingModule = require('../../../../../lib/features/modeling'),
    coreModule = require('../../../../../lib/core');

var LabelUtil = require('../../../../../lib/util/LabelUtil');


describe('behavior - LabelBehavior', function() {

  var diagramXML = require('../../../../fixtures/bpmn/basic.bpmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('add label', function() {

    it('should add to sequence flow', inject(function(elementRegistry, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1'),
          task = elementRegistry.get('Task_1');

      // when
      var connection = modeling.connect(startEvent, task);

      // then
      expect(connection.label).to.exist;
    }));


    it('should add to exclusive gateway', inject(function(elementFactory, elementRegistry, modeling) {

      // given
      var parentShape = elementRegistry.get('Process_1'),
          newShapeAttrs = { type: 'bpmn:ExclusiveGateway' };

      // when
      var newShape = modeling.createShape(newShapeAttrs, { x: 50, y: 50 }, parentShape);

      // then
      expect(newShape.label).to.exist;
    }));


    it('should not add to task', inject(function(elementFactory, elementRegistry, modeling) {

      // given
      var parentShape = elementRegistry.get('Process_1'),
          newShapeAttrs = { type: 'bpmn:Task' };

      // when
      var newShape = modeling.createShape(newShapeAttrs, { x: 50, y: 50 }, parentShape);

      // then
      expect(newShape.label).not.to.exist;
    }));


    describe('on append', function() {

      it('correctly wired and positioned', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:EndEvent' });

        var label = targetShape.label;

        // then
        expect(label).to.exist;
        expect(elementRegistry.get(label.id)).to.exist;

        expect(label).to.have.bounds(assign({ x: 262, y: 138 }, LabelUtil.DEFAULT_LABEL_SIZE));
      }));


      it('with di', inject(function(elementRegistry, modeling, commandStack) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:EndEvent' }),
            target = targetShape.businessObject;

        // then
        expect(target.di.label).to.exist;

        expect(target.di.label).to.have.bounds(targetShape.label);
      }));

    });


    it('should add with di', inject(function(elementFactory, elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      var targetShape = modeling.appendShape(startEventShape, { type: 'bpmn:EndEvent' }),
          target = targetShape.businessObject;

      // then
      expect(target.di.label).to.exist;

      expect(target.di.label).to.have.bounds(targetShape.label);
    }));

  });


  describe('move label', function() {

    it('should move start event label', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1'),
          startEvent = startEventShape.businessObject,
          labelShape = startEventShape.label;

      // when
      modeling.moveElements([ labelShape ], { x: 10, y: -10 });

      // then
      expect(labelShape).to.have.position({ x: 156, y: 128 });
      expect(startEvent.di.label).to.have.position({ x: 156, y: 128 });
    }));

  });


});
