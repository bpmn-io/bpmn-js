'use strict';

require('../../../../TestHelper');

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

        expect(label).to.have.bounds(assign({ x: 262, y: 138, width: 90, height: 20 }));
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


    describe('connection labels', function() {

      it('should center position hidden on waypoint change', inject(function(elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1'),
            taskShape = elementRegistry.get('Task_1');

        var sequenceFlowConnection = modeling.createConnection(startEventShape, taskShape, {
          type: 'bpmn:SequenceFlow'
        }, startEventShape.parent);

        // when
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
        var expected = {
          x: LabelUtil.getExternalLabelMid(sequenceFlowConnection).x - sequenceFlowConnection.label.width / 2,
          y: LabelUtil.getExternalLabelMid(sequenceFlowConnection).y - sequenceFlowConnection.label.height / 2
        };

        expect({
          x: sequenceFlowConnection.label.x,
          y: sequenceFlowConnection.label.y
        }).to.eql(expected);
      }));


      it('should center position hidden on source move', inject(function(elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1'),
            taskShape = elementRegistry.get('Task_1');

        var sequenceFlowConnection = modeling.createConnection(startEventShape, taskShape, {
          type: 'bpmn:SequenceFlow'
        }, startEventShape.parent);

        // when
        modeling.moveElements([ startEventShape ], { x: 50, y: 0 });

        // then
        var expected = {
          x: LabelUtil.getExternalLabelMid(sequenceFlowConnection).x - sequenceFlowConnection.label.width / 2,
          y: LabelUtil.getExternalLabelMid(sequenceFlowConnection).y - sequenceFlowConnection.label.height / 2
        };

        expect({
          x: sequenceFlowConnection.label.x,
          y: sequenceFlowConnection.label.y
        }).to.eql(expected);
      }));


      it('should center position hidden on target move', inject(function(elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1'),
            taskShape = elementRegistry.get('Task_1');

        var sequenceFlowConnection = modeling.createConnection(startEventShape, taskShape, {
          type: 'bpmn:SequenceFlow'
        }, startEventShape.parent);

        // when
        modeling.moveElements([ taskShape ], { x: 50, y: 0 });

        // then
        var expected = {
          x: LabelUtil.getExternalLabelMid(sequenceFlowConnection).x - sequenceFlowConnection.label.width / 2,
          y: LabelUtil.getExternalLabelMid(sequenceFlowConnection).y - sequenceFlowConnection.label.height / 2
        };

        expect({
          x: sequenceFlowConnection.label.x,
          y: sequenceFlowConnection.label.y
        }).to.eql(expected);
      }));


      it('should NOT center position visible', inject(function(elementRegistry, modeling) {

        // given
        var startEventShape = elementRegistry.get('StartEvent_1'),
            taskShape = elementRegistry.get('Task_1');

        var sequenceFlowConnection = modeling.createConnection(startEventShape, taskShape, {
          type: 'bpmn:SequenceFlow'
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
      }));

    });

  });


});
