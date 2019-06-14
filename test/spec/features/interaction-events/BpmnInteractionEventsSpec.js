import {
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBpmnJS,
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import interactionEventsModule from 'lib/features/interaction-events';

import createModule from 'diagram-js/lib/features/create';
import moveModule from 'diagram-js/lib/features/move';

var testModules = [
  coreModule,
  modelingModule,
  interactionEventsModule,
  createModule,
  moveModule
];

var HIT_ALL_CLS = 'djs-hit-all';
var HIT_CLICK_STROKE_CLS = 'djs-hit-click-stroke';


describe('features/interaction-events', function() {

  describe('participant hits', function() {

    var diagramXML = require('test/fixtures/bpmn/collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should create two hit zones per participant', inject(function(elementRegistry) {

      // given
      var participant = elementRegistry.get('Participant_1');

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, participant);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, participant);
    }));


    it('should create two hit zones per lane', inject(function(elementRegistry) {

      // given
      var lane = elementRegistry.get('Lane_1');

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, lane);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, lane);
    }));


    it('should create one hit zone per collapsed participant',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var participant = elementRegistry.get('Participant_1');

        // when
        var collapsedParticipant = bpmnReplace.replaceElement(participant, {
          type: 'bpmn:Participant',
          isExpanded: false
        });


        // then
        expectToHaveChildren(HIT_ALL_CLS, 1, collapsedParticipant);
      })
    );

  });


  describe('sub process hits', function() {

    var diagramXML = require('test/fixtures/bpmn/containers.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should create two hit zones per sub process', inject(function(elementRegistry) {

      // given
      var subProcess = elementRegistry.get('SubProcess_1');

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, subProcess);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, subProcess);
    }));


    it('should create one hit zone per collapsed sub process',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var subProcess = elementRegistry.get('SubProcess_1');

        // when
        var collapsedSubProcess = bpmnReplace.replaceElement(subProcess, {
          type: 'bpmn:SubProcess',
          isExpanded: false
        });

        // then
        expectToHaveChildren(HIT_ALL_CLS, 1, collapsedSubProcess);
        expectToHaveChildren(HIT_CLICK_STROKE_CLS, 0, collapsedSubProcess);
      })
    );
  });

});



// helper ///////////

function expectToHaveChildren(className, expectedCount, element) {

  var selector = '.' + className;

  var elementRegistry = getBpmnJS().get('elementRegistry'),
      gfx = elementRegistry.getGraphics(element),
      realCount = domQueryAll(selector, gfx).length;

  expect(
    realCount,
    'expected ' + element.id + ' to have ' + expectedCount +
    ' children mat ' + selector + ' but got ' + realCount
  ).to.eql(expectedCount);
}
