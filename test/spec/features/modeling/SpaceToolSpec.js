import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import {
  pick
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

import { isMac } from 'diagram-js/lib/util/Platform';

var invertModifier = isMac() ? { metaKey: true } : { ctrlKey: true };


describe('features/modeling - create/remove space', function() {

  describe('create space', function() {

    var diagramXML = require('./SpaceTool.basic.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should create space to the right', inject(function(elementRegistry, spaceTool) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
          subProcess = elementRegistry.get('SubProcess_1'),
          endEvent = elementRegistry.get('EndEvent_1');

      var subProcessPosition_old = getPosition(subProcess),
          endEventPosition_old = getPosition(endEvent);

      // when
      makeSpace({ x: 270, y: 80 }, { dx: 50 });

      // then
      expect(subProcess).to.have.diPosition({
        x: subProcessPosition_old.x + 50,
        y: subProcessPosition_old.y
      });

      expect(endEvent).to.have.diPosition({
        x: endEventPosition_old.x + 50,
        y: endEventPosition_old.y
      });

      expect(sequenceFlow).to.have.diWaypoints([
        { x: 144, y: 230 },
        { x: 350, y: 230 }
      ]);
    }));


    it('should create space downwards', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var startEvent = elementRegistry.get('StartEvent_2'),
          sequenceFlow = elementRegistry.get('SequenceFlow_3'),
          subProcess = elementRegistry.get('SubProcess_1'),
          endEvent = elementRegistry.get('EndEvent_1');

      var startEventPosition_old = getPosition(startEvent),
          subProcessPosition_old = getPosition(subProcess),
          endEventPosition_old = getPosition(endEvent);

      // when
      makeSpace({ x: 330, y: 50 }, { dy: 50 });

      // then
      expect(startEvent).to.have.diPosition({
        x: startEventPosition_old.x,
        y: startEventPosition_old.y + 50
      });

      expect(subProcess).to.have.diPosition({
        x: subProcessPosition_old.x,
        y: subProcessPosition_old.y + 50
      });

      expect(endEvent).to.have.diPosition({
        x: endEventPosition_old.x,
        y: endEventPosition_old.y + 50
      });

      expect(sequenceFlow).to.have.diWaypoints([
        { x: 144, y: 280 },
        { x: 300, y: 280 }
      ]);
    }));


    it('should remove space to the left', inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
          subProcess = elementRegistry.get('SubProcess_1'),
          endEvent = elementRegistry.get('EndEvent_1');

      var subProcessPosition_old = getPosition(subProcess),
          endEventPosition_old = getPosition(endEvent);

      // when
      makeSpace({ x: 280, y: 100 }, { dx: -50 });

      // then
      expect(subProcess).to.have.diPosition({
        x: subProcessPosition_old.x - 50,
        y: subProcessPosition_old.y
      });

      expect(endEvent).to.have.diPosition({
        x: endEventPosition_old.x - 50,
        y: endEventPosition_old.y
      });

      expect(sequenceFlow).to.have.diWaypoints([
        { x: 144, y: 230 },
        { x: 250, y: 230 }
      ]);
    }));


    it('should resize to the right', inject(function(elementRegistry, modeling) {

      // given
      var task = elementRegistry.get('Task_1'),
          subProcess = elementRegistry.get('SubProcess_1'),
          endEvent = elementRegistry.get('EndEvent_1');

      var subProcessBounds_old = getBounds(subProcess),
          endEventPosition_old = getPosition(endEvent),
          taskPosition_old = getPosition(task);

      // when
      makeSpace({ x: 450, y: 100 }, { dx: 50 });

      // then
      expect(subProcess).to.have.diBounds({
        x: subProcessBounds_old.x,
        y: subProcessBounds_old.y,
        width: subProcessBounds_old.width + 50,
        height: subProcessBounds_old.height
      });

      expect(endEvent).to.have.diPosition({
        x: endEventPosition_old.x + 50,
        y: endEventPosition_old.y
      });

      expect(task).to.have.diPosition(taskPosition_old);
    }));


    it('should create space to the left', inject(function(elementRegistry, modeling) {

      // given
      var startEvent = elementRegistry.get('StartEvent_2'),
          sequenceFlow = elementRegistry.get('SequenceFlow_3'),
          sequenceFlowLabel = sequenceFlow.label;

      var startEventBounds_old = getBounds(startEvent),
          sequenceFlowLabelBounds_old = getPosition(sequenceFlowLabel);

      // when
      makeSpace({ x: 250, y: 100 }, { dx: -50 }, true);

      // then
      expect(startEvent).to.have.diBounds({
        x: startEventBounds_old.x - 50,
        y: startEventBounds_old.y,
        width: startEventBounds_old.width,
        height: startEventBounds_old.height
      });

      expect(sequenceFlowLabel).to.have.position({
        x: sequenceFlowLabelBounds_old.x - 50,
        y: sequenceFlowLabelBounds_old.y
      });
    }));

  });


  describe('case 1', function() {

    var diagramXML = require('./SpaceTool.case1.bpmn');

    var testModules = [ coreModule, modelingModule ];

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    it('should create space to the left', inject(function(elementRegistry, modeling) {

      // given
      var sequenceFlow = elementRegistry.get('SequenceFlow_C'),
          sequenceFlowLabel = sequenceFlow.label;

      var sequenceFlowLabelBounds_old = getPosition(sequenceFlowLabel);

      // when
      makeSpace({ x: 200, y: 100 }, { dx: 200 });

      // then

      expect(sequenceFlowLabel).to.have.position({
        x: sequenceFlowLabelBounds_old.x + 200,
        y: sequenceFlowLabelBounds_old.y
      });
    }));

  });

});



// helpers ////////////////

function makeSpace(start, delta, invert) {

  if (delta.dx && delta.dy) {
    throw new Error('must define either <dx> or <dy>');
  }

  var modifier = invert ? invertModifier : {};

  var end = {
    x: start.x + (delta.dx || 0),
    y: start.y + (delta.dy || 0)
  };

  return getBpmnJS().invoke(function(spaceTool, dragging) {
    spaceTool.activateMakeSpace(canvasEvent(start));

    dragging.move(canvasEvent(end, modifier));

    dragging.end();
  });

}

function getPosition(element) {
  return pick(element, [ 'x', 'y' ]);
}

function getBounds(element) {
  return pick(element, [ 'x', 'y', 'width', 'height' ]);
}