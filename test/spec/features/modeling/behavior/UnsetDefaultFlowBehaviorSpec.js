import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - delete default connection', function() {

  var testModules = [ coreModule, modelingModule ];

  var processDiagramXML = require('./UnsetDefaultFlowBehaviorSpec.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

  var gateway,
      defaultConnection,
      normalConnection;

  beforeEach(inject(function(elementRegistry) {
    gateway = elementRegistry.get('exclusive-gateway');
    defaultConnection = elementRegistry.get('flow-default');
    normalConnection = elementRegistry.get('flow-normal');
  }));


  it('should remove default connection', inject(function(modeling) {

    // when
    modeling.removeConnection(defaultConnection);

    // then
    expect(defaultConnection.parent).to.be.null;
    expect(gateway.businessObject.default).to.be.null; // .property('default');
  }));


  it('should revert default connection', inject(function(modeling, commandStack) {

    // given
    modeling.removeConnection(defaultConnection);

    // when
    commandStack.undo();

    // then
    expect(defaultConnection.parent).to.be.not.null;
    expect(gateway.businessObject.default).to.eql(defaultConnection.businessObject);
  }));


  it('should NOT remove default connection on removing other connections', inject(function(modeling) {

    // when
    modeling.removeConnection(normalConnection);

    // then
    expect(normalConnection.parent).to.be.null;

    expect(defaultConnection.parent).to.be.not.null;
    expect(gateway.businessObject.default).to.eql(defaultConnection.businessObject);
  }));


  it('should NOT remove default connection on restoring other connections', inject(function(modeling, commandStack) {

    // given
    modeling.removeConnection(normalConnection);

    // when
    commandStack.undo();

    // then
    expect(normalConnection.parent).to.be.not.null;

    expect(defaultConnection.parent).to.be.not.null;
    expect(gateway.businessObject.default).to.eql(defaultConnection.businessObject);
  }));

});
