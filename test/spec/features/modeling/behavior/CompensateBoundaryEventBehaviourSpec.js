import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import diagramXML from './CompensateBoundaryEventBehaviour.bpmn';
import { is } from '../../../../../lib/util/ModelUtil';


describe('features/modeling/behavior - compensation boundary event', function() {

  const testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should add `isForCompensation`', function() {

    it('on append', inject(function(elementFactory, modeling, elementRegistry) {

      // given
      const boundaryEventShape = elementRegistry.get('Attached_Event');
      const taskShape = elementFactory.createShape({ type: 'bpmn:Task' });

      // when
      const task = modeling.appendShape(boundaryEventShape, taskShape, { x: 100, y: 100 });

      // then
      expect(task.businessObject.isForCompensation).to.be.true;
    }));


    it('on connect', inject(function(modeling, elementRegistry) {

      // given
      const boundaryEventShape = elementRegistry.get('Attached_Event');
      const taskShape = elementRegistry.get('Task');

      // when
      modeling.connect(boundaryEventShape, taskShape);

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;
    }));


    it('on reconnect', inject(function(modeling, elementRegistry) {

      // given
      const taskShape = elementRegistry.get('Task');
      const connection = elementRegistry.get('Association');

      // when
      modeling.reconnectEnd(connection, taskShape, { x: 100, y: 100 });

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;
    }));


    it('on replace', inject(function(bpmnReplace, elementRegistry) {

      // given
      const event = elementRegistry.get('NoneEvent');
      const task = elementRegistry.get('NoneActivity');

      // when
      bpmnReplace.replaceElement(event, {
        type: 'bpmn:BoundaryEvent' ,
        eventDefinitionType: 'bpmn:CompensateEventDefinition'
      });

      // then
      expect(task.businessObject.isForCompensation).to.be.true;
      expect(is(task.incoming[0], 'bpmn:Association')).to.be.true;
    }));
  });


  describe('should remove `isForCompensation`', function() {

    it('on remove element', inject(function(elementRegistry, modeling) {

      // given
      const taskShape = elementRegistry.get('Task_Compensation');
      const boundaryEventShape = elementRegistry.get('Attached_Event2');

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;

      // when
      modeling.removeElements([ boundaryEventShape ]);

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.false;
    }));


    it('on delete connection', inject(function(elementRegistry, modeling) {

      // given
      const taskShape = elementRegistry.get('Task_Compensation');
      const connection = elementRegistry.get('Association');

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;

      // when
      modeling.removeConnection(connection);

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.false;
    }));


    it('on reconnect', inject(function(modeling, elementRegistry) {

      // given
      const oldShape = elementRegistry.get('Task_Compensation');
      const taskShape = elementRegistry.get('Task');
      const connection = elementRegistry.get('Association');

      // when
      modeling.reconnectEnd(connection, taskShape, { x: 100, y: 100 });

      // then
      expect(oldShape.businessObject.isForCompensation).to.be.false;
    }));


    it('on replace', inject(function(bpmnReplace, elementRegistry) {

      // given
      const event = elementRegistry.get('Attached_Event2');
      const task = elementRegistry.get('Task_Compensation');

      // when
      bpmnReplace.replaceElement(event, { type: 'bpmn:BoundaryEvent', eventDefinitionType: 'bpmn:MessageEventDefinition' });

      // then
      expect(task.businessObject.isForCompensation).to.be.false;
      expect(is(task.incoming[0], 'bpmn:SequenceFlow')).to.be.true;
    }));

  });


  it('should remove illegal connections', inject(function(modeling, elementRegistry) {

    // given
    const task = elementRegistry.get('IllegalConnections');
    const event = elementRegistry.get('Attached_Event');

    expect(task.incoming).to.have.length(1);
    expect(task.outgoing).to.have.length(1);

    // when
    modeling.connect(event, task);

    // then
    expect(task.incoming).to.have.length(1);
    expect(task.outgoing).to.have.length(0);
  }));

});
