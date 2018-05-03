import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/behavior - update semantic parent', function() {

  var diagramXML = require('./UpdateSemanticParent.bpmn');

  var participant1Bo, participant2Bo, dataStoreBo;

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule
    ]
  }));

  beforeEach(inject(function(commandStack, elementRegistry) {
    var participant1 = elementRegistry.get('Participant_1'),
        participant2 = elementRegistry.get('Participant_2'),
        dataStore = elementRegistry.get('DataStoreReference');

    participant1Bo = participant1.businessObject;
    participant2Bo = participant2.businessObject;
    dataStoreBo = dataStore.businessObject;

    // when
    commandStack.execute('dataStore.updateContainment', {
      dataStoreBo: dataStoreBo,
      newSemanticParent: participant2Bo.processRef,
      newDiParent: participant2Bo.di
    });
  }));


  it('should do', function() {

    // then
    expect(dataStoreBo.$parent).to.eql(participant2Bo.processRef);
    expect(dataStoreBo.di.$parent).to.eql(participant2Bo.di.$parent);
  });


  it('should undo', inject(function(commandStack) {

    // when
    commandStack.undo();

    // then
    expect(dataStoreBo.$parent).to.eql(participant1Bo.processRef);
    expect(dataStoreBo.di.$parent).to.eql(participant1Bo.di.$parent);
  }));


  it('should redo', inject(function(commandStack) {

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(dataStoreBo.$parent).to.eql(participant2Bo.processRef);
    expect(dataStoreBo.di.$parent).to.eql(participant2Bo.di.$parent);
  }));

});