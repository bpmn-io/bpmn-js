import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  find
} from 'min-dash';

import {
  is,
  getBusinessObject
} from 'lib/util/ModelUtil';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - create message flow behavior ', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('when connecting message flow to intermediate none event', function() {

    var processDiagramXML = require('../../../../fixtures/bpmn/collaboration-message-flows.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

    it('replaces none event with intermediate message event', inject(function(modeling, elementRegistry, elementFactory) {

      // given
      var task = elementRegistry.get('Task_1'),
          participant = elementRegistry.get('Participant_1'),
          eventShape = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

      // when
      modeling.createShape(eventShape, { x: 373, y: 448 }, participant);
      var connection = modeling.connect(task, eventShape, {
        type: 'bpmn:MessageFlow'
      });

      // then
      var eventDefinitions = getBusinessObject(elementRegistry.get(eventShape.id)).eventDefinitions || [];

      expect(connection).to.exist;

      expect(find(eventDefinitions, function(definition) {
        return is(definition, 'bpmn:MessageEventDefinition');
      })).to.exist;

    }));

  });
});