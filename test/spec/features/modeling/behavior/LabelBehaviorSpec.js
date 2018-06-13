/* global sinon */

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('behavior - LabelBehavior', function() {

  var diagramXML =
    require('../../../../fixtures/bpmn/features/modeling/behavior/label-behavior.bpmn');

  var testModules = [ modelingModule, coreModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('updating name property', function() {

    it('should update label', inject(function(elementRegistry, eventBus, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_1'),
          spy = sinon.spy();

      eventBus.once('commandStack.element.updateLabel.execute', spy);

      // when
      modeling.updateProperties(startEvent, {
        name: 'bar'
      });

      // then
      expect(startEvent.businessObject.name).to.equal('bar');
      expect(spy).to.have.been.called;
    }));


    it('should create label', inject(function(elementRegistry, eventBus, modeling) {

      // given
      var startEvent = elementRegistry.get('ExclusiveGateway_1'),
          spy = sinon.spy();

      eventBus.once('commandStack.element.updateLabel.execute', spy);

      // when
      modeling.updateProperties(startEvent, {
        name: 'foo'
      });

      // then
      var labelShape = startEvent.label;

      expect(labelShape).to.exist;
      expect(startEvent.businessObject.name).to.equal('foo');
      expect(spy).to.have.been.called;
    }));

  });


  describe('add label', function() {

    it('should add to sequence flow with name', inject(
      function(bpmnFactory, elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            task = elementRegistry.get('Task_1'),
            businessObject = bpmnFactory.create('bpmn:SequenceFlow', {
              name: 'foo'
            });

        // when
        var connection = modeling.createConnection(startEvent, task, {
          type: 'bpmn:SequenceFlow',
          businessObject: businessObject
        }, startEvent.parent);

        // then
        expect(connection.label).to.exist;
      }
    ));


    it('should NOT add to sequence flow without name', inject(
      function(elementRegistry, modeling) {

        // given
        var startEvent = elementRegistry.get('StartEvent_1'),
            task = elementRegistry.get('Task_1');

        // when
        var connection = modeling.connect(startEvent, task);

        // then
        expect(connection.label).not.to.exist;
      }
    ));


    it('should add to exclusive gateway with name', inject(
      function(bpmnFactory, elementFactory, elementRegistry, modeling) {

        // given
        var parentShape = elementRegistry.get('Process_1'),
            businessObject = bpmnFactory.create('bpmn:ExclusiveGateway', {
              name: 'foo'
            }),
            newShapeAttrs = {
              type: 'bpmn:ExclusiveGateway',
              businessObject: businessObject
            };

        // when
        var newShape = modeling.createShape(newShapeAttrs, { x: 50, y: 50 }, parentShape);

        // then
        expect(newShape.label).to.exist;
      }
    ));


    it('should NOT add to exclusive gateway without name', inject(
      function(elementFactory, elementRegistry, modeling) {

        // given
        var parentShape = elementRegistry.get('Process_1'),
            newShapeAttrs = {
              type: 'bpmn:ExclusiveGateway'
            };

        // when
        var newShape = modeling.createShape(newShapeAttrs, { x: 50, y: 50 }, parentShape);

        // then
        expect(newShape.label).not.to.exist;
      }
    ));


    it('should not add to task', inject(
      function(elementFactory, elementRegistry, modeling) {

        // given
        var parentShape = elementRegistry.get('Process_1'),
            newShapeAttrs = { type: 'bpmn:Task' };

        // when
        var newShape = modeling.createShape(newShapeAttrs, { x: 50, y: 50 }, parentShape);

        // then
        expect(newShape.label).not.to.exist;
      }
    ));


    describe('on append', function() {

      it('correctly wired and positioned', inject(
        function(bpmnFactory, elementRegistry, modeling, commandStack) {

          // given
          var startEventShape = elementRegistry.get('StartEvent_1'),
              businessObject = bpmnFactory.create('bpmn:EndEvent', {
                name: 'foo'
              });

          // when
          var targetShape = modeling.appendShape(startEventShape, {
            type: 'bpmn:EndEvent',
            businessObject: businessObject
          });

          var label = targetShape.label;

          // then
          expect(label).to.exist;
          expect(elementRegistry.get(label.id)).to.exist;

          expect(label.x).to.within(298, 299);
          expect(label.y).to.be.within(140, 141);
          expect(label.width).to.be.within(15, 18);
          expect(label.height).to.be.within(13, 15);
        }
      ));


      it('with di', inject(
        function(bpmnFactory, elementRegistry, modeling, commandStack) {

          // given
          var startEventShape = elementRegistry.get('StartEvent_1'),
              businessObject = bpmnFactory.create('bpmn:EndEvent', {
                name: 'foo'
              });

          // when
          var targetShape = modeling.appendShape(startEventShape, {
                type: 'bpmn:EndEvent',
                businessObject: businessObject
              }),
              target = targetShape.businessObject;

          // then
          expect(target.di.label).to.exist;

          expect(target.di.label).to.have.bounds(targetShape.label);
        }
      ));

    });


    it('should add with di', inject(
      function(bpmnFactory, elementFactory, elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1'),
            businessObject = bpmnFactory.create('bpmn:SequenceFlow', {
              name: 'foo'
            });

        // when
        var targetShape = modeling.appendShape(startEventShape, {
              type: 'bpmn:EndEvent',
              businessObject: businessObject
            }),
            target = targetShape.businessObject;

        // then
        expect(target.di.label).to.exist;

        expect(target.di.label).to.have.bounds(targetShape.label);
      }
    ));

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
      expect(labelShape.x).to.be.within(193, 194);
      expect(labelShape.y).to.equal(128);
      expect(startEvent.di.label.bounds.x).to.be.within(193, 194);
      expect(startEvent.di.label.bounds.y).to.equal(128);
    }));


    describe('connection labels', function() {

      it('should NOT center position visible', inject(
        function(bpmnFactory, elementRegistry, modeling) {

          // given
          var startEventShape = elementRegistry.get('StartEvent_1'),
              taskShape = elementRegistry.get('Task_1'),
              businessObject = bpmnFactory.create('bpmn:SequenceFlow', {
                name: 'foo'
              });

          var sequenceFlowConnection = modeling.createConnection(startEventShape, taskShape, {
            type: 'bpmn:SequenceFlow',
            businessObject: businessObject
          }, startEventShape.parent);

          var oldLabelPosition = {
            x: sequenceFlowConnection.label.x,
            y: sequenceFlowConnection.label.y
          };

          // when
          sequenceFlowConnection.label.hidden = false;

          modeling.updateWaypoints(sequenceFlowConnection, [
            sequenceFlowConnection.waypoints[0],
            {
              x: sequenceFlowConnection.waypoints[0].x,
              y: 200
            },
            {
              x: sequenceFlowConnection.waypoints[1].x,
              y: 200
            },
            sequenceFlowConnection.waypoints[1]
          ]);

          // then
          expect({
            x: sequenceFlowConnection.label.x,
            y: sequenceFlowConnection.label.y
          }).to.eql(oldLabelPosition);
        }
      ));

    });

  });


  describe('delete label', function() {

    it('should remove name', inject(function(elementRegistry, modeling) {

      // given
      var startEventShape = elementRegistry.get('StartEvent_1'),
          startEvent = startEventShape.businessObject,
          labelShape = startEventShape.label;

      // when
      modeling.removeShape(labelShape);

      // then
      expect(startEventShape.label).not.to.exist;
      expect(startEvent.name).not.to.exist;
    }));

  });


  describe('update properties', function() {

    it('should resize after updating name property', inject(
      function(elementRegistry, modeling) {

        // given
        var spy = sinon.spy(modeling, 'resizeShape');

        var startEventShape = elementRegistry.get('StartEvent_1');

        // when
        modeling.updateProperties(startEventShape, { name: 'bar' });

        // then
        expect(spy).to.have.been.called;
      }
    ));


    it('should resize after updating text property', inject(
      function(elementRegistry, modeling) {

        // given
        var spy = sinon.spy(modeling, 'resizeShape');

        var textAnnotationShape = elementRegistry.get('TextAnnotation_1');

        // when
        modeling.updateProperties(textAnnotationShape, { text: 'bar' });

        // then
        expect(spy).to.have.been.called;
      }
    ));

  });

});
