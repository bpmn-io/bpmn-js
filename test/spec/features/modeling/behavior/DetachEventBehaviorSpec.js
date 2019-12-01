import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import { getBusinessObject } from '../../../../../lib/util/ModelUtil';


describe('features/modeling/behavior - detach events', function() {

  var testModules = [
    coreModule,
    modelingModule
  ];

  var detachEventBehaviorXML = require('./DetachEventBehavior.bpmn');

  beforeEach(bootstrapModeler(detachEventBehaviorXML, { modules: testModules }));


  describe('basics', function() {

    describe('create', function() {

      it('should replace', inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var process = elementRegistry.get('Process_1');

        var boundaryEvent = elementFactory.createShape({ type: 'bpmn:BoundaryEvent' });

        // when
        var intermediateThrowEvent = modeling.createElements(
          boundaryEvent, { x: 200, y: 100 }, process
        )[0];

        // then
        var intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent);

        expect(intermediateThrowEventBo.$type).to.equal('bpmn:IntermediateThrowEvent');
      }));


      it('should NOT replace', inject(function(elementFactory, elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('Task_1'),
            taskBo = getBusinessObject(task);

        var boundaryEvent = elementFactory.createShape({ type: 'bpmn:BoundaryEvent' }),
            boundaryEventBo = getBusinessObject(boundaryEvent);

        // when
        boundaryEvent = modeling.createElements(
          boundaryEvent, { x: 100, y: 60 }, task, { attach: true }
        )[0];

        // then
        expect(boundaryEventBo.$type).to.equal('bpmn:BoundaryEvent');
        expect(boundaryEventBo.attachedToRef).to.equal(taskBo);
      }));


      it('should copy properties', inject(
        function(bpmnFactory, elementFactory, elementRegistry, modeling) {

          // given
          var process = elementRegistry.get('Process_1');

          var boundaryEventBo = bpmnFactory.create('bpmn:BoundaryEvent', {
            name: 'foo'
          });

          var documentation = bpmnFactory.create('bpmn:Documentation', {
            text: 'bar'
          });

          boundaryEventBo.documentation = [ documentation ];

          documentation.$parent = boundaryEventBo;

          var boundaryEvent = elementFactory.createShape({
            type: 'bpmn:BoundaryEvent',
            businessObject: boundaryEventBo
          });

          // when
          var intermediateThrowEvent = modeling.createElements(
            boundaryEvent, { x: 200, y: 100 }, process
          )[0];

          // then
          var intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent);

          expect(intermediateThrowEventBo.name).to.equal('foo');
          expect(intermediateThrowEventBo.documentation).to.have.lengthOf(1);
          expect(intermediateThrowEventBo.documentation[0].text).to.equal('bar');
        }
      ));

    });


    describe('move', function() {

      it('should replace', inject(function(elementRegistry, modeling) {

        // given
        var process = elementRegistry.get('Process_1'),
            boundaryEvent = elementRegistry.get('BoundaryEvent_1');

        // when
        modeling.moveElements([ boundaryEvent ], { x: 0, y: 100 }, process);

        // then
        var intermediateThrowEvent = elementRegistry.get('BoundaryEvent_1'),
            intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent);

        expect(intermediateThrowEvent).to.exist;
        expect(intermediateThrowEventBo.$type).to.equal('bpmn:IntermediateThrowEvent');
        expect(intermediateThrowEventBo.attachedToRef).not.to.exist;
      }));


      it('should NOT replace', inject(function(elementRegistry, modeling) {

        // given
        var task = elementRegistry.get('Task_1'),
            taskBo = getBusinessObject(task),
            boundaryEvent = elementRegistry.get('BoundaryEvent_1');

        // when
        modeling.moveElements([ boundaryEvent ], { x: 0, y: -80 }, task, { attach: true });

        // then
        boundaryEvent = elementRegistry.get('BoundaryEvent_1');

        var boundaryEventBo = getBusinessObject(boundaryEvent);

        expect(boundaryEventBo.$type).to.equal('bpmn:BoundaryEvent');
        expect(boundaryEventBo.attachedToRef).to.equal(taskBo);
      }));


      it('should replace multiple', inject(function(canvas, elementRegistry, modeling) {

        // given
        var boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
            boundaryConditionalEvent = elementRegistry.get('BoundaryConditionalEvent'),
            root = canvas.getRootElement();

        // when
        modeling.moveElements([ boundaryEvent, boundaryConditionalEvent ], { x: 0, y: 200 }, root);

        // then
        var intermediateThrowEvent = elementRegistry.get('BoundaryEvent_1'),
            intermediateCatchEvent = elementRegistry.get('BoundaryConditionalEvent'),
            intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent),
            intermediateCatchEventBo = getBusinessObject(intermediateCatchEvent);

        expect(intermediateCatchEventBo.$type).to.equal('bpmn:IntermediateCatchEvent');
        expect(intermediateCatchEventBo.attachedToRef).not.to.exist;

        expect(intermediateThrowEventBo.$type).to.equal('bpmn:IntermediateThrowEvent');
        expect(intermediateThrowEventBo.attachedToRef).not.to.exist;
      }));


      describe('properties', function() {

        it('should copy properties', inject(function(elementRegistry, modeling) {

          // given
          var process = elementRegistry.get('Process_1'),
              boundaryEvent = elementRegistry.get('BoundaryEvent_1');

          // when
          modeling.moveElements([ boundaryEvent ], { x: 0, y: 100 }, process);

          // then
          var intermediateThrowEvent = elementRegistry.get('BoundaryEvent_1'),
              intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent);

          expect(intermediateThrowEventBo.name).to.equal('foo');
          expect(intermediateThrowEventBo.documentation).to.have.lengthOf(1);
          expect(intermediateThrowEventBo.documentation[0].text).to.equal('bar');
        }));


        describe('event definitions', function() {

          var ids = [
            'BoundaryConditionalEvent',
            'BoundaryMessageEvent',
            'BoundarySignalEvent',
            'BoundaryTimerEvent'
          ];

          ids.forEach(function(id) {

            it('should copy event definition', inject(function(elementRegistry, modeling) {

              // given
              var process = elementRegistry.get('Process_1'),
                  boundaryEvent = elementRegistry.get(id),
                  boundaryEventBo = getBusinessObject(boundaryEvent),
                  eventDefinitions = boundaryEventBo.eventDefinitions;

              // when
              modeling.moveElements([ boundaryEvent ], { x: 0, y: 100 }, process);

              // then
              var intermediateCatchEvent = elementRegistry.get(id),
                  intermediateCatchEventBo = getBusinessObject(intermediateCatchEvent);

              expect(intermediateCatchEventBo.$type).to.equal('bpmn:IntermediateCatchEvent');
              expect(intermediateCatchEventBo.eventDefinitions).to.jsonEqual(eventDefinitions, skipId);
            }));

          });


          it('should NOT create event definition', inject(function(elementRegistry, modeling) {

            // given
            var process = elementRegistry.get('Process_1'),
                boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
                boundaryEventBo = getBusinessObject(boundaryEvent),
                eventDefinitions = boundaryEventBo.eventDefinitions;

            // when
            modeling.moveElements([ boundaryEvent ], { x: 0, y: 100 }, process);

            // then
            var intermediateThrowEvent = elementRegistry.get('BoundaryEvent_1'),
                intermediateThrowEventBo = getBusinessObject(intermediateThrowEvent);

            expect(intermediateThrowEventBo.$type).to.equal('bpmn:IntermediateThrowEvent');
            expect(intermediateThrowEventBo.eventDefinitions).to.jsonEqual(eventDefinitions, skipId);
          }));

        });

      });

    });

  });


  describe('connections', function() {

    it('should NOT remove outgoing connection', inject(function(elementRegistry, modeling) {

      // given
      var process = elementRegistry.get('Process_1'),
          endEvent = elementRegistry.get('EndEvent_1'),
          boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      // when
      modeling.moveElements([ boundaryEvent ], { x: 0, y: 100 }, process);

      // then
      var intermediateThrowEvent = elementRegistry.get('BoundaryEvent_1');

      expect(intermediateThrowEvent.outgoing).to.have.lengthOf(1);
      expect(endEvent.incoming).to.have.lengthOf(1);
    }));


    it('should lay out connection once', inject(function(eventBus, elementRegistry, modeling) {

      // given
      var process = elementRegistry.get('Process_1'),
          boundaryEvent = elementRegistry.get('BoundaryEvent_1');

      var layoutSpy = sinon.spy();

      eventBus.on('commandStack.connection.layout.execute', layoutSpy);

      // when
      modeling.moveElements([ boundaryEvent ], { x: 0, y: 100 }, process);

      // then
      expect(layoutSpy).to.be.calledOnce;
    }));

  });


  describe('labels', function() {

    it('should NOT replace', inject(function(elementRegistry, modeling) {

      var process = elementRegistry.get('Process_1'),
          boundaryEvent = elementRegistry.get('BoundaryEvent_1'),
          label = boundaryEvent.label;

      // when
      modeling.moveElements([ label ], { x: 0, y: 100 }, process);

      // then
      expect(elementRegistry.get('BoundaryEvent_1')).to.equal(boundaryEvent);
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
