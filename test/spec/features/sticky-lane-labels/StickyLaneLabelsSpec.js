import { expect } from 'chai';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

var diagramXML = require('../../../fixtures/bpmn/draw/pools.bpmn');

var PARTICIPANT_ID = 'sid-55BF12B8-A470-4AC8-BA67-9CD9635C0237';
var LANE_ID = 'sid-0573A65C-9800-42E4-86E0-9DB1CF5027E5';

describe('features/sticky-lane-labels', function() {

  beforeEach(bootstrapModeler(diagramXML));


  it('should keep labels inside participant and lane without zoom', inject(function(canvas) {

    // given
    canvas.scroll({ dx: -600, dy: 0 });
    var container = canvas.getContainer();

    // when
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);

    // then
    expectLabelInside(container, PARTICIPANT_ID, participantLabel);
    expectLabelInside(container, LANE_ID, laneLabel);
  }));


  it('should keep labels inside participant and lane with zoom out', inject(function(canvas) {

    // given
    canvas.zoom(0.5);
    var container = canvas.getContainer();
    var containerBounds = container.getBoundingClientRect();
    var step = -100;

    // navigate to participant left edge (align left edge with container left)
    var participantBounds = getShape(container, PARTICIPANT_ID).getBoundingClientRect();
    var scrollToStart = containerBounds.left - participantBounds.left;
    canvas.scroll({ dx: scrollToStart, dy: 0 });

    // when - walk right step by step across the participant width and beyond
    var participantWidth = getShape(container, PARTICIPANT_ID).getBoundingClientRect().width;
    var steps = Math.ceil(participantWidth / Math.abs(step)) + 3;

    for (var i = 0; i < steps; i++) {
      canvas.scroll({ dx: step, dy: 0 });

      var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
      var laneLabel = getStickyLabel(container, LANE_ID);
      var currentParticipantBounds = getShape(container, PARTICIPANT_ID).getBoundingClientRect();
      var currentLaneBounds = getShape(container, LANE_ID).getBoundingClientRect();
      var currentContainerBounds = container.getBoundingClientRect();

      var participantVisible = currentParticipantBounds.right > currentContainerBounds.left;
      var laneVisible = currentLaneBounds.right > currentContainerBounds.left;

      // then - labels stay inside while element is visible
      if (participantVisible) {
        expectLabelInside(container, PARTICIPANT_ID, participantLabel);
      } else {
        expect(participantLabel.classList.contains('hidden')).to.be.true;
      }

      if (laneVisible) {
        expectLabelInside(container, LANE_ID, laneLabel);
      } else {
        expect(laneLabel.classList.contains('hidden')).to.be.true;
      }
    }
  }));


  it('should switch to a low zoom tier while zoomed out', inject(function(canvas) {

    // given
    canvas.zoom(0.25);
    canvas.scroll({ dx: -300, dy: 0 });
    var container = canvas.getContainer();

    // when
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    var participantBounds = getShape(container, PARTICIPANT_ID).getBoundingClientRect();
    var labelBounds = participantLabel.getBoundingClientRect();

    // then
    expect(participantLabel.classList.contains('hidden')).to.be.false;
    expectInsideBounds(labelBounds, participantBounds);
  }));


  it('should keep sticky label right of palette while walking right on zoom out', inject(function(canvas) {

    // given
    canvas.scroll({ dx: -225, dy: 0 });
    var container = canvas.getContainer();

    // when
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    var palette = container.querySelector('.djs-palette');

    // then
    expect(palette).to.exist;
    expect(participantLabel.classList.contains('hidden')).to.be.false;
    expect(participantLabel.getBoundingClientRect().left).to.be.at.least(
      palette.getBoundingClientRect().right + 4
    );
  }));


  it('should keep labels inside participant and lane with zoom in', inject(function(canvas) {

    // given
    canvas.zoom(2);
    var container = canvas.getContainer();

    // when
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);

    // then
    expectLabelInside(container, PARTICIPANT_ID, participantLabel);
    expectLabelInside(container, LANE_ID, laneLabel);
  }));


  it('should keep participant label inside with very deep zoom out and in', inject(function(canvas) {

    // given
    var container = canvas.getContainer();

    // when
    canvas.zoom(0.2);
    canvas.zoom(2);

    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);

    // then
    expectLabelInside(container, PARTICIPANT_ID, participantLabel);
  }));


  it('should keep labels inside across 4 deep zoom-in levels without hover-back', inject(function(canvas) {

    // given
    var container = canvas.getContainer();

    // when
    [ 1.25, 1.5, 1.75, 2 ].forEach(function(zoomLevel) {
      canvas.zoom(zoomLevel);
    });

    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);

    // then
    expectLabelInside(container, PARTICIPANT_ID, participantLabel);
    expectLabelInside(container, LANE_ID, laneLabel);
  }));


  it('should not move sticky label left when walking right from edge at zoom 2', inject(function(canvas) {

    // given
    canvas.zoom(2);
    var container = canvas.getContainer();
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    canvas.scroll({ dx: 400, dy: 0 });
    var initialLeft = participantLabel.getBoundingClientRect().left;

    // when
    canvas.scroll({ dx: 100, dy: 0 });

    // then
    expect(participantLabel.getBoundingClientRect().left).to.be.at.least(initialLeft);
  }));


  it('should show overlay again and move it left when coming back from right', inject(function(canvas) {

    // given
    canvas.zoom(2);
    var container = canvas.getContainer();
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);

    canvas.scroll({ dx: 400, dy: 0 });
    var rightEdgeLeft = participantLabel.getBoundingClientRect().left;

    // when
    canvas.scroll({ dx: -400, dy: 0 });

    // then
    expect(participantLabel.classList.contains('hidden')).to.be.false;
    expect(participantLabel.getBoundingClientRect().left).to.be.below(rightEdgeLeft);
  }));


  it('should not jump right when walking left from right edge', inject(function(canvas) {

    // given
    canvas.zoom(2);
    var container = canvas.getContainer();
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);

    canvas.scroll({ dx: 400, dy: 0 });
    var rightEdgeLeft = participantLabel.getBoundingClientRect().left;

    // when
    canvas.scroll({ dx: -150, dy: 0 });

    // then
    expect(participantLabel.getBoundingClientRect().left).to.be.at.most(rightEdgeLeft);
  }));


  it('should move participant and lane overlays together while panning', inject(function(canvas) {

    // given
    canvas.zoom(0.5);
    var container = canvas.getContainer();
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);
    var participantLeft = participantLabel.getBoundingClientRect().left;
    var laneLeft = laneLabel.getBoundingClientRect().left;

    // when
    canvas.scroll({ dx: 300, dy: 0 });

    // then
    var participantAfterLeft = participantLabel.getBoundingClientRect().left;
    var laneAfterLeft = laneLabel.getBoundingClientRect().left;

    expect(participantAfterLeft - participantLeft).to.be.closeTo(
      laneAfterLeft - laneLeft,
      1
    );
  }));


  it('should keep first overlay visible when second overlay appears', inject(function(canvas) {

    // given
    canvas.zoom(0.5);
    canvas.scroll({ dx: -600, dy: 0 });
    var container = canvas.getContainer();
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);

    // then
    expect(participantLabel.classList.contains('hidden')).to.be.false;
    expect(laneLabel.classList.contains('hidden')).to.be.false;
  }));
});

function getShape(container, elementId) {
  return container.querySelector('[data-element-id="' + elementId + '"]');
}


function getStickyLabel(container, elementId) {
  return container.querySelector('[data-container-id="' + elementId + '"] .sticky-lane-label');
}


function expectLabelInside(container, elementId, label) {
  var shape = getShape(container, elementId);

  expect(label).to.exist;
  expect(shape).to.exist;
  expect(label.classList.contains('hidden')).to.be.false;
  expectInsideBounds(label.getBoundingClientRect(), shape.getBoundingClientRect());
}


function expectInsideBounds(inner, outer) {
  expect(inner.left).to.be.at.least(outer.left - 1);
  expect(inner.top).to.be.at.least(outer.top - 1);
  expect(inner.right).to.be.at.most(outer.right + 1);
  expect(inner.bottom).to.be.at.most(outer.bottom + 1);
}
