import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import { getBusinessObject } from '../../../../../lib/util/ModelUtil';


describe('features/modeling/behavior - attach events', function() {

  var testModules = [
    coreModule,
    modelingModule
  ];

  var attachEventBehaviorXML = require('./AttachEventBehavior.bpmn');

  beforeEach(bootstrapModeler(attachEventBehaviorXML, { modules: testModules }));


  describe('basics', function() {

    describe('create', function() {

      it('should replace', inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('Task_1'),
            taskBo = getBusinessObject(task),
            intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

        // when
        var boundaryEvent = modeling.createElements(
          [ intermediateEvent ], { x: 300, y: 140 }, task, { attach: true }
        )[0];

        // then
        var boundaryEventBo = getBusinessObject(boundaryEvent);

        expect(boundaryEventBo.$type).to.equal('bpmn:BoundaryEvent');
        expect(boundaryEventBo.attachedToRef).to.equal(taskBo);
      }));


      it('should NOT replace', inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var process = elementRegistry.get('Process_1'),
            intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

        // when
        intermediateEvent = modeling.createElements([ intermediateEvent ], { x: 300, y: 240 }, process)[0];

        // then
        var intermediateEventBo = getBusinessObject(intermediateEvent);

        expect(intermediateEventBo.$type).to.equal('bpmn:IntermediateThrowEvent');
        expect(intermediateEventBo.attachedToRef).not.to.exist;
      }));


      it('should copy properties', inject(
        function(bpmnFactory, elementFactory, elementRegistry, modeling) {

          // given
          var task = elementRegistry.get('Task_1');

          var intermediateThrowEventBo = bpmnFactory.create('bpmn:IntermediateThrowEvent', {
            name: 'foo'
          });

          var documentation = bpmnFactory.create('bpmn:Documentation', {
            text: 'bar'
          });

          intermediateThrowEventBo.documentation = [ documentation ];

          documentation.$parent = intermediateThrowEventBo;

          var intermediateThrowEvent = elementFactory.createShape({
            type: 'bpmn:IntermediateThrowEvent',
            businessObject: intermediateThrowEventBo
          });

          // when
          var boundaryEvent = modeling.createElements(
            [ intermediateThrowEvent ], { x: 300, y: 140 }, task, { attach: true }
          )[0];

          // then
          var boundaryEventBo = getBusinessObject(boundaryEvent);

          expect(boundaryEventBo.name).to.equal('foo');
          expect(boundaryEventBo.documentation).to.have.lengthOf(1);
          expect(boundaryEventBo.documentation[0].text).to.equal('bar');
        }
      ));

    });


    describe('move', function() {

      it('should replace', inject(function(elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('Task_1'),
            taskBo = getBusinessObject(task),
            intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1');

        // when
        modeling.moveElements([ intermediateThrowEvent ], { x: 100, y: 40 }, task, { attach: true });

        // then
        var boundaryEvent = elementRegistry.get('IntermediateThrowEvent_1'),
            boundaryEventBo = getBusinessObject(boundaryEvent);

        expect(boundaryEvent).to.exist;
        expect(boundaryEventBo.$type).to.equal('bpmn:BoundaryEvent');
        expect(boundaryEventBo.attachedToRef).to.equal(taskBo);
      }));


      it('should NOT replace', inject(function(elementRegistry, modeling) {

        // given
        var process = elementRegistry.get('Process_1'),
            intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1'),
            intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent);

        // when
        modeling.moveElements([ intermediateThrowEvent ], { x: 100, y: 100 }, process);

        // then
        expect(intermediateThrowEvent).to.exist;
        expect(intermediateThrowEventBo.$type).to.equal('bpmn:IntermediateThrowEvent');
        expect(intermediateThrowEventBo.attachedToRef).not.to.exist;
      }));


      describe('properties', function() {

        it('should copy properties', inject(function(elementRegistry, modeling) {

          // given
          var task = elementRegistry.get('Task_1'),
              intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1');

          // when
          modeling.moveElements([ intermediateThrowEvent ], { x: 100, y: 40 }, task, { attach: true });

          // then
          var boundaryEvent = elementRegistry.get('IntermediateThrowEvent_1'),
              boundaryEventBo = getBusinessObject(boundaryEvent);

          expect(boundaryEventBo.name).to.equal('foo');
          expect(boundaryEventBo.documentation).to.have.lengthOf(1);
          expect(boundaryEventBo.documentation[0].text).to.equal('bar');
        }));


        describe('event definitions', function() {

          var ids = [
            'ConditionalCatchEvent',
            'IntermediateThrowEvent_1',
            'MessageCatchEvent',
            'SignalCatchEvent',
            'TimerCatchEvent',
          ];

          function getDelta(element, task) {
            return {
              x: task.x + task.width / 2 - element.x - element.width / 2,
              y: task.y + task.height - element.y - element.height / 2
            };
          }

          ids.forEach(function(id) {

            it('should copy event definition', inject(function(elementRegistry, modeling) {

              // given
              var element = elementRegistry.get(id),
                  elementBo = getBusinessObject(element),
                  eventDefinitions = elementBo.eventDefinitions,
                  task = elementRegistry.get('Task_1');

              // when
              modeling.moveElements([ element ], getDelta(element, task), task, { attach: true });

              // then
              var boundaryEvent = elementRegistry.get(id),
                  boundaryEventBo = getBusinessObject(boundaryEvent);

              expect(boundaryEventBo.$type).to.equal('bpmn:BoundaryEvent');
              expect(boundaryEventBo.eventDefinitions).to.jsonEqual(eventDefinitions, skipId);
            }));

          });

        });

      });

    });

  });


  describe('connections', function() {

    it('should remove incoming connection', inject(function(elementRegistry, modeling) {

      // given
      var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1'),
          startEvent = elementRegistry.get('StartEvent_1'),
          task = elementRegistry.get('Task_1');

      // when
      modeling.moveElements([ intermediateThrowEvent ], { x: 100, y: 40 }, task, { attach: true });

      // then
      var boundaryEvent = elementRegistry.get('IntermediateThrowEvent_1');

      expect(boundaryEvent.incoming).to.have.lengthOf(0);
      expect(startEvent.outgoing).to.have.lengthOf(0);
    }));


    it('should NOT remove outgoing connection', inject(function(elementRegistry, modeling) {

      // given
      var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1'),
          task = elementRegistry.get('Task_1');

      // when
      modeling.moveElements([ intermediateThrowEvent ], { x: 100, y: 40 }, task, { attach: true });

      // then
      var boundaryEvent = elementRegistry.get('IntermediateThrowEvent_1');

      expect(boundaryEvent.outgoing).to.have.lengthOf(1);
      expect(task.incoming).to.have.lengthOf(1);
    }));


    it('should lay out connection once', inject(function(elementRegistry, eventBus, modeling) {

      // given
      var intermediateThrowEvent = elementRegistry.get('IntermediateThrowEvent_1'),
          task = elementRegistry.get('Task_1');

      var layoutSpy = sinon.spy();

      eventBus.on('commandStack.connection.layout.execute', layoutSpy);

      // when
      modeling.moveElements([ intermediateThrowEvent ], { x: 100, y: 40 }, task, { attach: true });

      // then
      expect(layoutSpy).to.be.calledOnce;
    }));

  });

});



// helpers //////////
function skipId(key, value) {
  if (key === 'id') {
    return;
  }

  return value;
}
