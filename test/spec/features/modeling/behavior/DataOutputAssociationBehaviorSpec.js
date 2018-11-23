import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';

import {
  getDataOutput
} from 'lib/features/modeling/behavior/DataOutputAssociationBehavior';


describe('modeling/behavior - DataOutputAssociationBehavior', function() {

  var diagramXML = require('./DataAssociationBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: modelingModule }));


  it('should add bpmn:DataOutput on connect', inject(function(elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;


    // when
    var dataOutputAssociation = modeling.connect(task, dataObject, {
      type: 'bpmn:DataOutputAssociation'
    });

    // then
    var dataOutputAssociationBo = dataOutputAssociation.businessObject;

    expect(taskBo.ioSpecification).to.exist;
    expect(taskBo.ioSpecification.inputSets).to.exist;
    expect(taskBo.ioSpecification.inputSets).to.have.length(1);
    expect(taskBo.ioSpecification.outputSets).to.exist;
    expect(taskBo.ioSpecification.outputSets).to.have.length(1);

    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.exist;
    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.eql(getDataOutput(taskBo, dataOutputAssociationBo.get('sourceRef')[0]));
  }));


  it('should remove bpmn:DataOutput on connect -> undo', inject(function(commandStack, elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    modeling.connect(task, dataObject, {
      type: 'bpmn:DataOutputAssociation'
    });

    // when
    commandStack.undo();

    // then
    expect(taskBo.ioSpecification).not.to.exist;
  }));


  it('should update bpmn:DataOutput on reconnectStart', inject(function(elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task1 = elementRegistry.get('Task_1'),
        task1Bo = task1.businessObject,
        task2 = elementRegistry.get('Task_2'),
        task2Bo = task2.businessObject;

    var dataOutputAssociation = modeling.connect(task1, dataObject, {
      type: 'bpmn:DataOutputAssociation'
    });

    // when
    modeling.reconnectStart(dataOutputAssociation, task2, { x: task2.x, y: task2.y });

    // then
    var dataOutputAssociationBo = dataOutputAssociation.businessObject;

    expect(getDataOutput(task1Bo, dataOutputAssociationBo.get('sourceRef')[0])).not.to.exist;

    expect(getDataOutput(task2Bo, dataOutputAssociationBo.get('sourceRef')[0])).to.exist;
    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.eql(getDataOutput(task2Bo, dataOutputAssociationBo.get('sourceRef')[0]));
  }));


  it('should update bpmn:DataOutput on reconnectEnd -> undo', inject(function(commandStack, elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task1 = elementRegistry.get('Task_1'),
        task1Bo = task1.businessObject,
        task2 = elementRegistry.get('Task_2'),
        task2Bo = task2.businessObject;

    var dataOutputAssociation = modeling.connect(task1, dataObject, {
      type: 'bpmn:DataOutputAssociation'
    });

    modeling.reconnectStart(dataOutputAssociation, task2, { x: task2.x, y: task2.y });

    // when
    commandStack.undo();

    // then
    var dataOutputAssociationBo = dataOutputAssociation.businessObject;

    expect(getDataOutput(task1Bo, dataOutputAssociationBo.get('sourceRef')[0])).to.exist;
    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.eql(getDataOutput(task1Bo, dataOutputAssociationBo.get('sourceRef')[0]));

    expect(getDataOutput(task2Bo, dataOutputAssociationBo.get('sourceRef')[0])).not.to.exist;
  }));


  it('should remove bpmn:DataOutput on remove', inject(function(elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    var dataOutputAssociation = modeling.connect(task, dataObject, {
      type: 'bpmn:DataOutputAssociation'
    });

    // when
    modeling.removeElements([ dataOutputAssociation ]);

    // then
    expect(taskBo.ioSpecification).not.to.exist;
  }));


  it('should add bpmn:DataOutput on remove -> undo', inject(function(commandStack, elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    var dataOutputAssociation = modeling.connect(task, dataObject, {
      type: 'bpmn:DataOutputAssociation'
    });

    modeling.removeElements([ dataOutputAssociation ]);

    // when
    commandStack.undo();

    // then
    var dataOutputAssociationBo = dataOutputAssociation.businessObject;

    expect(taskBo.ioSpecification).to.exist;
    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.exist;
    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.eql(getDataOutput(taskBo, dataOutputAssociationBo.get('sourceRef')[0]));
  }));


  describe('multiple bpmn:DataOutput elements', function() {

    it('should add second bpmn:DataOutput on connect', inject(function(elementRegistry, modeling) {

      // given
      var dataObject1 = elementRegistry.get('DataObjectReference_1'),
          dataObject2 = elementRegistry.get('DataObjectReference_2'),
          task = elementRegistry.get('Task_1'),
          taskBo = task.businessObject;

      var dataInputAssociation1 = modeling.connect(task, dataObject1, {
        type: 'bpmn:DataOutputAssociation'
      });

      // when
      var dataInputAssociation2 = modeling.connect(task, dataObject2, {
        type: 'bpmn:DataOutputAssociation'
      });

      // then
      var dataInputAssociation1Bo = dataInputAssociation1.businessObject,
          dataInputAssociation2Bo = dataInputAssociation2.businessObject;

      expect(taskBo.ioSpecification).to.exist;
      expect(taskBo.ioSpecification.dataOutputs).to.have.length(2);
      expect(taskBo.ioSpecification.outputSets).to.have.length(1);
      expect(taskBo.ioSpecification.outputSets[0].dataOutputRefs).to.have.length(2);

      expect(dataInputAssociation1Bo.get('sourceRef')[0]).to.exist;
      expect(dataInputAssociation1Bo.get('sourceRef')[0]).to.eql(getDataOutput(taskBo, dataInputAssociation1Bo.get('sourceRef')[0]));

      expect(dataInputAssociation2Bo.get('sourceRef')[0]).to.exist;
      expect(dataInputAssociation2Bo.get('sourceRef')[0]).to.eql(getDataOutput(taskBo, dataInputAssociation2Bo.get('sourceRef')[0]));
    }));


    it('should remove second bpmn:DataOutput on connect -> undo', inject(function(commandStack, elementRegistry, modeling) {

      // given
      var dataObject1 = elementRegistry.get('DataObjectReference_1'),
          dataObject2 = elementRegistry.get('DataObjectReference_2'),
          task = elementRegistry.get('Task_1'),
          taskBo = task.businessObject;

      var dataInputAssociation1 = modeling.connect(task, dataObject1, {
        type: 'bpmn:DataOutputAssociation'
      });

      modeling.connect(task, dataObject2, {
        type: 'bpmn:DataOutputAssociation'
      });

      // when
      commandStack.undo();

      // then
      var dataInputAssociation1Bo = dataInputAssociation1.businessObject;

      expect(taskBo.ioSpecification).to.exist;
      expect(taskBo.ioSpecification.dataOutputs).to.have.length(1);
      expect(taskBo.ioSpecification.outputSets).to.have.length(1);
      expect(taskBo.ioSpecification.outputSets[0].dataOutputRefs).to.have.length(1);

      expect(dataInputAssociation1Bo.get('sourceRef')[0]).to.exist;
      expect(dataInputAssociation1Bo.get('sourceRef')[0]).to.eql(getDataOutput(taskBo, dataInputAssociation1Bo.get('sourceRef')[0]));
    }));


    it('should remove all bpmn:DataOutput elements on connect -> connect -> undo -> undo', inject(function(commandStack, elementRegistry, modeling) {

      // given
      var dataObject1 = elementRegistry.get('DataObjectReference_1'),
          dataObject2 = elementRegistry.get('DataObjectReference_2'),
          task = elementRegistry.get('Task_1'),
          taskBo = task.businessObject;

      modeling.connect(task, dataObject1, {
        type: 'bpmn:DataOutputAssociation'
      });

      modeling.connect(task, dataObject2, {
        type: 'bpmn:DataOutputAssociation'
      });

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(taskBo.ioSpecification).not.to.exist;
    }));

  });

});