import { expect } from 'chai';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

var diagramXML = require('../../../fixtures/bpmn/draw/pools.bpmn');

var PARTICIPANT_ID = 'sid-55BF12B8-A470-4AC8-BA67-9CD9635C0237';
var PARTICIPANT_WITH_LANES_ID = 'sid-B6042939-0D7C-4AF0-BAFF-9C4E6077762C';
var COLLAPSED_POOL_ID = 'sid-466F4E40-A5E9-4F4C-B93A-9CE8E398FAEF';
var LANE_ID = 'sid-0573A65C-9800-42E4-86E0-9DB1CF5027E5';
var SUBLANE_ID = 'sid-54427248-3EE5-4B6B-B580-794CE6ABC2CD';

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


  it('should keep nested lane indentation stable across zoom changes', inject(function(canvas) {

    // given
    var container = canvas.getContainer();
    var parentLaneLabel = getStickyLabel(container, LANE_ID);
    var sublaneLabel = getStickyLabel(container, SUBLANE_ID);
    var parentLaneOverlay = parentLaneLabel.parentNode;
    var sublaneOverlay = sublaneLabel.parentNode;
    var initialGap = parseFloat(sublaneOverlay.style.left) - parseFloat(parentLaneOverlay.style.left);

    // when
    canvas.zoom(2);

    // then
    expect(parseFloat(sublaneOverlay.style.left) - parseFloat(parentLaneOverlay.style.left)).to.be.closeTo(initialGap, 1);

    // when
    canvas.zoom(0.5);

    // then
    expect(parseFloat(sublaneOverlay.style.left) - parseFloat(parentLaneOverlay.style.left)).to.be.closeTo(initialGap, 1);
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

  it('should keep nested overlays separated when coming back from right', inject(function(canvas) {

    // given
    var container = canvas.getContainer();
    var parentLaneLabel = getStickyLabel(container, LANE_ID);
    var sublaneLabel = getStickyLabel(container, SUBLANE_ID);
    var rightStep = 120;
    var leftStep = -120;
    var i;

    for (i = 0; i < 20; i++) {
      canvas.scroll({ dx: rightStep, dy: 0 });

      if (parentLaneLabel.classList.contains('hidden') && sublaneLabel.classList.contains('hidden')) {
        break;
      }
    }

    expect(parentLaneLabel.classList.contains('hidden')).to.be.true;
    expect(sublaneLabel.classList.contains('hidden')).to.be.true;

    // when
    for (i = 0; i < 15; i++) {
      canvas.scroll({ dx: leftStep, dy: 0 });

      // then - once both overlays are visible, they must not overlap
      if (!parentLaneLabel.classList.contains('hidden') && !sublaneLabel.classList.contains('hidden')) {
        expectNoOverlap(parentLaneLabel.parentNode, sublaneLabel.parentNode);
      }
    }
  }));


  it('should keep hierarchy overlays separated when appearing at max zoom out', inject(function(canvas) {

    // given
    var maxZoomOut = canvas.zoom(0.1);
    var container = canvas.getContainer();
    var containerBounds = container.getBoundingClientRect();
    var laneBounds = getShape(container, LANE_ID).getBoundingClientRect();
    var scrollToStart = containerBounds.left - laneBounds.left;
    var stepRight = -15;
    var laneWidth = getShape(container, LANE_ID).getBoundingClientRect().width;
    var rightSteps = Math.ceil((laneWidth + containerBounds.width) / Math.abs(stepRight)) + 80;
    var participantLabel = getStickyLabel(container, PARTICIPANT_WITH_LANES_ID);
    var collapsedPoolLabel = getStickyLabel(container, COLLAPSED_POOL_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);
    var sublaneLabel = getStickyLabel(container, SUBLANE_ID);
    var hierarchyVisibleWithoutCollapsedPool = false;

    canvas.scroll({ dx: scrollToStart, dy: 0 });

    expect(maxZoomOut).to.equal(0.1);

    // when - walk right in fine-grained steps until hierarchy overlays are visible
    // while collapsed pool overlay is not visible anymore
    for (var i = 0; i < rightSteps; i++) {
      canvas.scroll({ dx: stepRight, dy: 0 });

      if (!participantLabel.classList.contains('hidden') &&
        !laneLabel.classList.contains('hidden') &&
        !sublaneLabel.classList.contains('hidden') &&
        collapsedPoolLabel.classList.contains('hidden')) {

        hierarchyVisibleWithoutCollapsedPool = true;

        // then - at this point visible overlays keep pool -> lane -> sublane hierarchy order
        expectHierarchyOrder(participantLabel.parentNode, laneLabel.parentNode, sublaneLabel.parentNode);
        expect(collapsedPoolLabel.classList.contains('hidden')).to.be.true;

        break;
      }
    }

    expect(hierarchyVisibleWithoutCollapsedPool).to.be.true;
  }));


  it('should keep hierarchy overlays separated when appearing at zoom 0.6380360126495361', inject(function(canvas) {

    // given
    var zoomLevel = 0.6380360126495361;
    var appliedZoom = canvas.zoom(zoomLevel);
    var container = canvas.getContainer();
    var containerBounds = container.getBoundingClientRect();
    var laneBounds = getShape(container, LANE_ID).getBoundingClientRect();
    var scrollToStart = containerBounds.left - laneBounds.left;
    var stepRight = -15;
    var laneWidth = getShape(container, LANE_ID).getBoundingClientRect().width;
    var rightSteps = Math.ceil((laneWidth + containerBounds.width) / Math.abs(stepRight)) + 80;
    var participantLabel = getStickyLabel(container, PARTICIPANT_WITH_LANES_ID);
    var collapsedPoolLabel = getStickyLabel(container, COLLAPSED_POOL_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);
    var sublaneLabel = getStickyLabel(container, SUBLANE_ID);
    var hierarchyVisibleWithoutCollapsedPool = false;

    canvas.scroll({ dx: scrollToStart, dy: 0 });

    expect(appliedZoom).to.be.closeTo(zoomLevel, 0.001);

    // when - walk right in fine-grained steps until hierarchy overlays are visible
    // while collapsed pool overlay is not visible anymore
    for (var i = 0; i < rightSteps; i++) {
      canvas.scroll({ dx: stepRight, dy: 0 });

      if (!participantLabel.classList.contains('hidden') &&
        !laneLabel.classList.contains('hidden') &&
        !sublaneLabel.classList.contains('hidden') &&
        collapsedPoolLabel.classList.contains('hidden')) {

        hierarchyVisibleWithoutCollapsedPool = true;

        // then - at this point visible overlays keep pool -> lane -> sublane hierarchy order
        expectHierarchyOrder(participantLabel.parentNode, laneLabel.parentNode, sublaneLabel.parentNode);
        expect(collapsedPoolLabel.classList.contains('hidden')).to.be.true;

        break;
      }
    }

    expect(hierarchyVisibleWithoutCollapsedPool).to.be.true;
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


  it('should update overlay positions after moving a participant', inject(function(canvas, modeling, elementRegistry) {

    // given
    canvas.scroll({ dx: -600, dy: 0 });
    var container = canvas.getContainer();
    var participant = elementRegistry.get(PARTICIPANT_ID);
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);

    expect(participantLabel.classList.contains('hidden')).to.be.false;
    var labelBoundsBefore = participantLabel.getBoundingClientRect();

    // when
    modeling.moveElements([ participant ], { x: 200, y: 0 });

    // then
    var participantLabelAfter = getStickyLabel(container, PARTICIPANT_ID);
    var participantBounds = getShape(container, PARTICIPANT_ID).getBoundingClientRect();

    expect(participantLabelAfter.classList.contains('hidden')).to.be.false;
    expectInsideBounds(participantLabelAfter.getBoundingClientRect(), participantBounds);
  }));


  it('should update overlay positions after moving a lane', inject(function(canvas, modeling, elementRegistry) {

    // given
    canvas.scroll({ dx: -800, dy: 0 });
    var container = canvas.getContainer();
    var participantWithLanes = elementRegistry.get(PARTICIPANT_WITH_LANES_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);

    expect(laneLabel.classList.contains('hidden')).to.be.false;
    var laneBoundsBefore = getShape(container, LANE_ID).getBoundingClientRect();

    // when
    modeling.moveElements([ participantWithLanes ], { x: 100, y: 0 });

    // then
    var laneLabelAfter = getStickyLabel(container, LANE_ID);
    var laneBoundsAfter = getShape(container, LANE_ID).getBoundingClientRect();

    expect(laneLabelAfter.classList.contains('hidden')).to.be.false;
    expectInsideBounds(laneLabelAfter.getBoundingClientRect(), laneBoundsAfter);
  }));


  it('should update overlay positions after moving a participant when zoomed in', inject(function(canvas, modeling, elementRegistry) {

    // given
    canvas.zoom(2);
    canvas.scroll({ dx: -400, dy: 0 });
    var container = canvas.getContainer();
    var participant = elementRegistry.get(PARTICIPANT_ID);
    var participantLabel = getStickyLabel(container, PARTICIPANT_ID);

    expect(participantLabel.classList.contains('hidden')).to.be.false;
    var labelLeftBefore = participantLabel.getBoundingClientRect().left;

    // when
    modeling.moveElements([ participant ], { x: 150, y: 0 });

    // then
    var participantLabelAfter = getStickyLabel(container, PARTICIPANT_ID);
    var participantBounds = getShape(container, PARTICIPANT_ID).getBoundingClientRect();

    expect(participantLabelAfter.classList.contains('hidden')).to.be.false;
    expectInsideBounds(participantLabelAfter.getBoundingClientRect(), participantBounds);
  }));


  it('should update sublane overlay positions after moving participant when zoomed in', inject(function(canvas, modeling, elementRegistry) {

    // given
    canvas.zoom(2);
    canvas.scroll({ dx: -600, dy: 0 });
    var container = canvas.getContainer();
    var participantWithLanes = elementRegistry.get(PARTICIPANT_WITH_LANES_ID);
    var participantLabel = getStickyLabel(container, PARTICIPANT_WITH_LANES_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);
    var sublaneLabel = getStickyLabel(container, SUBLANE_ID);

    expect(laneLabel.classList.contains('hidden')).to.be.false;
    expect(sublaneLabel.classList.contains('hidden')).to.be.false;

    // when
    modeling.moveElements([ participantWithLanes ], { x: 150, y: 0 });

    // then
    var participantLabelAfter = getStickyLabel(container, PARTICIPANT_WITH_LANES_ID);
    var laneLabelAfter = getStickyLabel(container, LANE_ID);
    var sublaneLabelAfter = getStickyLabel(container, SUBLANE_ID);
    var laneBounds = getShape(container, LANE_ID).getBoundingClientRect();
    var sublaneBounds = getShape(container, SUBLANE_ID).getBoundingClientRect();

    expect(laneLabelAfter.classList.contains('hidden')).to.be.false;
    expectInsideBounds(laneLabelAfter.getBoundingClientRect(), laneBounds);

    expect(sublaneLabelAfter.classList.contains('hidden')).to.be.false;
    expectInsideBounds(sublaneLabelAfter.getBoundingClientRect(), sublaneBounds);

    // hierarchy order must be maintained: participant -> lane -> sublane
    if (!participantLabelAfter.classList.contains('hidden')) {
      expectHierarchyOrder(participantLabelAfter.parentNode, laneLabelAfter.parentNode, sublaneLabelAfter.parentNode);
    } else {
      expectNoOverlap(laneLabelAfter.parentNode, sublaneLabelAfter.parentNode);
    }
  }));


  it('should maintain hierarchy after moving participant far right when zoomed in', inject(function(canvas, modeling, elementRegistry) {

    // given - zoom in and scroll so labels are sticky
    canvas.zoom(2);
    canvas.scroll({ dx: -800, dy: 0 });
    var container = canvas.getContainer();
    var participantWithLanes = elementRegistry.get(PARTICIPANT_WITH_LANES_ID);
    var participantLabel = getStickyLabel(container, PARTICIPANT_WITH_LANES_ID);
    var laneLabel = getStickyLabel(container, LANE_ID);
    var sublaneLabel = getStickyLabel(container, SUBLANE_ID);

    // assume - labels are visible and in hierarchy order before move
    expect(participantLabel.classList.contains('hidden')).to.be.false;
    expect(laneLabel.classList.contains('hidden')).to.be.false;
    expect(sublaneLabel.classList.contains('hidden')).to.be.false;
    expectHierarchyOrder(participantLabel.parentNode, laneLabel.parentNode, sublaneLabel.parentNode);

    // when - move participant far to the right (enough that left edge becomes visible)
    modeling.moveElements([ participantWithLanes ], { x: 800, y: 0 });

    // then - labels should still be inside their bounds and maintain order
    var participantLabelAfter = getStickyLabel(container, PARTICIPANT_WITH_LANES_ID);
    var laneLabelAfter = getStickyLabel(container, LANE_ID);
    var sublaneLabelAfter = getStickyLabel(container, SUBLANE_ID);
    var participantBounds = getShape(container, PARTICIPANT_WITH_LANES_ID).getBoundingClientRect();
    var laneBounds = getShape(container, LANE_ID).getBoundingClientRect();
    var sublaneBounds = getShape(container, SUBLANE_ID).getBoundingClientRect();

    if (!participantLabelAfter.classList.contains('hidden')) {
      expectInsideBounds(participantLabelAfter.getBoundingClientRect(), participantBounds);
    }

    if (!laneLabelAfter.classList.contains('hidden')) {
      expectInsideBounds(laneLabelAfter.getBoundingClientRect(), laneBounds);
    }

    if (!sublaneLabelAfter.classList.contains('hidden')) {
      expectInsideBounds(sublaneLabelAfter.getBoundingClientRect(), sublaneBounds);
    }

    if (!participantLabelAfter.classList.contains('hidden') &&
        !laneLabelAfter.classList.contains('hidden') &&
        !sublaneLabelAfter.classList.contains('hidden')) {
      expectHierarchyOrder(participantLabelAfter.parentNode, laneLabelAfter.parentNode, sublaneLabelAfter.parentNode);
    }
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


function expectNoOverlap(leftOverlay, rightOverlay) {
  expect(rightOverlay.getBoundingClientRect().left).to.be.at.least(
    leftOverlay.getBoundingClientRect().right - 1
  );
}


function expectHierarchyOrder(participantOverlay, laneOverlay, sublaneOverlay) {
  expectNoOverlap(participantOverlay, laneOverlay);
  expectNoOverlap(laneOverlay, sublaneOverlay);
  expectNoOverlap(participantOverlay, sublaneOverlay);
}