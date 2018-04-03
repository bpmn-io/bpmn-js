import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - create connection', function() {

  var diagramXML = require('../../../fixtures/bpmn/sequence-flows.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should connect', inject(function(elementRegistry, modeling, bpmnFactory) {

    // given
    var taskShape = elementRegistry.get('Task_1'),
        task = taskShape.businessObject,
        gatewayShape = elementRegistry.get('Gateway_1'),
        gateway = gatewayShape.businessObject;

    // when
    var sequenceFlowConnection = modeling.createConnection(taskShape, gatewayShape, {
      type: 'bpmn:SequenceFlow'
    }, taskShape.parent);

    var sequenceFlow = sequenceFlowConnection.businessObject;

    // then
    expect(sequenceFlowConnection).to.exist;
    expect(sequenceFlow).to.exist;

    expect(sequenceFlow.sourceRef).to.eql(task);
    expect(sequenceFlow.targetRef).to.eql(gateway);

    expect(task.outgoing).to.include(sequenceFlow);
    expect(gateway.incoming).to.include(sequenceFlow);

    expect(sequenceFlow.di.$parent).to.eql(task.di.$parent);
    expect(sequenceFlow.di.$parent.planeElement).to.include(sequenceFlow.di);

    // expect cropped connection
    expect(sequenceFlowConnection.waypoints).eql([
      { original: { x: 242, y: 376 }, x: 292, y: 376 },
      { x: 410, y: 376 },
      { x: 410, y: 341 },
      { original: { x: 553, y: 341 }, x: 528, y: 341 }
    ]);

    var diWaypoints = bpmnFactory.createDiWaypoints([
      { x: 292, y: 376 },
      { x: 410, y: 376 },
      { x: 410, y: 341 },
      { x: 528, y: 341 }
    ]);

    // expect cropped waypoints in di
    expect(sequenceFlow.di.waypoint).eql(diWaypoints);
  }));


  it('should connect with custom start / end', inject(function(elementRegistry, modeling) {

    // given
    var sourceShape = elementRegistry.get('Task_2'),
        sourcePosition = {
          x: 740,
          y: 400
        },
        targetShape = elementRegistry.get('Task_3'),
        targetPosition = {
          x: 420,
          y: 130
        };

    // when
    var newConnection = modeling.connect(
      sourceShape, targetShape,
      null,
      {
        connectionStart: sourcePosition,
        connectionEnd: targetPosition
      }
    );

    // then
    // expect cropped connection with custom start/end
    expect(newConnection).to.have.waypoints([
      { x: 734, y: 400 },
      { x: 590, y: 400 },
      { x: 590, y: 130 },
      { x: 447, y: 130 }
    ]);
  }));


  it('should undo', inject(function(elementRegistry, commandStack, modeling) {

    // given
    var taskShape = elementRegistry.get('Task_1'),
        task = taskShape.businessObject,
        gatewayShape = elementRegistry.get('Gateway_1'),
        gateway = gatewayShape.businessObject;


    var sequenceFlowConnection = modeling.createConnection(taskShape, gatewayShape, {
      type: 'bpmn:SequenceFlow'
    }, taskShape.parent);

    var sequenceFlow = sequenceFlowConnection.businessObject;

    // when
    commandStack.undo();

    // then
    expect(sequenceFlow.$parent).to.be.null;
    expect(sequenceFlow.sourceRef).to.be.null;
    expect(sequenceFlow.targetRef).to.be.null;

    expect(task.outgoing).not.to.include(sequenceFlow);
    expect(gateway.incoming).not.to.include(sequenceFlow);
  }));


  it('should redo', inject(function(elementRegistry, commandStack, modeling) {

    // given
    var taskShape = elementRegistry.get('Task_1'),
        task = taskShape.businessObject,
        gatewayShape = elementRegistry.get('Gateway_1'),
        gateway = gatewayShape.businessObject;


    var sequenceFlowConnection = modeling.createConnection(taskShape, gatewayShape, {
      type: 'bpmn:SequenceFlow'
    }, taskShape.parent);

    var sequenceFlow = sequenceFlowConnection.businessObject;

    var newWaypoints = sequenceFlowConnection.waypoints,
        newDiWaypoints = sequenceFlow.di.waypoint;

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(sequenceFlow.sourceRef).to.eql(task);
    expect(sequenceFlow.targetRef).to.eql(gateway);

    expect(task.outgoing).to.include(sequenceFlow);
    expect(gateway.incoming).to.include(sequenceFlow);

    expect(sequenceFlow.di.$parent).to.eql(task.di.$parent);
    expect(sequenceFlow.di.$parent.planeElement).to.include(sequenceFlow.di);

    // expect cropped connection
    expect(sequenceFlowConnection.waypoints).eql(newWaypoints);

    // expect cropped waypoints in di
    expect(sequenceFlow.di.waypoint).eql(newDiWaypoints);
  }));

});
