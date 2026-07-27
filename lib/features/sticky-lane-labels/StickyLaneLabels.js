import {
  isExpanded,
  isHorizontal
} from '../../util/DiUtil';

import {
  append as svgAppend,
  create as svgCreate
} from 'tiny-svg';

import {
  transform
} from 'diagram-js/lib/util/SvgTransformUtil';

const LANE_LABEL_SIZE = 30;
const INTERNAL_LANE_OFFSET = 30;
const ZOOM_CHANGE_EPSILON = 0.0001;
const ZOOM_HYSTERESIS_PX = 6;
const PALETTE_GAP_PX = 4;
const PALETTE_OFFSET = 54;
const ROTATION_ANGLE = 270;


/**
 * Calculates the nesting offset for a lane based on its depth in the lane hierarchy.
 *
 * @param element
 *
 * @returns {number}
 */
function getLaneNestingOffset(element) {
  if (!element || element.type !== 'bpmn:Lane') {
    return 0;
  }

  let depth = 1;
  let parent = element.parent;

  while (parent) {
    if (parent.type === 'bpmn:Lane') {
      depth++;
    }

    parent = parent.parent;
  }

  return depth * INTERNAL_LANE_OFFSET;
}

function getOverlayGroupId(element) {
  if (!element) {
    return null;
  }

  let groupId = element.id;
  let parent = element.parent;

  while (parent) {
    if (parent.type === 'bpmn:Lane' || parent.type === 'bpmn:Participant') {
      groupId = parent.id;
    }

    parent = parent.parent;
  }

  return groupId;
}

function changeDimension(element, height, width) {
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
}

function shouldKeepRightClamped(previousState, viewportScale, translateX, xOffset) {
  return previousState &&
    previousState.visible &&
    previousState.rightClamped &&
    viewportScale > 1 &&
    translateX < previousState.translateX &&
    xOffset <= previousState.xOffset;
}

/**
 * Determines whether a sticky lane label should be visible based on
 * scroll position, zoom level, and previous visibility state.
 */
function determineLabelVisibility({ xOffset, poolWidth, containerWidth, laneEndCoordinate,
  collapsedParticipant, viewportScale, previousState }) {

  const participantSpansViewport = poolWidth > containerWidth;
  const participantRightVisible = laneEndCoordinate > 0;
  const previousVisible = previousState ? previousState.visible : false;

  if (collapsedParticipant && viewportScale < 1) {
    return { shouldShow: false, hiddenDueToRightEdge: false };
  }

  if (previousState && previousVisible) {
    const shouldShow = (xOffset <= ZOOM_HYSTERESIS_PX || participantSpansViewport) &&
      participantRightVisible;
    return { shouldShow, hiddenDueToRightEdge: !shouldShow && !participantRightVisible };
  }

  if (previousState && !previousVisible && previousState.hiddenDueToRightEdge && !participantRightVisible) {
    return { shouldShow: false, hiddenDueToRightEdge: true };
  }

  return {
    shouldShow: xOffset <= -ZOOM_HYSTERESIS_PX || participantSpansViewport,
    hiddenDueToRightEdge: false
  };
}

function setOverlayTransform(element, translateX) {
  element.style.transform = translateX ? `translate(${translateX}px)` : '';
}

function getPaletteOverlapLeft(canvasContainer, overlayElement) {
  const palette = canvasContainer.querySelector('.djs-palette');
  const paletteBounds = palette && palette.getBoundingClientRect();

  if (!paletteBounds) {
    return 0;
  }

  const overlayBounds = overlayElement.getBoundingClientRect();
  const overlapsPaletteHeight = overlayBounds.bottom >= paletteBounds.top &&
    overlayBounds.top <= paletteBounds.bottom;

  if (!overlapsPaletteHeight) {
    return 0;
  }

  const minOverlayLeft = paletteBounds.right + PALETTE_GAP_PX;

  return Math.max(0, minOverlayLeft - overlayBounds.left);
}

function applyPaletteCorrection(canvasContainer, element, labelElement, translateX, viewportScale, rightBoundary) {
  const overlap = getPaletteOverlapLeft(canvasContainer, element);
  if (overlap <= 0) return translateX;

  const candidate = translateX + overlap / viewportScale;
  setOverlayTransform(element, candidate);

  if (!rightBoundary) return candidate;

  const overflowRight = labelElement.getBoundingClientRect().right - rightBoundary;
  if (overflowRight <= 0) return candidate;

  setOverlayTransform(element, translateX);
  return translateX;
}

/**
 * Zoom-out case (viewportScale < 1):
 * Two-phase layout to keep hierarchy labels ordered and within the participant's right edge.
 *
 * Phase 1 (left-to-right): place each label immediately right of its predecessor
 *   when their natural positions overlap.
 * Phase 2 (right-to-left compaction): when the rightmost computed position overflows
 *   participantRight, re-anchor from the right edge and stack backwards so all labels
 *   fit within the visible portion of the participant.
 *
 * All entries share the same participant right edge, so participantRight is read from
 * the first entry.
 */
function resolveGroupOverlapZoomOut(sortedEntries) {
  if (sortedEntries.length <= 1) return;

  const labels = sortedEntries.map((entry) => {
    const rect = entry.overlayLabelElement.getBoundingClientRect();
    return {
      entry,
      naturalLeft: rect.left,
      width: rect.width,
      top: rect.top,
      bottom: rect.bottom
    };
  });

  // Two labels overlap vertically if their Y ranges intersect (with 1px tolerance).
  // Sibling lanes at the same nesting level but different Y positions are independent
  // and must NOT be stacked horizontally.
  function overlapsVertically(a, b) {
    return a.top < b.bottom - 1 && b.top < a.bottom - 1;
  }

  // left-to-right — each label starts at max(naturalLeft, prevRight)
  // but only relative to the last preceding label that vertically overlaps.
  const targetLeft = new Array(labels.length);
  targetLeft[0] = labels[0].naturalLeft;
  for (let i = 1; i < labels.length; i++) {
    let maxRight = labels[i].naturalLeft;
    for (let j = i - 1; j >= 0; j--) {
      if (overlapsVertically(labels[i], labels[j])) {
        maxRight = Math.max(maxRight, targetLeft[j] + labels[j].width);
        break;
      }
    }
    targetLeft[i] = maxRight;
  }

  const firstEntry = sortedEntries[0];
  const participantRightOnScreen = firstEntry.poolWidth + firstEntry.xOffset > 0;

  if (participantRightOnScreen) {
    const participantRight = firstEntry.participantRight;
    const rightMostRight = targetLeft[labels.length - 1] + labels[labels.length - 1].width;

    if (rightMostRight > participantRight) {

      // Compact right-to-left: clamp any overflow, then push predecessors left
      for (let i = labels.length - 1; i >= 0; i--) {
        const labelRight = targetLeft[i] + labels[i].width;
        if (labelRight > participantRight) {
          targetLeft[i] = participantRight - labels[i].width;
        }

        // Push predecessors that vertically overlap further left if needed
        for (let j = i - 1; j >= 0; j--) {
          if (overlapsVertically(labels[i], labels[j])) {
            const maxRight = targetLeft[i];
            if (targetLeft[j] + labels[j].width > maxRight) {
              targetLeft[j] = maxRight - labels[j].width;
            }
            break;
          }
        }
      }
    }
  }

  // apply computed positions — shift each overlay by the delta in screen pixels
  for (let i = 0; i < labels.length; i++) {
    const { entry, naturalLeft } = labels[i];
    const shift = targetLeft[i] - naturalLeft;
    if (shift !== 0) {
      entry.translateX = entry.translateX + shift / entry.viewportScale;
      setOverlayTransform(entry.overlayElement, entry.translateX);
    }
  }
}

/**
 * Zoom-in case (viewportScale >= 1):
 * Detect and correct any remaining overlap after individual positioning.
 * Uses a 1 px tolerance to avoid hiding due to sub-pixel rounding.
 */
function resolveGroupOverlapZoomIn(sortedEntries, canvasContainer) {
  let previousVisibleEntry;

  sortedEntries.forEach((entry) => {
    if (!previousVisibleEntry) {
      previousVisibleEntry = entry;
      return;
    }

    const previousOverlayBounds = previousVisibleEntry.overlayElement.getBoundingClientRect();
    const currentOverlayBounds = entry.overlayElement.getBoundingClientRect();
    const overlap = previousOverlayBounds.right - currentOverlayBounds.left;

    if (overlap <= 0) {
      previousVisibleEntry = entry;
      return;
    }

    entry.translateX = entry.translateX + overlap / entry.viewportScale;
    setOverlayTransform(entry.overlayElement, entry.translateX);

    const adjustedLabelBounds = entry.overlayLabelElement.getBoundingClientRect();
    const overflowRight = adjustedLabelBounds.right - entry.participantRight;

    if (overflowRight > 0) {
      entry.translateX = entry.translateX - overflowRight / entry.viewportScale;
      setOverlayTransform(entry.overlayElement, entry.translateX);
      entry.rightClamped = true;
    }

    entry.translateX = applyPaletteCorrection(
      canvasContainer, entry.overlayElement, entry.overlayLabelElement,
      entry.translateX, entry.viewportScale, entry.participantRight
    );

    const adjustedOverlayBounds = entry.overlayElement.getBoundingClientRect();

    if (adjustedOverlayBounds.left < previousOverlayBounds.right - 1) {
      entry.shouldShow = false;
      entry.hiddenDueToRightEdge = true;
      entry.translateX = 0;
      entry.rightClamped = false;
      entry.overlayLabelElement.classList.add('hidden');
      setOverlayTransform(entry.overlayElement, 0);
      return;
    }

    previousVisibleEntry = entry;
  });
}


/**
 * Zoom-in case (viewportScale >= 1):
 * Keep vertically-overlapping hierarchy labels contiguous (no overlap and no visible gap).
 */
function resolveGroupContiguityZoomIn(sortedEntries, canvasContainer) {
  if (sortedEntries.length <= 1) {
    return;
  }

  function overlapsVertically(entryA, entryB) {
    const boundsA = entryA.overlayLabelElement.getBoundingClientRect();
    const boundsB = entryB.overlayLabelElement.getBoundingClientRect();

    return boundsA.top < boundsB.bottom - 1 && boundsB.top < boundsA.bottom - 1;
  }

  for (let i = 1; i < sortedEntries.length; i++) {
    const currentEntry = sortedEntries[i];
    let previousEntry = null;

    for (let j = i - 1; j >= 0; j--) {
      if (overlapsVertically(currentEntry, sortedEntries[j])) {
        previousEntry = sortedEntries[j];
        break;
      }
    }

    if (!previousEntry) {
      continue;
    }

    const previousLabelBounds = previousEntry.overlayLabelElement.getBoundingClientRect();
    const currentLabelBounds = currentEntry.overlayLabelElement.getBoundingClientRect();
    const gap = currentLabelBounds.left - previousLabelBounds.right;

    if (gap >= -1 && gap <= 1) {
      continue;
    }

    currentEntry.translateX = currentEntry.translateX - gap / currentEntry.viewportScale;
    setOverlayTransform(currentEntry.overlayElement, currentEntry.translateX);

    const adjustedLabelBounds = currentEntry.overlayLabelElement.getBoundingClientRect();
    const overflowRight = adjustedLabelBounds.right - currentEntry.participantRight;

    if (overflowRight > 0) {
      currentEntry.translateX = currentEntry.translateX - overflowRight / currentEntry.viewportScale;
      setOverlayTransform(currentEntry.overlayElement, currentEntry.translateX);
      currentEntry.rightClamped = true;
    }

    currentEntry.translateX = applyPaletteCorrection(
      canvasContainer,
      currentEntry.overlayElement,
      currentEntry.overlayLabelElement,
      currentEntry.translateX,
      currentEntry.viewportScale,
      currentEntry.participantRight
    );
  }
}


function getViewportScale(canvasContainer) {
  const viewport = canvasContainer.querySelector('.viewport');
  if (!viewport) return 1;

  const matrix = new DOMMatrix(window.getComputedStyle(viewport).transform);
  return matrix.m11 || 1;
}

function collectOverlayEntry(overlayElement, canvasContainer, pool, elementRegistry, previousViewportScale, overlayStateByContainer) {
  const overlayParent = overlayElement.closest('[data-container-id]');
  const containerId = overlayParent?.dataset.containerId;
  const child = overlayElement.querySelector('.sticky-lane-label');
  const childText = overlayElement.querySelector('.sticky-lane-label-text');

  if (!containerId || !child || !childText) return null;
  const poolElement = elementRegistry.get(containerId);
  if (!poolElement) return null;

  const horizontalPool = isHorizontal(poolElement);
  const collapsedParticipant = poolElement.type === 'bpmn:Participant' && !isExpanded(poolElement);
  const labelWidth = horizontalPool ? LANE_LABEL_SIZE : poolElement.width;
  const labelHeight = horizontalPool ? poolElement.height : LANE_LABEL_SIZE;

  changeDimension(child, labelHeight, labelWidth);
  changeDimension(childText, labelHeight, labelWidth);

  const target = canvasContainer.querySelector(`[data-element-id="${containerId}"]`);
  if (!target) return null;

  const viewportScale = getViewportScale(canvasContainer);

  const zoomChanged = previousViewportScale !== null &&
    Math.abs(viewportScale - previousViewportScale) > ZOOM_CHANGE_EPSILON;
  const containerBounds = canvasContainer.getBoundingClientRect();
  const participantBounds = target.getBoundingClientRect();
  const xOffset = participantBounds.left - containerBounds.left;
  const poolWidth = participantBounds.width;
  const laneEndCoordinate = participantBounds.right - containerBounds.left;
  const previousState = overlayStateByContainer.get(containerId);

  const laneNestingOffset = getLaneNestingOffset(poolElement);
  const overlayWrapper = overlayElement.parentNode;

  if (overlayWrapper) {
    overlayWrapper.style.left = `${laneNestingOffset + PALETTE_OFFSET}px`;
  }

  return {
    containerId,
    overlayElement,
    child,
    poolElement,
    collapsedParticipant,
    containerBounds,
    participantBounds,
    viewportScale,
    zoomChanged,
    previousState,
    xOffset,
    poolWidth,
    laneEndCoordinate,
    laneNestingOffset
  };
}

function calculateInitialPosition(entry, canvasContainer) {
  const { child, containerBounds, participantBounds, overlayElement, viewportScale, previousState } = entry;

  const { shouldShow, hiddenDueToRightEdge } = determineLabelVisibility({
    xOffset: entry.xOffset,
    poolWidth: entry.poolWidth,
    containerWidth: containerBounds.width,
    laneEndCoordinate: entry.laneEndCoordinate,
    collapsedParticipant: entry.collapsedParticipant,
    viewportScale,
    previousState
  });

  let translateX = 0;
  let rightClamped = false;

  if (shouldShow) {
    child.classList.remove('hidden');
    translateX = Math.max(0, -entry.xOffset / viewportScale);
    setOverlayTransform(overlayElement, translateX);

    translateX = applyPaletteCorrection(canvasContainer, overlayElement, child, translateX, viewportScale, null);

    const childBounds = child.getBoundingClientRect();
    const overflowRight = childBounds.right - participantBounds.right;

    if (overflowRight > 0) {
      translateX = translateX - overflowRight / viewportScale;
      setOverlayTransform(overlayElement, translateX);
      rightClamped = true;
    }

    if (shouldKeepRightClamped(previousState, viewportScale, translateX, entry.xOffset)) {
      translateX = previousState.translateX;
      setOverlayTransform(overlayElement, translateX);
      rightClamped = previousState.rightClamped;
    } else {

      // If not keeping right clamped, ensure label is at least visible at participant left edge
      const childBoundsAfterAdjust = child.getBoundingClientRect();
      const overflowLeft = participantBounds.left - childBoundsAfterAdjust.left;

      if (overflowLeft > 0) {
        translateX = translateX + overflowLeft / viewportScale;
        setOverlayTransform(overlayElement, translateX);
        rightClamped = false;
      }
    }

    translateX = applyPaletteCorrection(canvasContainer, overlayElement, child, translateX, viewportScale, participantBounds.right);
  } else {
    child.classList.add('hidden');
    setOverlayTransform(overlayElement, 0);
  }

  return {
    shouldShow,
    hiddenDueToRightEdge,
    translateX,
    rightClamped
  };
}

function groupEntriesByContainer(overlayEntries) {
  const overlayEntriesByGroup = new Map();

  overlayEntries.forEach((entry) => {
    const groupId = entry.groupId;
    if (!overlayEntriesByGroup.has(groupId)) {
      overlayEntriesByGroup.set(groupId, []);
    }
    overlayEntriesByGroup.get(groupId).push(entry);
  });

  return overlayEntriesByGroup;
}

function resolveGroupLayout(groupEntries, canvasContainer) {
  const sortedEntries = groupEntries
    .filter((entry) => entry.shouldShow)
    .sort((a, b) => a.laneNestingOffset - b.laneNestingOffset);

  if (sortedEntries.length === 0) return;

  const isZoomOut = sortedEntries[0].viewportScale < 1;

  if (isZoomOut) {
    resolveGroupOverlapZoomOut(sortedEntries, canvasContainer);
  } else {
    resolveGroupOverlapZoomIn(sortedEntries, canvasContainer);
    resolveGroupContiguityZoomIn(sortedEntries, canvasContainer);
  }
}

function persistOverlayState(overlayEntries, overlayStateByContainer) {
  overlayEntries.forEach((entry) => {
    const {
      containerId,
      shouldShow,
      hiddenDueToRightEdge,
      xOffset,
      poolWidth,
      laneEndCoordinate,
      translateX,
      rightClamped,
      viewportScale,
    } = entry;

    const nextState = {
      visible: shouldShow,
      hiddenDueToRightEdge: hiddenDueToRightEdge,
      xOffset: xOffset,
      poolWidth: poolWidth,
      laneEndCoordinate: laneEndCoordinate,
      translateX: translateX,
      rightClamped: rightClamped,
      viewportScale: viewportScale
    };
    overlayStateByContainer.set(containerId, nextState);
  });
}

export default function StickyLaneLabels(eventBus, overlays, elementRegistry, textRenderer, canvas) {
  if (!eventBus || !overlays || !elementRegistry || !textRenderer || !canvas) {
    console.warn('[StickyLaneLabels] Required services missing, skipping initialization.');
    return;
  }

  const overlayStateByContainer = new Map();
  let previousViewportScale = null;

  /**
   * Adds overlays for all lanes and participants in the diagram and removes existing overlays.
   * This function is called on diagram import and command stack changes.
   */
  function addOverlays() {
    try {
      const pools = elementRegistry.filter((e) => e.type === 'bpmn:Participant' || e.type === 'bpmn:Lane');

      overlays.remove({ type: 'sticky-lane-label' });
      overlayStateByContainer.clear();

      pools.forEach((pool) => {
        const name = pool.businessObject.name || '';

        // if the no lane or pool name is set, don't show overlays for them
        if (!name) {
          return;
        }

        const laneNestingOffset = getLaneNestingOffset(pool);
        const horizontalPool = isHorizontal(pool);
        const labelLength = horizontalPool ? pool.height : pool.width;

        const overlayElement = document.createElement('div');
        overlayElement.className = 'sticky-lane-label hidden';

        const textSvg = svgCreate('svg');
        textSvg.classList.add('sticky-lane-label-text');

        const textElement = textRenderer.createText(name, {
          box: {
            height: LANE_LABEL_SIZE,
            width: labelLength
          },
          align: 'center-middle'
        });

        if (horizontalPool) {
          transform(textElement, 0, labelLength, ROTATION_ANGLE);
        }

        svgAppend(textSvg, textElement);
        overlayElement.appendChild(textSvg);

        // + 70 because of the dji-palette width and the gap between the palette and the overlay
        overlays.add(pool.id, 'sticky-lane-label', {
          position: { left: laneNestingOffset + PALETTE_OFFSET, top: 0 },
          html: overlayElement
        });
      });

      updateStickyLabels();
    } catch (err) {
      console.error('[StickyLaneLabels] Failed to update lane overlays', err);
    }
  }

  function updateStickyLabels() {
    const canvasContainer = canvas.getContainer();
    const stickyLabels = canvasContainer.querySelectorAll('.djs-overlay-sticky-lane-label');

    const overlayEntries = [];

    stickyLabels.forEach((overlayElement) => {
      const entryData = collectOverlayEntry(
        overlayElement,
        canvasContainer,
        null,
        elementRegistry,
        previousViewportScale,
        overlayStateByContainer
      );

      if (!entryData) return;

      const positionData = calculateInitialPosition(entryData, canvasContainer);

      const groupId = getOverlayGroupId(entryData.poolElement) || entryData.containerId;
      const entry = {
        containerId: entryData.containerId,
        groupId: groupId,
        overlayElement: entryData.overlayElement,
        overlayLabelElement: entryData.child,
        shouldShow: positionData.shouldShow,
        hiddenDueToRightEdge: positionData.hiddenDueToRightEdge,
        translateX: positionData.translateX,
        rightClamped: positionData.rightClamped,
        xOffset: entryData.xOffset,
        poolWidth: entryData.poolWidth,
        laneEndCoordinate: entryData.laneEndCoordinate,
        participantRight: entryData.participantBounds.right,
        laneNestingOffset: entryData.laneNestingOffset,
        viewportScale: entryData.viewportScale,
        zoomChanged: entryData.zoomChanged,
        previousState: entryData.previousState
      };

      overlayEntries.push(entry);
    });

    const overlayEntriesByGroup = groupEntriesByContainer(overlayEntries);

    overlayEntriesByGroup.forEach((groupEntries) => {
      resolveGroupLayout(groupEntries, canvasContainer);
    });

    persistOverlayState(overlayEntries, overlayStateByContainer);

    previousViewportScale = getViewportScale(canvasContainer);
  }

  eventBus.on('canvas.viewbox.changed', updateStickyLabels);

  eventBus.on('import.done', addOverlays);
  eventBus.on('commandStack.changed', addOverlays);

  // update label positions after element moves (priority > 500 ensures
  // overlay containers are already repositioned by diagram-js Overlay service)
  eventBus.on('element.changed', 750, (e) => {
    if (e.element.type === 'bpmn:Lane' || e.element.type === 'bpmn:Participant') {
      addOverlays();
    }
  });
}

StickyLaneLabels.$inject = [ 'eventBus', 'overlays', 'elementRegistry', 'textRenderer', 'canvas' ];