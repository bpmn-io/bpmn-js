'use strict';

require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - set color', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('execute', function() {


    it('setting fill color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // then
      expect(taskShape.businessObject.di.fill).to.equal('FUCHSIA');
    }));


    it('unsetting fill color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
    }));


    it('setting fill color without changing stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { fill: 'FUCHSIA', stroke: 'YELLOW' });

      // when
      modeling.setColor(taskShape, { fill: 'YELLOW' });

      // then
      expect(taskShape.businessObject.di.fill).to.equal('YELLOW');
      expect(taskShape.businessObject.di.stroke).to.equal('YELLOW');
    }));


    it('unsetting fill color without changing stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { fill: 'FUCHSIA', stroke: 'YELLOW' });

      // when
      modeling.setColor(taskShape, { fill: undefined });

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
      expect(taskShape.businessObject.di.stroke).to.equal('YELLOW');
    }));

    it('unsetting both fill and stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
      expect(taskShape.businessObject.di.stroke).not.to.exist;
    }));


    it('setting stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // then
      expect(taskShape.businessObject.di.stroke).to.equal('FUCHSIA');
      expect(taskShape.businessObject.di.fill).not.to.exist;
    }));


    it('unsetting stroke color', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);

      // then
      expect(taskShape.businessObject.di.stroke).not.to.exist;
      expect(taskShape.businessObject.di.fill).not.to.exist;
    }));


    it('setting fill color (multiple elements)', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

      // then
      expect(taskShape.businessObject.di.fill).to.equal('FUCHSIA');
      expect(startEventShape.businessObject.di.fill).to.equal('FUCHSIA');
      expect(taskShape.businessObject.di.stroke).not.to.exist;
      expect(startEventShape.businessObject.di.stroke).not.to.exist;
    }));


    it('unsetting fill color (multiple elements)', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');
      modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

      // when
      modeling.setColor([ taskShape, startEventShape ]);

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
      expect(startEventShape.businessObject.di.fill).not.to.exist;
    }));


    it('setting stroke color (multiple elements)', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });

      // then
      expect(taskShape.businessObject.di.stroke).to.equal('FUCHSIA');
      expect(startEventShape.businessObject.di.stroke).to.equal('FUCHSIA');
      expect(taskShape.businessObject.di.fill).not.to.exist;
      expect(startEventShape.businessObject.di.fill).not.to.exist;
    }));


    it('unsetting stroke color (multiple elements)', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');
      modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });

      // when
      modeling.setColor([ taskShape, startEventShape ]);

      // then
      expect(taskShape.businessObject.di.stroke).not.to.exist;
      expect(startEventShape.businessObject.di.stroke).not.to.exist;
    }));

  });


  describe('undo', function() {


    it('setting fill color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
    }));


    it('unsetting fill color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.fill).to.equal('FUCHSIA');
    }));


    it('setting stroke color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.stroke).not.to.exist;
    }));


    it('unsetting stroke color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.stroke).to.equal('FUCHSIA');
    }));


    it('setting fill color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
      expect(startEventShape.businessObject.di.fill).not.to.exist;
    }));


    it('unsetting fill color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');
      modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

      // when
      modeling.setColor([ taskShape, startEventShape ]);
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.fill).to.equal('FUCHSIA');
      expect(startEventShape.businessObject.di.fill).to.equal('FUCHSIA');
    }));


    it('setting stroke color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.stroke).not.to.exist;
      expect(startEventShape.businessObject.di.stroke).not.to.exist;
    }));


    it('unsetting stroke color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');
      modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });

      // when
      modeling.setColor([ taskShape, startEventShape ]);
      commandStack.undo();

      // then
      expect(taskShape.businessObject.di.stroke).to.equal('FUCHSIA');
      expect(startEventShape.businessObject.di.stroke).to.equal('FUCHSIA');
    }));

  });


  describe('redo', function() {


    it('setting fill color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.fill).to.equal('FUCHSIA');
    }));


    it('unsetting fill color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { fill: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
    }));


    it('setting stroke color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');

      // when
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.stroke).to.equal('FUCHSIA');
    }));


    it('unsetting stroke color', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      modeling.setColor(taskShape, { stroke: 'FUCHSIA' });

      // when
      modeling.setColor(taskShape);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.stroke).not.to.exist;
    }));


    it('setting fill color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.fill).to.equal('FUCHSIA');
      expect(startEventShape.businessObject.di.fill).to.equal('FUCHSIA');
    }));


    it('unsetting fill color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');
      modeling.setColor([ taskShape, startEventShape ], { fill: 'FUCHSIA' });

      // when
      modeling.setColor([ taskShape, startEventShape ]);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.fill).not.to.exist;
      expect(startEventShape.businessObject.di.fill).not.to.exist;
    }));


    it('setting stroke color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');

      // when
      modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.stroke).to.equal('FUCHSIA');
      expect(startEventShape.businessObject.di.stroke).to.equal('FUCHSIA');
    }));


    it('unsetting stroke color (multiple elements)', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_1');
      var startEventShape = elementRegistry.get('StartEvent_1');
      modeling.setColor([ taskShape, startEventShape ], { stroke: 'FUCHSIA' });

      // when
      modeling.setColor([ taskShape, startEventShape ]);
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.di.stroke).not.to.exist;
      expect(startEventShape.businessObject.di.stroke).not.to.exist;
    }));

  });

});
