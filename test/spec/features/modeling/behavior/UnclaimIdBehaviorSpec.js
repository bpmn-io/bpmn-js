import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';


describe('features/modeling - unclaim id', function() {

  var testModules = [ coreModule, modelingModule ];

  var diagramXML = require('./UnclaimIdBehaviorSpec.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should unclaim ID of shape', inject(function(elementRegistry, moddle, modeling) {

    // given
    var startEvent = elementRegistry.get('StartEvent_1');

    // when
    modeling.removeElements([ startEvent ]);

    // then
    expect(moddle.ids.assigned('StartEvent_1')).to.be.false;
  }));


  it('should unclaim ID of process', inject(function(elementRegistry, moddle, modeling) {

    // given
    var participant = elementRegistry.get('Participant_1');

    // when
    modeling.removeElements([ participant ]);

    // then
    expect(moddle.ids.assigned('Process_1')).to.be.false;
  }));


  it('should unclaim ID of connection', inject(function(elementRegistry, moddle, modeling) {

    // given
    var sequenceFlow = elementRegistry.get('SequenceFlow_1');

    // when
    modeling.removeElements([ sequenceFlow ]);

    // then
    expect(moddle.ids.assigned('SequenceFlow_1')).to.be.false;
  }));


  it('should unclaim ID of children', inject(function(elementRegistry, moddle, modeling) {

    // given
    var participant = elementRegistry.get('Participant_1');

    // when
    modeling.removeElements([ participant ]);

    // then
    expect(moddle.ids.assigned('StartEvent_1')).to.be.false;
    expect(moddle.ids.assigned('SequenceFlow_1')).to.be.false;
    expect(moddle.ids.assigned('EndEvent_1')).to.be.false;
  }));


  it('should unclaim ID of root', inject(function(elementRegistry, moddle, modeling) {

    // given
    var participant = elementRegistry.get('Participant_1');

    // when
    modeling.removeElements([ participant ]);

    // then
    expect(moddle.ids.assigned('Collaboration_1')).to.be.false;
  }));


  describe('morphing', function() {
    var simpleXML = require('../../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(simpleXML, { modules: testModules }));

    it('should keep ID of root', inject(function(moddle, modeling) {

      // when
      modeling.makeCollaboration();

      // then
      expect(moddle.ids.assigned('Process_1')).to.exist;
    }));

  });

});