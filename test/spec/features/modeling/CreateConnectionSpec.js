'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    drawModule = require('../../../../lib/draw');


describe('features/modeling - create connection', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/sequence-flows.bpmn', 'utf-8');

  var testModules = [ drawModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('connection handling', function() {

    it('should execute', inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.getById('Task_1'),
          task = taskShape.businessObject,
          gatewayShape = elementRegistry.getById('Gateway_1'),
          gateway = gatewayShape.businessObject;


      // when
      var sequenceFlowConnection = modeling.createConnection(taskShape, gatewayShape, {
        type: 'bpmn:SequenceFlow',
      }, taskShape.parent);

      var sequenceFlow = sequenceFlowConnection.businessObject;

      // then
      expect(sequenceFlowConnection).toBeDefined();
      expect(sequenceFlow).toBeDefined();

      expect(sequenceFlow.sourceRef).toBe(task);
      expect(sequenceFlow.targetRef).toBe(gateway);

      expect(task.outgoing).toContain(sequenceFlow);
      expect(gateway.incoming).toContain(sequenceFlow);

      expect(sequenceFlow.di.$parent).toBe(task.di.$parent);
      expect(sequenceFlow.di.$parent.planeElement).toContain(sequenceFlow.di);

      // expect cropped connection
      expect(sequenceFlowConnection.waypoints).toDeepEqual([
        { original: { x: 242, y: 376 }, x: 292, y: 376},
        { x: 410, y: 376 },
        { x: 410, y: 341 },
        { original: { x: 553, y: 341 }, x: 528, y: 341}
      ]);

      // expect cropped waypoints in di
      expect(sequenceFlow.di.waypoint).toDeepEqual([
        { $type: 'dc:Point', x: 292, y: 376 },
        { $type: 'dc:Point', x: 410, y: 376 },
        { $type: 'dc:Point', x: 410, y: 341 },
        { $type: 'dc:Point', x: 528, y: 341 }
      ]);
    }));

  });


  describe('undo support', function() {

    it('should undo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.getById('Task_1'),
          task = taskShape.businessObject,
          gatewayShape = elementRegistry.getById('Gateway_1'),
          gateway = gatewayShape.businessObject;


      var sequenceFlowConnection = modeling.createConnection(taskShape, gatewayShape, {
        type: 'bpmn:SequenceFlow',
      }, taskShape.parent);

      var sequenceFlow = sequenceFlowConnection.businessObject;

      // when
      commandStack.undo();

      // then
      expect(sequenceFlow.$parent).toBe(null);
      expect(sequenceFlow.sourceRef).toBe(null);
      expect(sequenceFlow.targetRef).toBe(null);

      expect(task.outgoing).not.toContain(sequenceFlow);
      expect(gateway.incoming).not.toContain(sequenceFlow);
    }));

  });


  describe('redo support', function() {

    it('should redo', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var taskShape = elementRegistry.getById('Task_1'),
          task = taskShape.businessObject,
          gatewayShape = elementRegistry.getById('Gateway_1'),
          gateway = gatewayShape.businessObject;


      var sequenceFlowConnection = modeling.createConnection(taskShape, gatewayShape, {
        type: 'bpmn:SequenceFlow',
      }, taskShape.parent);

      var sequenceFlow = sequenceFlowConnection.businessObject;

      var newWaypoints = sequenceFlowConnection.waypoints,
          newDiWaypoints = sequenceFlow.di.waypoint;

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(sequenceFlow.sourceRef).toBe(task);
      expect(sequenceFlow.targetRef).toBe(gateway);

      expect(task.outgoing).toContain(sequenceFlow);
      expect(gateway.incoming).toContain(sequenceFlow);

      expect(sequenceFlow.di.$parent).toBe(task.di.$parent);
      expect(sequenceFlow.di.$parent.planeElement).toContain(sequenceFlow.di);

      // expect cropped connection
      expect(sequenceFlowConnection.waypoints).toDeepEqual(newWaypoints);

      // expect cropped waypoints in di
      expect(sequenceFlow.di.waypoint).toDeepEqual(newDiWaypoints);
    }));

  });

});