import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';

import {
  getDataInput
} from 'lib/features/modeling/behavior/DataInputAssociationBehavior';

import {
  getDataOutput
} from 'lib/features/modeling/behavior/DataOutputAssociationBehavior';


describe('modeling/behavior - DataInputAssociationBehavior and DataOutputAssociationBehavior integration', function() {

  var diagramXML = require('./DataAssociationBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: modelingModule }));


  it('should add bpmn:DataInput and bpmn:DataOutput on connect -> connect', inject(function(elementRegistry, modeling) {

    // given
    var dataObject1 = elementRegistry.get('DataObjectReference_1'),
        dataObject2 = elementRegistry.get('DataObjectReference_2'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    var dataInputAssociation = modeling.connect(dataObject1, task, {
      type: 'bpmn:DataInputAssociation'
    });

    // when
    var dataOutputAssociation = modeling.connect(task, dataObject2, {
      type: 'bpmn:DataOutputAssociation'
    });

    // then
    var dataInputAssociationBo = dataInputAssociation.businessObject,
        dataOutputAssociationBo = dataOutputAssociation.businessObject;

    expect(taskBo.ioSpecification).to.exist;

    expect(taskBo.ioSpecification.dataInputs).to.have.length(1);
    expect(taskBo.ioSpecification.inputSets).to.have.length(1);
    expect(taskBo.ioSpecification.inputSets[0].dataInputRefs).to.have.length(1);

    expect(taskBo.ioSpecification.dataOutputs).to.have.length(1);
    expect(taskBo.ioSpecification.outputSets).to.have.length(1);
    expect(taskBo.ioSpecification.outputSets[0].dataOutputRefs).to.have.length(1);

    expect(dataInputAssociationBo.targetRef).to.exist;
    expect(dataInputAssociationBo.targetRef).to.eql(getDataInput(taskBo, dataInputAssociationBo.targetRef));

    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.exist;
    expect(dataOutputAssociationBo.get('sourceRef')[0]).to.eql(getDataOutput(taskBo, dataOutputAssociationBo.get('sourceRef')[0]));
  }));


  it('should remove bpmn:DataOutput on connect -> undo', inject(function(commandStack, elementRegistry, modeling) {

    // given
    var dataObject1 = elementRegistry.get('DataObjectReference_1'),
        dataObject2 = elementRegistry.get('DataObjectReference_2'),
        task = elementRegistry.get('Task_1'),
        taskBo = task.businessObject;

    var dataInputAssociation = modeling.connect(dataObject1, task, {
      type: 'bpmn:DataInputAssociation'
    });

    modeling.connect(task, dataObject2, {
      type: 'bpmn:DataOutputAssociation'
    });

    // when
    commandStack.undo();

    // then
    var dataInputAssociationBo = dataInputAssociation.businessObject;

    expect(taskBo.ioSpecification).to.exist;

    expect(taskBo.ioSpecification.dataInputs).to.have.length(1);
    expect(taskBo.ioSpecification.dataOutputs).to.not.exist;

    expect(taskBo.ioSpecification.inputSets).to.exist;
    expect(taskBo.ioSpecification.inputSets).to.have.length(1);
    expect(taskBo.ioSpecification.inputSets[0].dataInputRefs).to.have.length(1);

    expect(taskBo.ioSpecification.outputSets).to.exist;
    expect(taskBo.ioSpecification.outputSets).to.have.length(1);
    expect(taskBo.ioSpecification.outputSets[0].dataOutputRefs).to.have.length(0);

    expect(dataInputAssociationBo.targetRef).to.exist;
    expect(dataInputAssociationBo.targetRef).to.eql(getDataInput(taskBo, dataInputAssociationBo.targetRef));
  }));


  it('should remove bpmn:DataInput and bpmn:DataOutput on connect -> connect -> undo -> undo', inject(
    function(commandStack, elementRegistry, modeling) {

      // given
      var dataObject1 = elementRegistry.get('DataObjectReference_1'),
          dataObject2 = elementRegistry.get('DataObjectReference_2'),
          task = elementRegistry.get('Task_1'),
          taskBo = task.businessObject;

      modeling.connect(dataObject1, task, {
        type: 'bpmn:DataInputAssociation'
      });

      modeling.connect(task, dataObject2, {
        type: 'bpmn:DataOutputAssociation'
      });

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(taskBo.ioSpecification).not.to.exist;
    }
  ));

});