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
var HIT_NO_MOVE_CLS = 'djs-hit-no-move';


describe('features/interaction-events', function() {

  describe('participant hits', function() {

    var diagramXML = require('test/fixtures/bpmn/collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should create THREE hit zones per participant', inject(function(elementRegistry) {

      // given
      var participant = elementRegistry.get('Participant_1');
      var hitZones = getHitZones(participant);

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, participant);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, participant);
      expectToHaveChildren(HIT_NO_MOVE_CLS, 1, participant);

      expectSize(hitZones.all[0], { width: 30, height: participant.height });
      expectSize(hitZones.click[0], { width: participant.width, height: participant.height });
      expectSize(hitZones.noMove[0], { width: participant.width, height: participant.height });
    }));


    it('should create THREE hit zones per lane', inject(function(elementRegistry) {

      // given
      var lane = elementRegistry.get('Lane_1');
      var hitZones = getHitZones(lane);

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, lane);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, lane);
      expectToHaveChildren(HIT_NO_MOVE_CLS, 1, lane);

      expectSize(hitZones.all[0], { width: 30, height: lane.height });
      expectSize(hitZones.click[0], { width: lane.width, height: lane.height });
      expectSize(hitZones.noMove[0], { width: lane.width, height: lane.height });
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
        var hitZones = getHitZones(collapsedParticipant);

        // then
        expectToHaveChildren(HIT_ALL_CLS, 1, collapsedParticipant);
        expectSize(hitZones.all[0], { width: collapsedParticipant.width, height: collapsedParticipant.height });
      })
    );

  });


  describe('vertical participant hits', function() {

    var diagramXML = require('test/fixtures/bpmn/collaboration-vertical.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should create THREE hit zones per participant', inject(function(elementRegistry) {

      // given
      var participant = elementRegistry.get('V_Participant_1');
      var hitZones = getHitZones(participant);

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, participant);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, participant);
      expectToHaveChildren(HIT_NO_MOVE_CLS, 1, participant);

      expectSize(hitZones.all[0], { width: participant.width, height: 30 });
      expectSize(hitZones.click[0], { width: participant.width, height: participant.height });
      expectSize(hitZones.noMove[0], { width: participant.width, height: participant.height });
    }));


    it('should create THREE hit zones per lane', inject(function(elementRegistry) {

      // given
      var lane = elementRegistry.get('V_Lane_1');
      var hitZones = getHitZones(lane);

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, lane);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, lane);
      expectToHaveChildren(HIT_NO_MOVE_CLS, 1, lane);

      expectSize(hitZones.all[0], { width: lane.width, height: 30 });
      expectSize(hitZones.click[0], { width: lane.width, height: lane.height });
      expectSize(hitZones.noMove[0], { width: lane.width, height: lane.height });
    }));


    it('should create one hit zone per collapsed participant',
      inject(function(elementRegistry, bpmnReplace) {

        // given
        var participant = elementRegistry.get('V_Participant_1');

        // when
        var collapsedParticipant = bpmnReplace.replaceElement(participant, {
          type: 'bpmn:Participant',
          isExpanded: false
        });
        var hitZones = getHitZones(collapsedParticipant);

        // then
        expectToHaveChildren(HIT_ALL_CLS, 1, collapsedParticipant);
        expectSize(hitZones.all[0], { width: collapsedParticipant.width, height: collapsedParticipant.height });
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


    it('should create THREE hit zones per sub process', inject(function(elementRegistry) {

      // given
      var subProcess = elementRegistry.get('SubProcess_1');

      // then
      expectToHaveChildren(HIT_ALL_CLS, 1, subProcess);
      expectToHaveChildren(HIT_CLICK_STROKE_CLS, 1, subProcess);
      expectToHaveChildren(HIT_NO_MOVE_CLS, 1, subProcess);
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

function getHitZones(element) {
  var elementRegistry = getBpmnJS().get('elementRegistry'),
      gfx = elementRegistry.getGraphics(element);

  return {
    all: domQueryAll('.' + HIT_ALL_CLS, gfx),
    click: domQueryAll('.' + HIT_CLICK_STROKE_CLS, gfx),
    noMove: domQueryAll('.' + HIT_NO_MOVE_CLS, gfx)
  };
}

function expectSize(element, expectedSize) {
  var size = getSize(element);

  expect(size.width).to.eql(expectedSize.width);
  expect(size.height).to.eql(expectedSize.height);
}

function getSize(element) {
  const bbox = element.getBBox();
  return {
    width: bbox.width,
    height: bbox.height
  };
}
