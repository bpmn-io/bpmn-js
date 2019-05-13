import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';

import {
  getDataInput
} from 'lib/features/modeling/behavior/DataInputAssociationBehavior';


describe('modeling/behavior - DataInputAssociationBehavior', function() {

  var diagramXML = require('./DataAssociationBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: modelingModule }));


  it('should add bpmn:DataInput on connect', inject(function(elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;


    // when
    var dataInputAssociation = modeling.connect(dataObject, task, {
      type: 'bpmn:DataInputAssociation'
    });

    // then
    var dataInputAssociationBo = dataInputAssociation.businessObject;

    expect(taskBo.ioSpecification).to.exist;
    expect(taskBo.ioSpecification.inputSets).to.exist;
    expect(taskBo.ioSpecification.inputSets).to.have.length(1);
    expect(taskBo.ioSpecification.outputSets).to.exist;
    expect(taskBo.ioSpecification.outputSets).to.have.length(1);

    expect(dataInputAssociationBo.targetRef).to.exist;
    expect(dataInputAssociationBo.targetRef).to.eql(getDataInput(taskBo, dataInputAssociationBo.targetRef));
  }));


  it('should remove bpmn:DataInput on connect -> undo', inject(function(commandStack, elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    modeling.connect(dataObject, task, {
      type: 'bpmn:DataInputAssociation'
    });

    // when
    commandStack.undo();

    // then
    expect(taskBo.ioSpecification).not.to.exist;
  }));


  it('should update bpmn:DataInput on reconnectEnd', inject(function(elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task1 = elementRegistry.get('Task_1'),
        task1Bo = task1.businessObject,
        task2 = elementRegistry.get('Task_2'),
        task2Bo = task2.businessObject;

    var dataInputAssociation = modeling.connect(dataObject, task1, {
      type: 'bpmn:DataInputAssociation'
    });

    // when
    modeling.reconnectEnd(dataInputAssociation, task2, { x: task2.x, y: task2.y });

    // then
    var dataInputAssociationBo = dataInputAssociation.businessObject;

    expect(getDataInput(task1Bo, dataInputAssociationBo.targetRef)).not.to.exist;

    expect(getDataInput(task2Bo, dataInputAssociationBo.targetRef)).to.exist;
    expect(dataInputAssociationBo.targetRef).to.eql(getDataInput(task2Bo, dataInputAssociationBo.targetRef));
  }));


  it('should update bpmn:DataInput on reconnectEnd -> undo', inject(function(commandStack, elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task1 = elementRegistry.get('Task_1'),
        task1Bo = task1.businessObject,
        task2 = elementRegistry.get('Task_2'),
        task2Bo = task2.businessObject;

    var dataInputAssociation = modeling.connect(dataObject, task1, {
      type: 'bpmn:DataInputAssociation'
    });

    modeling.reconnectEnd(dataInputAssociation, task2, { x: task2.x, y: task2.y });

    // when
    commandStack.undo();

    // then
    var dataInputAssociationBo = dataInputAssociation.businessObject;

    expect(getDataInput(task1Bo, dataInputAssociationBo.targetRef)).to.exist;
    expect(dataInputAssociationBo.targetRef).to.eql(getDataInput(task1Bo, dataInputAssociationBo.targetRef));

    expect(getDataInput(task2Bo, dataInputAssociationBo.targetRef)).not.to.exist;
  }));


  it('should remove bpmn:DataInput on remove', inject(function(elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    var dataInputAssociation = modeling.connect(dataObject, task, {
      type: 'bpmn:DataInputAssociation'
    });

    // when
    modeling.removeElements([ dataInputAssociation ]);

    // then
    expect(taskBo.ioSpecification).not.to.exist;
  }));


  it('should add bpmn:DataInput on remove -> undo', inject(function(commandStack, elementRegistry, modeling) {

    // given
    var dataObject = elementRegistry.get('DataObjectReference_1'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    var dataInputAssociation = modeling.connect(dataObject, task, {
      type: 'bpmn:DataInputAssociation'
    });

    modeling.removeElements([ dataInputAssociation ]);

    // when
    commandStack.undo();

    // then
    var dataInputAssociationBo = dataInputAssociation.businessObject;

    expect(taskBo.ioSpecification).to.exist;
    expect(dataInputAssociationBo.targetRef).to.exist;
    expect(dataInputAssociationBo.targetRef).to.eql(getDataInput(taskBo, dataInputAssociationBo.targetRef));
  }));


  describe('multiple bpmn:DataInput elements', function() {

    it('should add second bpmn:DataInput on connect', inject(function(elementRegistry, modeling) {

      // given
      var dataObject1 = elementRegistry.get('DataObjectReference_1'),
          dataObject2 = elementRegistry.get('DataObjectReference_2'),
          task = elementRegistry.get('Task_1'),
          taskBo = task.businessObject;

      var dataInputAssociation1 = modeling.connect(dataObject1, task, {
        type: 'bpmn:DataInputAssociation'
      });

      // when
      var dataInputAssociation2 = modeling.connect(dataObject2, task, {
        type: 'bpmn:DataInputAssociation'
      });

      // then
      var dataInputAssociation1Bo = dataInputAssociation1.businessObject,
          dataInputAssociation2Bo = dataInputAssociation2.businessObject;

      expect(taskBo.ioSpecification).to.exist;
      expect(taskBo.ioSpecification.dataInputs).to.have.length(2);
      expect(taskBo.ioSpecification.inputSets).to.have.length(1);
      expect(taskBo.ioSpecification.inputSets[0].dataInputRefs).to.have.length(2);

      expect(dataInputAssociation1Bo.targetRef).to.exist;
      expect(dataInputAssociation1Bo.targetRef).to.eql(getDataInput(taskBo, dataInputAssociation1Bo.targetRef));

      expect(dataInputAssociation2Bo.targetRef).to.exist;
      expect(dataInputAssociation2Bo.targetRef).to.eql(getDataInput(taskBo, dataInputAssociation2Bo.targetRef));
    }));


    it('should remove second bpmn:DataInput on connect -> undo', inject(function(commandStack, elementRegistry, modeling) {

      // given
      var dataObject1 = elementRegistry.get('DataObjectReference_1'),
          dataObject2 = elementRegistry.get('DataObjectReference_2'),
          task = elementRegistry.get('Task_1'),
          taskBo = task.businessObject;

      var dataInputAssociation1 = modeling.connect(dataObject1, task, {
        type: 'bpmn:DataInputAssociation'
      });

      modeling.connect(dataObject2, task, {
        type: 'bpmn:DataInputAssociation'
      });

      // when
      commandStack.undo();

      // then
      var dataInputAssociation1Bo = dataInputAssociation1.businessObject;

      expect(taskBo.ioSpecification).to.exist;
      expect(taskBo.ioSpecification.dataInputs).to.have.length(1);
      expect(taskBo.ioSpecification.inputSets).to.have.length(1);
      expect(taskBo.ioSpecification.inputSets[0].dataInputRefs).to.have.length(1);

      expect(dataInputAssociation1Bo.targetRef).to.exist;
      expect(dataInputAssociation1Bo.targetRef).to.eql(getDataInput(taskBo, dataInputAssociation1Bo.targetRef));
    }));


    it('should remove all bpmn:DataInput elements on connect -> connect -> undo -> undo', inject(function(commandStack, elementRegistry, modeling) {

      // given
      var dataObject1 = elementRegistry.get('DataObjectReference_1'),
          dataObject2 = elementRegistry.get('DataObjectReference_2'),
          task = elementRegistry.get('Task_1'),
          taskBo = task.businessObject;

      modeling.connect(dataObject1, task, {
        type: 'bpmn:DataInputAssociation'
      });

      modeling.connect(dataObject2, task, {
        type: 'bpmn:DataInputAssociation'
      });

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(taskBo.ioSpecification).not.to.exist;
    }));

  });

});