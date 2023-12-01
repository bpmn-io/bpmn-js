import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import diagramXML from './CompensateBoundaryEventBehaviour.bpmn';


describe('features/modeling/behavior - compensation boundary event', function() {

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should add `isForCompensation`', function() {

    it('on append', inject(function(elementFactory, modeling, elementRegistry) {

      // given
      var boundaryEventShape = elementRegistry.get('Attached_Event');
      var taskShape = elementFactory.createShape({ type: 'bpmn:Task' });

      // when
      var task = modeling.appendShape(boundaryEventShape, taskShape, { x: 100, y: 100 });

      // then
      expect(task.businessObject.isForCompensation).to.be.true;
    }));


    it('on connect', inject(function(modeling, elementRegistry) {

      // given
      var boundaryEventShape = elementRegistry.get('Attached_Event');
      var taskShape = elementRegistry.get('Task');

      // when
      modeling.connect(boundaryEventShape, taskShape);

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;
    }));


    it('on reconnect', inject(function(modeling, elementRegistry) {

      // given
      var taskShape = elementRegistry.get('Task');
      var connection = elementRegistry.get('Association');

      // when
      modeling.reconnectEnd(connection, taskShape, { x: 100, y: 100 });

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;
    }));
  });


  describe('should remove `isForCompensation`', function() {

    it('on remove element', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_Compensation');
      var boundaryEventShape = elementRegistry.get('Attached_Event2');

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;

      // when
      modeling.removeElements([ boundaryEventShape ]);

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.false;
    }));


    it('on delete connection', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_Compensation');
      var connection = elementRegistry.get('Association');

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;

      // when
      modeling.removeConnection(connection);

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.false;
    }));


    it('on reconnect', inject(function(modeling, elementRegistry) {

      // given
      var oldShape = elementRegistry.get('Task_Compensation');
      var taskShape = elementRegistry.get('Task');
      var connection = elementRegistry.get('Association');

      // when
      modeling.reconnectEnd(connection, taskShape, { x: 100, y: 100 });

      // then
      expect(oldShape.businessObject.isForCompensation).to.be.false;
    }));

  });
});
