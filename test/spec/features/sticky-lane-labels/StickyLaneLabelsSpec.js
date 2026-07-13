import { expect } from 'chai';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

var diagramXML = require('../../../fixtures/bpmn/draw/pools.bpmn');

var PARTICIPANT_ID = 'sid-55BF12B8-A470-4AC8-BA67-9CD9635C0237';
var LANE_ID = 'sid-0573A65C-9800-42E4-86E0-9DB1CF5027E5';
var EDGE_DELTA = 1;
var PAN_STEP = 40;
var PAN_ITERATIONS = 80;
var END_EXTRA_PX = 100;
var STEP_RIGHT_PX = 15;
var EDGE_MOVE_ITERATIONS = 180;
var RIGHT_WALK_ITERATIONS = 260;
var RETURN_WALK_ITERATIONS = 220;
var OVERLAY_RIGHT_GAP_TOLERANCE_PX = 5;
var EDGE_BOUNCE_STEPS = 6;
var EDGE_BOUNCE_DELTA_LIMIT_PX = STEP_RIGHT_PX + OVERLAY_RIGHT_GAP_TOLERANCE_PX;


describe('features/sticky-lane-labels', function() {
  this.timeout(15000);

  beforeEach(bootstrapModeler(diagramXML));


  it('should keep labels inside participant and lane without zoom', inject(function(canvas) {
    assertOverlayStaysInsideAndSticksToEnd(canvas, PARTICIPANT_ID, 'participant');
    assertOverlayStaysInsideAndSticksToEnd(canvas, LANE_ID, 'lane');
  }));


  it('should keep labels inside participant and lane with zoom out', inject(function(canvas) {

    // when
    canvas.zoom(0.5, { x: 0, y: 0 });

    // then
    assertOverlayStaysInsideAndSticksToEnd(canvas, PARTICIPANT_ID, 'participant');
    assertOverlayStaysInsideAndSticksToEnd(canvas, LANE_ID, 'lane');
  }));


  it('should keep sticky label right of palette while walking right on zoom out', inject(function(canvas) {
    var searchRoot = getSearchRoot(canvas);

    // when
    canvas.zoom(0.5, { x: 0, y: 0 });

    // then
    assertStaysRightOfPaletteWhileWalkingRightUntilOutOfView(canvas, searchRoot, PARTICIPANT_ID, 'participant');
    assertStaysRightOfPaletteWhileWalkingRightUntilOutOfView(canvas, searchRoot, LANE_ID, 'lane');
  }));


  it('should keep labels inside participant and lane with zoom in', inject(function(canvas) {

    // when
    canvas.zoom(2, { x: 0, y: 0 });

    // then
    assertOverlayStaysInsideAndSticksToEnd(canvas, PARTICIPANT_ID, 'participant');
    assertOverlayStaysInsideAndSticksToEnd(canvas, LANE_ID, 'lane');
  }));


  it('should keep participant label inside with very deep zoom out and in', inject(function(canvas) {

    // when
    canvas.zoom(0.2, { x: 0, y: 0 });

    // then
    assertOverlayStaysInsideAndSticksToEnd(canvas, PARTICIPANT_ID, 'participant');

    // when
    canvas.zoom(4, { x: 0, y: 0 });

    // then
    assertOverlayStaysInsideAndSticksToEnd(canvas, PARTICIPANT_ID, 'participant');
  }));


  it('should keep labels inside across 4 deep zoom-in levels without hover-back', inject(function(canvas) {
    var zoomLevels = [ 1.5, 2, 3, 4 ];

    zoomLevels.forEach(function(zoomLevel) {

      // when
      canvas.zoom(zoomLevel, { x: 0, y: 0 });

      // then
      assertOverlayStaysInsideAndSticksToEndOneDirection(canvas, PARTICIPANT_ID, 'participant');
      assertOverlayStaysInsideAndSticksToEndOneDirection(canvas, LANE_ID, 'lane');
    });
  }));


  it('should not move sticky label left when walking right from edge at zoom 2', inject(function(canvas) {
    var searchRoot = getSearchRoot(canvas);
    var participant = getTargetElement(searchRoot, PARTICIPANT_ID);
    var lane = getTargetElement(searchRoot, LANE_ID);

    canvas.zoom(2, { x: 0, y: 0 });

    assertNoLeftShiftWhileWalkingRight(canvas, searchRoot, participant, PARTICIPANT_ID, 'participant');
    assertNoLeftShiftWhileWalkingRight(canvas, searchRoot, lane, LANE_ID, 'lane');
  }));


  it('should show overlay again and move it left when coming back from right', inject(function(canvas) {
    var searchRoot = getSearchRoot(canvas);
    var participant = getTargetElement(searchRoot, PARTICIPANT_ID);

    canvas.zoom(2, { x: 0, y: 0 });

    assertOverlayReappearsAndMovesLeftFromRight(canvas, searchRoot, participant, PARTICIPANT_ID, 'participant');
  }));


  it('should not jump right when walking left from right edge', inject(function(canvas) {
    var searchRoot = getSearchRoot(canvas);
    var participant = getTargetElement(searchRoot, PARTICIPANT_ID);
    var lane = getTargetElement(searchRoot, LANE_ID);

    canvas.zoom(2, { x: 0, y: 0 });

    assertNoRightJumpWhileWalkingLeftFromRightEdge(canvas, searchRoot, participant, PARTICIPANT_ID, 'participant');
    assertNoRightJumpWhileWalkingLeftFromRightEdge(canvas, searchRoot, lane, LANE_ID, 'lane');
  }));


  it('should move participant and lane overlays together while panning', inject(function(canvas) {
    var searchRoot = getSearchRoot(canvas);

    canvas.zoom(2, { x: 0, y: 0 });

    assertOverlaysMoveTogether(canvas, searchRoot, PARTICIPANT_ID, LANE_ID);
  }));


  it('should keep first overlay visible when second overlay appears', inject(function(canvas) {
    var searchRoot = getSearchRoot(canvas);

    canvas.zoom(2, { x: 0, y: 0 });

    assertFirstOverlayStaysVisibleWhenSecondAppears(canvas, searchRoot, PARTICIPANT_ID, LANE_ID);
  }));

});


function assertOverlayStaysInsideAndSticksToEnd(canvas, elementId, elementType) {
  var searchRoot = getSearchRoot(canvas);
  var element = getTargetElement(searchRoot, elementId);
  var overlay = getOverlay(searchRoot, elementId);
  var label = overlay.querySelector('.sticky-lane-label');

  expect(element, `${elementType} should exist`).to.exist;
  expect(overlay, 'overlay should exist').to.exist;
  expect(label, 'label should exist').to.exist;

  var primaryDirection = getDirectionDecreasingXOffset(canvas, searchRoot, element);
  var result = assertByDirection(canvas, searchRoot, element, overlay, label, elementType, primaryDirection);

  if (!result.hasSeenVisibleOverlay) {
    result = assertByDirection(canvas, searchRoot, element, overlay, label, elementType, -1 * primaryDirection);
  }

  expect(result.hasSeenVisibleOverlay, 'overlay should become visible while panning').to.be.true;
  expect(result.hasSeenHiddenAfterVisible, `overlay should hide after reaching ${elementType} end`).to.be.true;
}


function assertOverlayStaysInsideAndSticksToEndOneDirection(canvas, elementId, elementType) {
  var searchRoot = getSearchRoot(canvas);
  var element = getTargetElement(searchRoot, elementId);
  var overlay = getOverlay(searchRoot, elementId);
  var label = overlay.querySelector('.sticky-lane-label');

  expect(element, `${elementType} should exist`).to.exist;
  expect(overlay, 'overlay should exist').to.exist;
  expect(label, 'label should exist').to.exist;

  var primaryDirection = getDirectionDecreasingXOffset(canvas, searchRoot, element);
  var result = assertByDirection(canvas, searchRoot, element, overlay, label, elementType, primaryDirection);

  expect(result.hasSeenVisibleOverlay, 'overlay should become visible while panning in one direction').to.be.true;
  expect(result.hasSeenHiddenAfterVisible, `overlay should hide after reaching ${elementType} end in one direction`).to.be.true;
}


function assertByDirection(canvas, searchRoot, element, overlay, label, elementType, direction) {
  var hasSeenVisibleOverlay = false;
  var hasSeenHiddenAfterVisible = false;
  var wasVisible = false;
  var totalPanX = 0;

  for (var i = 0; i < PAN_ITERATIONS; i++) {
    var panDeltaX = direction * PAN_STEP;
    canvas.scroll({ dx: panDeltaX, dy: 0 });
    totalPanX += panDeltaX;

    var state = getOverlayState(searchRoot, element, overlay, label);

    if (!state.isVisible) {
      if (wasVisible) {
        hasSeenHiddenAfterVisible = true;
        expect(
          state.elementRight,
          `${elementType} should be at the end when overlay hides`
        ).to.be.at.most(EDGE_DELTA);
        break;
      }

      continue;
    }

    wasVisible = true;
    hasSeenVisibleOverlay = true;

    expect(
      state.overlayRight,
      `overlay must stay inside ${elementType} right edge`
    ).to.be.at.most(state.elementRight + EDGE_DELTA);
  }

  canvas.scroll({ dx: -totalPanX, dy: 0 });

  return {
    hasSeenVisibleOverlay: hasSeenVisibleOverlay,
    hasSeenHiddenAfterVisible: hasSeenHiddenAfterVisible
  };
}


function getDirectionDecreasingXOffset(canvas, searchRoot, element) {
  var beforeXOffset = getXOffset(searchRoot, element);

  canvas.scroll({ dx: PAN_STEP, dy: 0 });
  var afterXOffset = getXOffset(searchRoot, element);
  canvas.scroll({ dx: -PAN_STEP, dy: 0 });

  return afterXOffset < beforeXOffset ? 1 : -1;
}


function getSearchRoot(canvas) {
  return canvas.getContainer();
}


function getTargetElement(searchRoot, id) {
  return searchRoot.querySelector(`[data-element-id="${id}"]`);
}


function getOverlay(searchRoot, id) {
  return searchRoot.querySelector(`[data-container-id="${id}"] .djs-overlay-sticky-lane-label`);
}


function getPalette(searchRoot) {
  return searchRoot.querySelector('.djs-palette');
}


function assertStaysRightOfPaletteWhileWalkingRightUntilOutOfView(canvas, searchRoot, elementId, elementType) {
  var element = getTargetElement(searchRoot, elementId);
  var overlay = getOverlay(searchRoot, elementId);
  var palette = getPalette(searchRoot);
  var label = overlay.querySelector('.sticky-lane-label');
  var viewportBounds = getViewportBounds(searchRoot);
  var paletteBounds = palette.getBoundingClientRect();
  var directionToRight = getDirectionIncreasingElementRight(canvas, element);
  var totalPanX = 0;
  var reachedOutOfView = false;

  expect(element, `${elementType} should exist`).to.exist;
  expect(overlay, `${elementType} overlay should exist`).to.exist;
  expect(palette, 'palette should exist').to.exist;
  expect(label, `${elementType} label should exist`).to.exist;

  for (var i = 0; i < RIGHT_WALK_ITERATIONS; i++) {
    var elementBounds = element.getBoundingClientRect();

    if (!isVisibleInViewport(elementBounds, viewportBounds)) {
      reachedOutOfView = true;
      break;
    }

    var overlayBounds = overlay.getBoundingClientRect();

    if (!label.classList.contains('hidden') && areAtSameHeight(overlayBounds, paletteBounds)) {
      expect(
        overlayBounds.left,
        `sticky overlay should stay right of palette while walking right (${elementType})`
      ).to.be.at.least(paletteBounds.right - EDGE_DELTA);
    }

    var panDeltaX = directionToRight * STEP_RIGHT_PX;
    canvas.scroll({ dx: panDeltaX, dy: 0 });
    totalPanX += panDeltaX;
  }
  canvas.scroll({ dx: -totalPanX, dy: 0 });

  expect(reachedOutOfView, `${elementType} should become invisible while walking right`).to.be.true;
}


function isVisibleInViewport(elementBounds, viewportBounds) {
  return elementBounds.right >= viewportBounds.left && elementBounds.left <= viewportBounds.right;
}


function areAtSameHeight(a, b) {
  return a.bottom >= b.top && a.top <= b.bottom;
}


function getOverlayState(searchRoot, element, overlay, label) {
  var elementBounds = element.getBoundingClientRect();
  var overlayBounds = overlay.getBoundingClientRect();

  return {
    isVisible: !label.classList.contains('hidden'),
    elementBounds: elementBounds,
    elementRight: elementBounds.right,
    overlayLeft: overlayBounds.left,
    overlayRight: overlayBounds.right,
    rightGap: elementBounds.right - overlayBounds.right
  };
}


function getXOffset(searchRoot, element) {
  var poolTargetTransformMatrix = new DOMMatrix(window.getComputedStyle(element).transform);
  var viewport = searchRoot.querySelector('.viewport');
  var viewPortTransformMatrix = new DOMMatrix(window.getComputedStyle(viewport).transform);

  return viewPortTransformMatrix.m41 + poolTargetTransformMatrix.m41;
}


function assertNoLeftShiftWhileWalkingRight(canvas, searchRoot, element, elementId, elementType) {
  var directionToRight = getDirectionIncreasingElementRight(canvas, element);
  var walkDirections = [ -1 * directionToRight, directionToRight ];
  var successfulResult = null;
  var lastResult;

  walkDirections.forEach(function(walkDirection) {
    if (successfulResult) {
      return;
    }

    var result = attemptRightWalk(canvas, searchRoot, element, elementId, elementType, directionToRight, walkDirection);

    if (result.hasSeenVisibleOverlay && result.reachedEndPlus && result.hiddenWhenOutOfView) {
      successfulResult = result;
      return;
    }

    lastResult = result;
  });

  expect((successfulResult || lastResult).hasSeenVisibleOverlay, `${elementType} overlay should become visible`).to.be.true;
  expect((successfulResult || lastResult).reachedEndPlus, `${elementType} should pass end + ${END_EXTRA_PX}px`).to.be.true;
  expect((successfulResult || lastResult).hiddenWhenOutOfView, `${elementType} overlay should hide when element is out of view`).to.be.true;
}


function assertOverlayReappearsAndMovesLeftFromRight(canvas, searchRoot, element, elementId, elementType) {
  var overlay = getOverlay(searchRoot, elementId);
  var label = overlay.querySelector('.sticky-lane-label');
  var directionToRight = getDirectionIncreasingElementRight(canvas, element);
  var moveOutDirection = -1 * directionToRight;
  var movedToEdge = panElementToViewportRightEdge(canvas, searchRoot, element, directionToRight);
  var totalPanX = 0;
  var movedPastEnd = false;
  var hiddenAfterMoveOut = false;
  var returnAttemptResults = [];
  var successfulReturn = null;

  expect(movedToEdge, `${elementType} should reach right viewport edge before move-out`).to.be.true;

  for (var i = 0; i < RIGHT_WALK_ITERATIONS; i++) {
    var panDeltaX = moveOutDirection * STEP_RIGHT_PX;
    canvas.scroll({ dx: panDeltaX, dy: 0 });
    totalPanX += panDeltaX;

    var moveOutState = getOverlayState(searchRoot, element, overlay, label);

    if ((i + 1) * STEP_RIGHT_PX >= END_EXTRA_PX) {
      movedPastEnd = true;
    }

    if (movedPastEnd && !moveOutState.isVisible) {
      hiddenAfterMoveOut = true;
      break;
    }
  }

  expect(hiddenAfterMoveOut, `${elementType} overlay should hide after moving past end + ${END_EXTRA_PX}px`).to.be.true;

  [ directionToRight, -1 * directionToRight ].forEach(function(returnDirection) {
    var localPanX = 0;
    var localReappeared = false;
    var localMovedLeft = false;
    var previousOverlayLeft = null;
    var previousRightGap = null;

    if (successfulReturn) {
      return;
    }

    for (var j = 0; j < RETURN_WALK_ITERATIONS; j++) {
      var returnPanDeltaX = returnDirection * STEP_RIGHT_PX;
      canvas.scroll({ dx: returnPanDeltaX, dy: 0 });
      localPanX += returnPanDeltaX;

      var returnState = getOverlayState(searchRoot, element, overlay, label);

      if (!returnState.isVisible) {
        continue;
      }

      if (!localReappeared) {
        localReappeared = true;
        previousOverlayLeft = returnState.overlayLeft;
        previousRightGap = returnState.rightGap;
        continue;
      }

      if (returnState.overlayLeft < previousOverlayLeft - EDGE_DELTA ||
        returnState.rightGap > previousRightGap + EDGE_DELTA) {
        localMovedLeft = true;
      }

      previousOverlayLeft = returnState.overlayLeft;
      previousRightGap = returnState.rightGap;

      if (localMovedLeft) {
        break;
      }
    }

    if (localReappeared && localMovedLeft) {
      totalPanX += localPanX;
      successfulReturn = {
        reappeared: localReappeared,
        movedLeftAfterReappear: localMovedLeft
      };
      return;
    }

    canvas.scroll({ dx: -localPanX, dy: 0 });
    returnAttemptResults.push({
      reappeared: localReappeared,
      movedLeftAfterReappear: localMovedLeft
    });
  });

  canvas.scroll({ dx: -totalPanX, dy: 0 });

  var result = successfulReturn || returnAttemptResults[0] || {};

  expect(result.reappeared, `${elementType} overlay should reappear when coming back from the right`).to.be.true;
  expect(result.movedLeftAfterReappear, `${elementType} overlay should move left after reappearing`).to.be.true;
}


function assertNoRightJumpWhileWalkingLeftFromRightEdge(canvas, searchRoot, element, elementId, elementType) {
  var overlay = getOverlay(searchRoot, elementId);
  var label = overlay.querySelector('.sticky-lane-label');
  var directionToRight = getDirectionIncreasingElementRight(canvas, element);
  var moveLeftDirection = getDirectionDecreasingElementLeft(canvas, element);
  var movedToEdge = panElementToViewportRightEdge(canvas, searchRoot, element, directionToRight);
  var totalPanX = 0;
  var initialState;
  var previousState;

  expect(movedToEdge, `${elementType} should reach right viewport edge before left-walk check`).to.be.true;

  initialState = getOverlayState(searchRoot, element, overlay, label);

  if (!initialState.isVisible) {
    totalPanX += ensureStickyVisibleNearEdge(canvas, searchRoot, element, overlay, label, -1 * directionToRight);
    initialState = getOverlayState(searchRoot, element, overlay, label);
  }

  expect(initialState.isVisible, `${elementType} overlay should be visible at right edge`).to.be.true;
  expect(initialState.rightGap, `${elementType} overlay should be right-aligned at edge`).to.be.at.least(-EDGE_DELTA);

  previousState = initialState;

  for (var i = 0; i < EDGE_BOUNCE_STEPS; i++) {
    var panDeltaX = moveLeftDirection * STEP_RIGHT_PX;
    canvas.scroll({ dx: panDeltaX, dy: 0 });
    totalPanX += panDeltaX;

    var moveLeftState = getOverlayState(searchRoot, element, overlay, label);

    expect(
      moveLeftState.overlayLeft,
      `${elementType} overlay should not jump right while walking left`
    ).to.be.at.most(previousState.overlayLeft + EDGE_BOUNCE_DELTA_LIMIT_PX);

    previousState = moveLeftState;
  }

  canvas.scroll({ dx: -totalPanX, dy: 0 });
}


function attemptRightWalk(canvas, searchRoot, element, elementId, elementType, directionToRight, walkDirection) {
  var overlay = getOverlay(searchRoot, elementId);
  var label = overlay.querySelector('.sticky-lane-label');
  var movedToEdge = panElementToViewportRightEdge(canvas, searchRoot, element, directionToRight);
  var prepPanX = 0;
  var initialState;
  var previousRightGap = null;
  var totalPanX = 0;
  var walkedRightDistance = 0;
  var reachedEndPlus = false;
  var hiddenWhenOutOfView = false;
  var hasSeenVisibleOverlay = false;

  expect(movedToEdge, `${elementType} should reach right viewport edge before stepping`).to.be.true;

  initialState = getOverlayState(searchRoot, element, overlay, label);

  if (!initialState.isVisible) {
    prepPanX = ensureStickyVisibleNearEdge(canvas, searchRoot, element, overlay, label, -1 * directionToRight);
    totalPanX += prepPanX;
    initialState = getOverlayState(searchRoot, element, overlay, label);
  }

  if (initialState.isVisible) {
    hasSeenVisibleOverlay = true;
    previousRightGap = initialState.rightGap;
  }

  for (var i = 0; i < RIGHT_WALK_ITERATIONS; i++) {
    var panDeltaX = walkDirection * STEP_RIGHT_PX;
    canvas.scroll({ dx: panDeltaX, dy: 0 });
    totalPanX += panDeltaX;
    walkedRightDistance += Math.abs(panDeltaX);

    var state = getOverlayState(searchRoot, element, overlay, label);

    if (walkedRightDistance >= END_EXTRA_PX) {
      reachedEndPlus = true;
    }

    if (state.isVisible) {
      hasSeenVisibleOverlay = true;

      if (previousRightGap !== null) {
        expect(
          state.rightGap,
          `${elementType} overlay should stay at ${elementType} right end while walking right`
        ).to.be.at.most(previousRightGap + OVERLAY_RIGHT_GAP_TOLERANCE_PX);
      }

      previousRightGap = state.rightGap;
    }

    if (!state.isVisible && reachedEndPlus) {
      hiddenWhenOutOfView = true;
      break;
    }
  }

  canvas.scroll({ dx: -totalPanX, dy: 0 });

  return {
    hasSeenVisibleOverlay: hasSeenVisibleOverlay,
    reachedEndPlus: reachedEndPlus,
    hiddenWhenOutOfView: hiddenWhenOutOfView
  };
}


function panElementToViewportRightEdge(canvas, searchRoot, element, directionToRight) {
  var totalPanX = 0;

  for (var i = 0; i < EDGE_MOVE_ITERATIONS; i++) {
    var bounds = element.getBoundingClientRect();
    var viewportBounds = getViewportBounds(searchRoot);
    var distanceToRight = Math.abs(bounds.right - viewportBounds.right);

    if (distanceToRight <= STEP_RIGHT_PX) {
      return true;
    }

    var panDeltaX = directionToRight * STEP_RIGHT_PX;
    canvas.scroll({ dx: panDeltaX, dy: 0 });
    totalPanX += panDeltaX;
  }

  canvas.scroll({ dx: -totalPanX, dy: 0 });

  return false;
}


function getDirectionIncreasingElementRight(canvas, element) {
  var before = element.getBoundingClientRect();

  canvas.scroll({ dx: STEP_RIGHT_PX, dy: 0 });
  var rightAfterPositive = element.getBoundingClientRect().right;
  canvas.scroll({ dx: -STEP_RIGHT_PX, dy: 0 });

  if (rightAfterPositive > before.right) {
    return 1;
  }

  return -1;
}


function getDirectionDecreasingElementLeft(canvas, element) {
  var before = element.getBoundingClientRect();

  canvas.scroll({ dx: STEP_RIGHT_PX, dy: 0 });
  var leftAfterPositive = element.getBoundingClientRect().left;
  canvas.scroll({ dx: -STEP_RIGHT_PX, dy: 0 });

  canvas.scroll({ dx: -STEP_RIGHT_PX, dy: 0 });
  var leftAfterNegative = element.getBoundingClientRect().left;
  canvas.scroll({ dx: STEP_RIGHT_PX, dy: 0 });

  if (leftAfterPositive < before.left && leftAfterPositive <= leftAfterNegative) {
    return 1;
  }

  if (leftAfterNegative < before.left) {
    return -1;
  }

  return -1;
}


function ensureStickyVisibleNearEdge(canvas, searchRoot, element, overlay, label, prepDirection) {
  var totalPanX = 0;

  for (var i = 0; i < EDGE_MOVE_ITERATIONS; i++) {
    var state = getOverlayState(searchRoot, element, overlay, label);

    if (state.isVisible) {
      return totalPanX;
    }

    var panDeltaX = prepDirection * STEP_RIGHT_PX;
    canvas.scroll({ dx: panDeltaX, dy: 0 });
    totalPanX += panDeltaX;
  }

  return totalPanX;
}


function getViewportBounds(searchRoot) {
  var viewport = searchRoot.querySelector('.viewport');

  return viewport.getBoundingClientRect();
}


function getOverlayTranslateX(overlay) {
  var transformMatrix = new DOMMatrix(window.getComputedStyle(overlay).transform);

  return transformMatrix.m41 || 0;
}


function assertOverlaysMoveTogether(canvas, searchRoot, participantId, laneId) {
  var participantOverlay = getOverlay(searchRoot, participantId);
  var laneOverlay = getOverlay(searchRoot, laneId);
  var participantLabel = participantOverlay.querySelector('.sticky-lane-label');
  var laneLabel = laneOverlay.querySelector('.sticky-lane-label');
  var participant = getTargetElement(searchRoot, participantId);
  var direction = getDirectionDecreasingXOffset(canvas, searchRoot, participant);
  var totalPanX = 0;
  var bothVisible = false;

  expect(participantOverlay, 'participant overlay should exist').to.exist;
  expect(laneOverlay, 'lane overlay should exist').to.exist;

  for (var i = 0; i < PAN_ITERATIONS; i++) {
    if (!participantLabel.classList.contains('hidden') && !laneLabel.classList.contains('hidden')) {
      bothVisible = true;
      break;
    }

    canvas.scroll({ dx: direction * STEP_RIGHT_PX, dy: 0 });
    totalPanX += direction * STEP_RIGHT_PX;
  }

  expect(bothVisible, 'participant and lane overlays should become visible together').to.be.true;

  var previousParticipantTranslateX = getOverlayTranslateX(participantOverlay);
  var previousLaneTranslateX = getOverlayTranslateX(laneOverlay);
  var comparedSteps = 0;

  for (var j = 0; j < EDGE_BOUNCE_STEPS; j++) {
    canvas.scroll({ dx: direction * STEP_RIGHT_PX, dy: 0 });
    totalPanX += direction * STEP_RIGHT_PX;

    if (participantLabel.classList.contains('hidden') || laneLabel.classList.contains('hidden')) {
      break;
    }

    var participantTranslateX = getOverlayTranslateX(participantOverlay);
    var laneTranslateX = getOverlayTranslateX(laneOverlay);
    var participantDelta = participantTranslateX - previousParticipantTranslateX;
    var laneDelta = laneTranslateX - previousLaneTranslateX;

    expect(
      Math.abs(participantDelta - laneDelta),
      'participant and lane overlays should move by same delta'
    ).to.be.at.most(EDGE_DELTA);

    previousParticipantTranslateX = participantTranslateX;
    previousLaneTranslateX = laneTranslateX;
    comparedSteps++;
  }

  canvas.scroll({ dx: -totalPanX, dy: 0 });

  expect(comparedSteps, 'should compare at least one shared movement step').to.be.greaterThan(0);
}


function assertFirstOverlayStaysVisibleWhenSecondAppears(canvas, searchRoot, firstId, secondId) {
  var firstOverlay = getOverlay(searchRoot, firstId);
  var secondOverlay = getOverlay(searchRoot, secondId);
  var firstLabel = firstOverlay.querySelector('.sticky-lane-label');
  var secondLabel = secondOverlay.querySelector('.sticky-lane-label');
  var firstElement = getTargetElement(searchRoot, firstId);
  var direction = getDirectionDecreasingXOffset(canvas, searchRoot, firstElement);
  var totalPanX = 0;
  var firstSeenVisible = false;
  var secondAppeared = false;
  var comparedSteps = 0;

  for (var i = 0; i < RIGHT_WALK_ITERATIONS; i++) {
    canvas.scroll({ dx: direction * STEP_RIGHT_PX, dy: 0 });
    totalPanX += direction * STEP_RIGHT_PX;

    var firstVisible = !firstLabel.classList.contains('hidden');
    var secondVisible = !secondLabel.classList.contains('hidden');

    if (firstVisible) {
      firstSeenVisible = true;
    }

    if (!secondAppeared && secondVisible) {
      secondAppeared = true;
    }

    if (!secondAppeared) {
      continue;
    }

    expect(firstVisible, 'first overlay should remain visible while second overlay is visible').to.be.true;
    comparedSteps++;

    if (comparedSteps >= EDGE_BOUNCE_STEPS) {
      break;
    }
  }

  canvas.scroll({ dx: -totalPanX, dy: 0 });

  expect(firstSeenVisible, 'first overlay should become visible').to.be.true;
  expect(secondAppeared, 'second overlay should appear').to.be.true;
  expect(comparedSteps, 'should compare at least one step after second appears').to.be.greaterThan(0);
}
