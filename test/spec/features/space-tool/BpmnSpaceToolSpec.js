import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';
import spaceToolModule from 'lib/features/space-tool';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';

import { isString, pick } from 'min-dash';

import { isMac } from 'diagram-js/lib/util/Platform';

var invertModifier = isMac() ? { metaKey: true } : { ctrlKey: true };


describe('features/space-tool - BpmnSpaceTool', function() {

  // adopt conservative retry strategy
  // in an attempt to improve the stability
  // of our test suite
  this.retries(2);


  var testModules = [
    coreModule,
    modelingModule,
    rulesModule,
    snappingModule,
    spaceToolModule
  ];


  describe('basics', function() {

    var diagramXML = require('./BpmnSpaceTool.basics.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    describe('add space', function() {

      it('should add space top', inject(function() {

        // given
        var subProcess1 = $element('SubProcess_1');

        var subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dy: -100 }, true);

        // then
        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x,
          y: subProcess1Bounds.y - 100,
          width: subProcess1Bounds.width,
          height: subProcess1Bounds.height + 100
        });
      }));


      it('should add space right', inject(function() {

        // given
        var endEvent1 = $element('EndEvent_1'),
            endEvent2 = $element('EndEvent_2'),
            endEvent1Label = endEvent1.label,
            endEvent2Label = endEvent2.label,
            sequenceFlow2 = $element('SequenceFlow_2'),
            sequenceFlow4 = $element('SequenceFlow_4'),
            subProcess1 = $element('SubProcess_1');

        var endEvent1Mid = getMid(endEvent1),
            endEvent2Mid = getMid(endEvent2),
            endEvent1LabelMid = getMid(endEvent1Label),
            endEvent2LabelMid = getMid(endEvent2Label),
            sequenceFlow2Waypoints = sequenceFlow2.waypoints.slice(),
            sequenceFlow4Waypoints = sequenceFlow4.waypoints.slice(),
            subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dx: 100 });

        // then
        expect(getMid(endEvent1)).to.eql({
          x: endEvent1Mid.x + 100,
          y: endEvent1Mid.y
        });

        expect(getMid(endEvent2)).to.eql({
          x: endEvent2Mid.x + 100,
          y: endEvent2Mid.y
        });

        expect(getMid(endEvent1Label)).to.eql({
          x: endEvent1LabelMid.x + 100,
          y: endEvent1LabelMid.y
        });

        expect(getMid(endEvent2Label).x).to.be.closeTo(650, 1); // Label position was adjusted
        expect(getMid(endEvent2Label).y).to.equal(endEvent2LabelMid.y);

        expect(sequenceFlow2.waypoints[ 0 ]).to.include({ x: sequenceFlow2Waypoints[ 0 ].x + 100, y: 240 });
        expect(sequenceFlow2.waypoints[ 1 ]).to.include({ x: sequenceFlow2Waypoints[ 1 ].x + 100, y: 240 });

        expect(sequenceFlow4.waypoints[ 0 ]).to.include({ x: sequenceFlow4Waypoints[ 0 ].x, y: 240 });
        expect(sequenceFlow4.waypoints[ 1 ]).to.include({ x: sequenceFlow4Waypoints[ 1 ].x + 100, y: 240 });

        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x,
          y: subProcess1Bounds.y,
          width: subProcess1Bounds.width + 100,
          height: subProcess1Bounds.height
        });
      }));


      it('should add space bottom', inject(function() {

        // given
        var subProcess1 = $element('SubProcess_1');

        var subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dy: 100 });

        // then
        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x,
          y: subProcess1Bounds.y,
          width: subProcess1Bounds.width,
          height: subProcess1Bounds.height + 100
        });
      }));


      it('should add space left', inject(function() {

        // given
        var startEvent1 = $element('StartEvent_1'),
            startEvent2 = $element('StartEvent_2'),
            startEvent1Label = startEvent1.label,
            startEvent2Label = startEvent2.label,
            sequenceFlow1 = $element('SequenceFlow_1'),
            sequenceFlow3 = $element('SequenceFlow_3'),
            subProcess1 = $element('SubProcess_1');

        var startEvent1Mid = getMid(startEvent1),
            startEvent2Mid = getMid(startEvent2),
            startEvent1LabelMid = getMid(startEvent1Label),
            startEvent2LabelMid = getMid(startEvent2Label),
            sequenceFlow1Waypoints = sequenceFlow1.waypoints.slice(),
            sequenceFlow3Waypoints = sequenceFlow3.waypoints.slice(),
            subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dx: -100 }, true);

        // then
        expect(getMid(startEvent1)).to.eql({
          x: startEvent1Mid.x - 100,
          y: startEvent1Mid.y
        });

        expect(getMid(startEvent2)).to.eql({
          x: startEvent2Mid.x - 100,
          y: startEvent2Mid.y
        });

        expect(getMid(startEvent1Label)).to.eql({
          x: startEvent1LabelMid.x - 100,
          y: startEvent1LabelMid.y
        });

        expect(getMid(startEvent2Label).x).to.be.closeTo(198, 1); // Label position was adjusted
        expect(getMid(startEvent2Label).y).to.equal(startEvent2LabelMid.y);

        expect(sequenceFlow1.waypoints[ 0 ]).to.include({ x: sequenceFlow1Waypoints[ 0 ].x - 100, y: 240 });
        expect(sequenceFlow1.waypoints[ 1 ]).to.include({ x: sequenceFlow1Waypoints[ 1 ].x - 100, y: 240 });

        expect(sequenceFlow3.waypoints[ 0 ]).to.include({ x: sequenceFlow3Waypoints[ 0 ].x - 100, y: 240 });
        expect(sequenceFlow3.waypoints[ 1 ]).to.include({ x: sequenceFlow3Waypoints[ 1 ].x, y: 240 });

        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x - 100,
          y: subProcess1Bounds.y,
          width: subProcess1Bounds.width + 100,
          height: subProcess1Bounds.height
        });
      }));

    });


    describe('remove', function() {

      it('should remove space top', inject(function() {

        // given
        var subProcess1 = $element('SubProcess_1');

        var subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dy: 100 }, true);

        // then
        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x,
          y: 180,
          width: subProcess1Bounds.width,
          height: 160
        });
      }));


      it('should remove space right', inject(function() {

        // given
        var endEvent1 = $element('EndEvent_1'),
            endEvent2 = $element('EndEvent_2'),
            endEvent1Label = endEvent1.label,
            endEvent2Label = endEvent2.label,
            sequenceFlow2 = $element('SequenceFlow_2'),
            sequenceFlow4 = $element('SequenceFlow_4'),
            subProcess1 = $element('SubProcess_1');

        var endEvent1Mid = getMid(endEvent1),
            endEvent2Mid = getMid(endEvent2),
            endEvent1LabelMid = getMid(endEvent1Label),
            sequenceFlow2Waypoints = sequenceFlow2.waypoints.slice(),
            subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dx: -100 });

        // then
        expect(getMid(endEvent1)).to.eql({
          x: endEvent1Mid.x - 100,
          y: endEvent1Mid.y
        });

        expect(getMid(endEvent2)).to.eql({
          x: endEvent2Mid.x - 100,
          y: endEvent2Mid.y
        });

        expect(getMid(endEvent1Label)).to.eql({
          x: endEvent1LabelMid.x - 100,
          y: endEvent1LabelMid.y
        });

        expect(getMid(endEvent2Label).x).to.be.closeTo(450, 1); // Label position was adjusted
        expect(getMid(endEvent2Label).y).to.be.closeTo(272, 1); // Label position was adjusted

        expect(sequenceFlow2.waypoints[ 0 ]).to.include({ x: sequenceFlow2Waypoints[ 0 ].x - 100, y: 240 });
        expect(sequenceFlow2.waypoints[ 1 ]).to.include({ x: sequenceFlow2Waypoints[ 1 ].x - 100, y: 240 });

        expect(sequenceFlow4.waypoints).to.have.length(4);

        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x,
          y: subProcess1Bounds.y,
          width: subProcess1Bounds.width - 100,
          height: subProcess1Bounds.height
        });
      }));


      it('should remove space bottom', inject(function() {

        // given
        var subProcess1 = $element('SubProcess_1');

        var subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dy: -100 });

        // then
        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x,
          y: subProcess1Bounds.y,
          width: subProcess1Bounds.width,
          height: 160
        });
      }));


      it('should remove space left', inject(function() {

        // given
        var startEvent1 = $element('StartEvent_1'),
            startEvent2 = $element('StartEvent_2'),
            startEvent1Label = startEvent1.label,
            startEvent2Label = startEvent2.label,
            sequenceFlow1 = $element('SequenceFlow_1'),
            sequenceFlow3 = $element('SequenceFlow_3'),
            subProcess1 = $element('SubProcess_1');

        var startEvent1Mid = getMid(startEvent1),
            startEvent2Mid = getMid(startEvent2),
            startEvent1LabelMid = getMid(startEvent1Label),
            sequenceFlow1Waypoints = sequenceFlow1.waypoints.slice(),
            subProcess1Bounds = getBounds(subProcess1);

        // when
        makeSpace({ x: 420, y: 240 }, { dx: 100 }, true);

        // then
        expect(getMid(startEvent1)).to.eql({
          x: startEvent1Mid.x + 100,
          y: startEvent1Mid.y
        });

        expect(getMid(startEvent2)).to.eql({
          x: startEvent2Mid.x + 100,
          y: startEvent2Mid.y
        });

        expect(getMid(startEvent1Label)).to.eql({
          x: startEvent1LabelMid.x + 100,
          y: startEvent1LabelMid.y
        });

        expect(getMid(startEvent2Label).x).to.be.closeTo(398, 1); // Label position was adjusted
        expect(getMid(startEvent2Label).y).to.be.closeTo(272, 1); // Label position was adjusted

        expect(sequenceFlow1.waypoints[ 0 ]).to.include({ x: sequenceFlow1Waypoints[ 0 ].x + 100, y: 240 });
        expect(sequenceFlow1.waypoints[ 1 ]).to.include({ x: sequenceFlow1Waypoints[ 1 ].x + 100, y: 240 });

        expect(sequenceFlow3.waypoints).to.have.length(4);

        expect(subProcess1).to.have.bounds({
          x: subProcess1Bounds.x + 100,
          y: subProcess1Bounds.y,
          width: subProcess1Bounds.width - 100,
          height: subProcess1Bounds.height
        });
      }));

    });

  });


  describe('text annotations', function() {

    var diagramXML = require('./BpmnSpaceTool.text-annotations.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should not resize text annotations', inject(function(dragging, elementRegistry, spaceTool) {

      // given
      var textAnnotation = $element('TextAnnotation_1'),
          textAnnotationMid = getMid(textAnnotation),
          textAnnotationWidth = textAnnotation.width;

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: textAnnotationMid.x, y: 0 }));

      dragging.move(canvasEvent({ x: textAnnotationMid.x + 100, y: 0 }));

      dragging.end();

      // then
      expect(textAnnotation.width).to.equal(textAnnotationWidth);
    }));

  });


  describe('boundary events', function() {

    var diagramXML = require('./BpmnSpaceTool.boundary-events.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should move boundary event when moving subprocess', inject(function() {

      // given
      var boundaryEvent = $element('BoundaryEvent_2');

      var boundaryEventMid = getMid(boundaryEvent);

      // when
      makeSpace({ x: boundaryEventMid.x + 5, y: boundaryEventMid.y }, { dx: -100 }, true);

      // then
      expect(getMid(boundaryEvent)).to.eql({
        x: boundaryEventMid.x - 100,
        y: boundaryEventMid.y,
      });
    }));


    it('should move boundary event when resizing subprocess', inject(function() {

      // given
      var boundaryEvent = $element('BoundaryEvent_2');

      var boundaryEventMid = getMid(boundaryEvent);

      // when
      makeSpace({ x: boundaryEventMid.x - 5, y: boundaryEventMid.y }, { dx: 100 });

      // then
      expect(getMid(boundaryEvent)).to.eql({
        x: boundaryEventMid.x + 100,
        y: boundaryEventMid.y,
      });
    }));


    it('should not move boundary event if subprocess not moving or resizing', inject(function() {

      // given
      var boundaryEvent = $element('BoundaryEvent_2');

      var boundaryEventMid = getMid(boundaryEvent);

      // when
      makeSpace({ x: boundaryEventMid.x + 5, y: boundaryEventMid.y }, { dx: 100 });

      // then
      expect(getMid(boundaryEvent)).to.eql(boundaryEventMid);
    }));

  });


  describe('participants', function() {

    var diagramXML = require('./BpmnSpaceTool.participants.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should resize an expanded pool horizontally', inject(function() {

      // given
      var participant1 = $element('Participant_1');

      var participant1Bounds = getBounds(participant1);

      // when
      makeSpace({ x: 200, y: 90 }, { dx: -100 }, true);

      // then
      expect(participant1).to.have.bounds({
        x: participant1Bounds.x - 100,
        y: participant1Bounds.y,
        width: participant1Bounds.width + 100,
        height: participant1Bounds.height
      });
    }));


    it('should resize an expanded pool vertically', inject(function() {

      // given
      var participant1 = $element('Participant_1');

      var participant1Bounds = getBounds(participant1);

      // when
      makeSpace({ x: 200, y: 90 }, { dy: -100 }, true);

      // then
      expect(participant1).to.have.bounds({
        x: participant1Bounds.x,
        y: participant1Bounds.y - 100,
        width: participant1Bounds.width,
        height: participant1Bounds.height + 100
      });
    }));


    it('should resize an empty pool horizontally', inject(function() {

      // given
      var participant2 = $element('Participant_2');

      var participant2Bounds = getBounds(participant2);

      // when
      makeSpace({ x: 200, y: 180 }, { dx: -100 }, true);

      // then
      expect(participant2).to.have.bounds({
        x: participant2Bounds.x - 100,
        y: participant2Bounds.y,
        width: participant2Bounds.width + 100,
        height: participant2Bounds.height
      });
    }));


    it('should not resize an empty pool vertically', inject(function() {

      // given
      var participant2 = $element('Participant_2');

      var participant2Bounds = getBounds(participant2);

      // when
      makeSpace({ x: 200, y: 180 }, { dy: -100 }, true);

      // then
      expect(participant2).to.have.bounds({
        x: participant2Bounds.x,
        y: participant2Bounds.y,
        width: participant2Bounds.width,
        height: participant2Bounds.height
      });
    }));

  });

});


// helpers //////////

function makeSpace(start, delta, invert, target) {
  var modifier = invert ? invertModifier : {};

  var end = {
    x: start.x + (delta.dx || 0),
    y: start.y + (delta.dy || 0)
  };

  return getBpmnJS().invoke(function(spaceTool, dragging, canvas) {
    spaceTool.activateMakeSpace(canvasEvent(start));

    if (target) {
      target = $element(target);

      dragging.hover({
        element: target,
        gfx: canvas.getGraphics(target)
      });
    }

    dragging.move(canvasEvent(end, modifier));

    dragging.end();
  });
}

function $element(id) {

  if (!isString(id)) {
    return id;
  }

  return getBpmnJS().invoke(function(elementRegistry) {

    const element = elementRegistry.get(id);

    expect(element, `element <#${id}>`).to.exist;

    return element;
  });
}

// eslint-disable-next-line "no-unused-vars"
function leftOf(element) {

  element = $element(element);

  const mid = getMid(element);

  return {
    x: element.x - 10,
    y: mid.y
  };
}

// eslint-disable-next-line "no-unused-vars"
function rightOf(element) {

  element = $element(element);

  const mid = getMid(element);

  return {
    x: element.x + element.width + 10,
    y: mid.y
  };
}

function getBounds(shape) {
  return pick(shape, [ 'x', 'y', 'width', 'height' ]);
}