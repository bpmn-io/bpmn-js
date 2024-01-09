import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { is } from 'lib/util/ModelUtil';

import copyPasteModule from 'lib/features/copy-paste';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import diagramXML from './CompensateBoundaryEventBehavior.bpmn';


describe('features/modeling/behavior - compensation boundary event', function() {

  const testModules = [
    copyPasteModule,
    coreModule,
    modelingModule
  ];

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
      const taskShape = elementRegistry.get('AnotherTask');

      // when
      modeling.connect(boundaryEventShape, taskShape);

      // then
      expect(taskShape.businessObject.isForCompensation).to.be.true;
    }));


    it('on reconnect start', inject(function(modeling, elementRegistry) {

      // given
      const compensateBoundaryEvent = elementRegistry.get('Attached_Event');
      const sequenceFlow = elementRegistry.get('NoneFlow');
      const task = sequenceFlow.target;

      // when
      modeling.reconnectStart(sequenceFlow, compensateBoundaryEvent, {
        x: compensateBoundaryEvent.x,
        y: compensateBoundaryEvent.y
      });

      // then
      expect(task.businessObject.isForCompensation).to.be.true;

      expect(task.incoming).to.have.length(1);
      const incomingConnection = task.incoming[0];

      expect(is(incomingConnection, 'bpmn:Association')).to.be.true;
      expect(incomingConnection.businessObject).to.be.have.property('associationDirection', 'One');
    }));


    it('on reconnect end', inject(function(modeling, elementRegistry) {

      // given
      const taskShape = elementRegistry.get('AnotherTask');
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


    it('on remove connection', inject(function(elementRegistry, modeling) {

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


    // TODO(@barmac): implement together with allowing the interaction in the rules
    it.skip('on reconnect start', inject(function(modeling, elementRegistry) {

      // given
      const taskShape = elementRegistry.get('Task');
      const compensationAssociation = elementRegistry.get('Association');
      const compensationActivity = compensationAssociation.target;

      // when
      modeling.reconnectStart(compensationAssociation, taskShape, { x: taskShape.x, y: taskShape.y });

      // then
      expect(compensationActivity.businessObject.isForCompensation).to.be.false;

      expect(compensationActivity.incoming).to.have.length(1);
      const incomingConnection = compensationActivity.incoming[0];

      expect(is(incomingConnection, 'bpmn:SequenceFlow')).to.be.true;
    }));


    it('on reconnect end', inject(function(modeling, elementRegistry) {

      // given
      const oldShape = elementRegistry.get('Task_Compensation');
      const taskShape = elementRegistry.get('Task');
      const connection = elementRegistry.get('Association');

      // when
      modeling.reconnectEnd(connection, taskShape, { x: taskShape.x, y: taskShape.y });

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


  describe('remove connections', function() {

    it('should remove disallowed connections on connect', inject(function(modeling, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_DisallowedConnections');
      const event = elementRegistry.get('Attached_Event');

      expect(task.incoming).to.have.length(1);
      expect(task.outgoing).to.have.length(1);

      // when
      modeling.connect(event, task);

      // then
      expect(task.incoming).to.have.length(1);
      expect(task.outgoing).to.have.length(0);
    }));


    it('should remove disallowed connections on reconnect', inject(function(modeling, elementRegistry) {

      // given
      const task = elementRegistry.get('Task_DisallowedConnections');
      const connection = elementRegistry.get('Association');

      // when
      modeling.reconnectEnd(connection, task, { x: 100, y: 100 });

      // then
      expect(task.incoming).to.have.length(1);
      expect(task.outgoing).to.have.length(0);
    }));


    it('should remove existing compensation association when new one is created', inject(
      function(modeling, elementRegistry) {

        // given
        const task = elementRegistry.get('AnotherTask');
        const event = elementRegistry.get('Attached_Event2');

        // when
        modeling.connect(event, task);

        // then
        expect(task.incoming).to.have.length(1);
        expect(event.outgoing).to.have.length(1);

        expect(task.incoming[0]).to.eql(event.outgoing[0]);
      }
    ));


    it('should remove association when no longer for compensation', inject(
      function(bpmnReplace, elementRegistry) {

        // given
        let event = elementRegistry.get('ReplacedEvent'),
            compensationActivity = event.outgoing[0].target;

        // when
        event = bpmnReplace.replaceElement(event, {
          type: 'bpmn:BoundaryEvent' ,
          eventDefinitionType: 'bpmn:MessageEventDefinition'
        });

        // then
        expect(compensationActivity.incoming).to.have.lengthOf(1);
        expect(compensationActivity.incoming[0].source).to.eql(event);
      }
    ));

  });


  describe('remove attachers', function() {

    it('should remove attachers of compensation activity', inject(function(elementRegistry, modeling) {

      // given
      const event = elementRegistry.get('Attached_Event'),
            task = elementRegistry.get('Task');

      // when
      modeling.connect(event, task);

      // then
      expect(task.attachers).to.be.empty;
      expect(task.businessObject.isForCompensation).to.be.true;
    }));


    it('should NOT remove attachers of non-compensation activity', inject(function(elementRegistry, bpmnReplace) {

      // given
      let event = elementRegistry.get('MultiBoundary'),
          tasks = event.outgoing.map(({ target }) => target);


      // when
      event = bpmnReplace.replaceElement(event, {
        type: 'bpmn:BoundaryEvent' ,
        eventDefinitionType: 'bpmn:CompensateEventDefinition'
      });

      // then
      expect(event.outgoing).to.have.lengthOf(1);

      const compensationAcivity = event.outgoing[0].target;
      expect(compensationAcivity.businessObject.isForCompensation).to.be.true;

      for (const task of tasks.filter(task => task !== compensationAcivity)) {
        expect(task.attachers).to.have.lengthOf(1);
        expect(task.businessObject.isForCompensation).to.be.false;
      }
    }));

  });


  it('should add `isForCompensation` to exactly 1 candidate activity on replace', inject(
    function(bpmnReplace, elementRegistry) {

      // given
      let event = elementRegistry.get('MultiOutgoing');
      const tasks = event.outgoing.map(flow => flow.target);

      // when
      event = bpmnReplace.replaceElement(event, {
        type: 'bpmn:BoundaryEvent' ,
        eventDefinitionType: 'bpmn:CompensateEventDefinition'
      });

      // then
      expect(event.outgoing).to.have.lengthOf(1);

      const target = event.outgoing[0].target;
      expect(target.businessObject.isForCompensation).to.be.true;

      const otherTasks = tasks.filter(task => task !== target);

      for (const task of otherTasks) {
        expect(task.businessObject.isForCompensation).to.be.false;
      }
    })
  );


  it('should NOT break when there are no outgoing connections (to compensation)', inject(
    function(elementRegistry, bpmnReplace) {

      // given
      const event = elementRegistry.get('NoneBoundary');

      // when
      const action = () => {
        bpmnReplace.replaceElement(event, {
          type: 'bpmn:BoundaryEvent' ,
          eventDefinitionType: 'bpmn:CompensateEventDefinition'
        });
      };

      // then
      expect(action).not.to.throw();
    }
  ));


  it('should NOT break when there are no outgoing connections (from compensation)', inject(
    function(elementRegistry, bpmnReplace) {

      // given
      const event = elementRegistry.get('Attached_Event');

      // when
      const action = () => {
        bpmnReplace.replaceElement(event, {
          type: 'bpmn:BoundaryEvent' ,
          eventDefinitionType: 'bpmn:MessageEventDefinition'
        });
      };

      // then
      expect(action).not.to.throw();
    }
  ));


  it('should NOT crash when core `replace` component is used', inject(
    function(elementRegistry, replace) {

      // given
      const task = elementRegistry.get('Task_Compensation');

      // when
      const action = () => {
        replace.replaceElement(task,
          {
            type: 'bpmn:ManualTask'
          }
        );
      };

      // then
      expect(action).not.to.throw();
    }
  ));


  describe('copy and paste', function() {

    it('should NOT break on copy and paste', inject(function(canvas, copyPaste, elementRegistry) {

      // given
      copyPaste.copy([
        elementRegistry.get('Task_BoundaryEvent2'),
        elementRegistry.get('Task_Compensation')
      ]);

      // when
      var copiedElements = copyPaste.paste({
        element: canvas.getRootElement(),
        point: {
          x: 100,
          y: 100
        }
      });

      // then
      expect(copiedElements).to.have.lengthOf(4);
      expect(copiedElements.filter(element => is(element, 'bpmn:Association'))).to.have.length(1);
      expect(copiedElements.filter(element => is(element, 'bpmn:BoundaryEvent'))).to.have.length(1);
      expect(copiedElements.filter(element => is(element, 'bpmn:Task'))).to.have.length(2);
    }));

  });

});
