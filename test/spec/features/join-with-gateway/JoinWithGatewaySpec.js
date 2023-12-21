import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  is
} from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import joinWithGatewayModule from 'lib/features/join-with-gateway';

import diagramXML from './JoinWithGateway.bpmn';


const testModules = [ coreModule, modelingModule, joinWithGatewayModule ];

describe('features/join-with-gateway', function() {


  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should execute', inject(function(joinWithGateway) {

    // given
    const shapes = [
      element('Task_1'),
      element('Task_2'),
      element('Task_3')
    ];

    // when
    joinWithGateway.join(shapes);

    // then
    const gateway = element('Task_1').outgoing[0].target;

    expect(gateway).to.exist;
    expect(is(gateway, 'bpmn:ExclusiveGateway')).to.be.true;

    shapes.forEach(shape => {
      expect(shape.outgoing[0].target).to.eql(gateway);
    });

    expect(gateway.x).to.eql(525);
    expect(gateway.y).to.eql(92);
  }));


  it('should undo', inject(function(commandStack, joinWithGateway) {

    // given
    const shapes = [
      element('Task_1'),
      element('Task_2'),
      element('Task_3')
    ];

    // when
    joinWithGateway.join(shapes);
    commandStack.undo();

    // then
    shapes.forEach(shape => {
      expect(shape.outgoing).to.be.empty;
    });
  }));


  it('should redo', inject(function(commandStack, joinWithGateway) {

    // given
    const shapes = [
      element('Task_1'),
      element('Task_2'),
      element('Task_3')
    ];

    // when
    joinWithGateway.join(shapes);
    commandStack.undo();
    commandStack.redo();

    // then
    const gateway = element('Task_1').outgoing[0].target;

    expect(gateway).to.exist;
    expect(is(gateway, 'bpmn:ExclusiveGateway')).to.be.true;

    shapes.forEach(shape => {
      expect(shape.outgoing[0].target).to.eql(gateway);
    });

    expect(gateway.x).to.eql(525);
    expect(gateway.y).to.eql(92);
  }));
});

function element(id) {
  return inject(function(elementRegistry) {
    return elementRegistry.get(id);
  })();
}
