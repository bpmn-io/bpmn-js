import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { getDi } from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling/behavior - update semantic parent', function() {

  var diagramXML = require('./UpdateSemanticParent.bpmn');

  var participant1Bo, participant1Di, participant2Bo, participant2Di, dataStoreBo, dataStoreDi;

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
    participant1Di = getDi(participant1);
    participant2Bo = participant2.businessObject;
    participant2Di = getDi(participant2);
    dataStoreBo = dataStore.businessObject;
    dataStoreDi = getDi(dataStore);

    // when
    commandStack.execute('dataStore.updateContainment', {
      dataStoreBo: dataStoreBo,
      dataStoreDi: dataStoreDi,
      newSemanticParent: participant2Bo.processRef,
      newDiParent: participant2Di
    });
  }));


  it('should do', function() {

    // then
    expect(dataStoreBo.$parent).to.eql(participant2Bo.processRef);
    expect(dataStoreDi.$parent).to.eql(participant2Di.$parent);
  });


  it('should undo', inject(function(commandStack) {

    // when
    commandStack.undo();

    // then
    expect(dataStoreBo.$parent).to.eql(participant1Bo.processRef);
    expect(dataStoreDi.$parent).to.eql(participant1Di.$parent);
  }));


  it('should redo', inject(function(commandStack) {

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(dataStoreBo.$parent).to.eql(participant2Bo.processRef);
    expect(dataStoreDi.$parent).to.eql(participant2Di.$parent);
  }));

});