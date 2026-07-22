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

var LANE_LABEL_SIZE = 30;
var INTERNAL_LANE_OFFSET = 30;
var ZOOM_CHANGE_EPSILON = 0.0001;
var ZOOM_HYSTERESIS_PX = 6;
var PALETTE_GAP_PX = 4;
var ENABLE_OVERLAY_LOGS = false;
var PALETTE_OFFSET = 70;
var ROTATION_ANGLE = 270;

function logOverlay(event, payload) {
  if (!ENABLE_OVERLAY_LOGS) {
    return;
  }

  console.debug(`[StickyLaneLabels] ${event}`, payload);
}


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

  // Use overlayLabelElement (position:absolute inside wrapper) for real bounds.
  // The wrapper (.djs-overlay-sticky-lane-label) has width:0 because its child
  // uses position:absolute, making getBoundingClientRect() on the wrapper useless.
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

  // if the rightmost label overflows participantRight, compact from the right edge.
  // Only compact labels that vertically overlap (form a chain).
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

function getViewportScale(canvasContainer) {
  const viewport = canvasContainer.querySelector('.viewport');
  if (!viewport) return 1;

  const matrix = new DOMMatrix(window.getComputedStyle(viewport).transform);
  return matrix.m11 || 1;
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
          position: { left: laneNestingOffset + 54, top: 0 },
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

    const overlayEntriesByGroup = new Map();
    const overlayEntries = [];

    stickyLabels.forEach((overlayElement) => {
      const overlayParent = overlayElement.closest('[data-container-id]');
      const containerId = overlayParent?.dataset.containerId;
      const child = overlayElement.querySelector('.sticky-lane-label');
      const childText = overlayElement.querySelector('.sticky-lane-label-text');

      if (!containerId || !child || !childText) return;
      const pool = elementRegistry.get(containerId);
      if (!pool) return;

      const horizontalPool = isHorizontal(pool);
      const collapsedParticipant = pool.type === 'bpmn:Participant' && !isExpanded(pool);
      const labelWidth = horizontalPool ? LANE_LABEL_SIZE : pool.width;
      const labelHeight = horizontalPool ? pool.height : LANE_LABEL_SIZE;

      changeDimension(child, labelHeight, labelWidth);
      changeDimension(childText, labelHeight, labelWidth);

      // the pool
      const target = canvasContainer.querySelector(`[data-element-id="${containerId}"]`);
      if (!target) return;

      const viewportScale = getViewportScale(canvasContainer);

      const zoomChanged = previousViewportScale !== null &&
        Math.abs(viewportScale - previousViewportScale) > ZOOM_CHANGE_EPSILON;
      const containerBounds = canvasContainer.getBoundingClientRect();
      const participantBounds = target.getBoundingClientRect();
      const xOffset = participantBounds.left - containerBounds.left;
      const poolWidth = participantBounds.width;
      const laneEndCoordinate = participantBounds.right - containerBounds.left;
      const previousState = overlayStateByContainer.get(containerId);

      const laneNestingOffset = getLaneNestingOffset(pool);
      const overlayWrapper = overlayElement.parentNode;

      if (overlayWrapper) {
        overlayWrapper.style.left = `${laneNestingOffset + 70}px`;
      }

      const { shouldShow, hiddenDueToRightEdge } = determineLabelVisibility({
        xOffset,
        poolWidth,
        containerWidth: containerBounds.width,
        laneEndCoordinate,
        collapsedParticipant,
        viewportScale,
        previousState
      });

      let translateX = 0;
      let rightClamped = false;

      if (shouldShow) {
        child.classList.remove('hidden');
        translateX = Math.max(0, -xOffset / viewportScale);
        setOverlayTransform(overlayElement, translateX);

        translateX = applyPaletteCorrection(canvasContainer, overlayElement, child, translateX, viewportScale, null);

        const childBounds = child.getBoundingClientRect();
        const overflowRight = childBounds.right - participantBounds.right;

        if (overflowRight > 0) {
          translateX = translateX - overflowRight / viewportScale;
          setOverlayTransform(overlayElement, translateX);
          rightClamped = true;
        }

        if (shouldKeepRightClamped(previousState, viewportScale, translateX, xOffset)) {
          translateX = previousState.translateX;
          setOverlayTransform(overlayElement, translateX);
          rightClamped = previousState.rightClamped;
        }

        translateX = applyPaletteCorrection(canvasContainer, overlayElement, child, translateX, viewportScale, participantBounds.right);
      } else {
        child.classList.add('hidden');
        setOverlayTransform(overlayElement, 0);
      }

      const groupId = getOverlayGroupId(pool) || containerId;
      const entry = {
        containerId: containerId,
        groupId: groupId,
        overlayElement: overlayElement,
        overlayLabelElement: child,
        shouldShow: shouldShow,
        hiddenDueToRightEdge: hiddenDueToRightEdge,
        translateX: translateX,
        rightClamped: rightClamped,
        xOffset: xOffset,
        poolWidth: poolWidth,
        laneEndCoordinate: laneEndCoordinate,
        participantRight: participantBounds.right,
        laneNestingOffset: laneNestingOffset,
        viewportScale: viewportScale,
        zoomChanged: zoomChanged,
        previousState: previousState
      };

      overlayEntries.push(entry);

      if (!overlayEntriesByGroup.has(groupId)) {
        overlayEntriesByGroup.set(groupId, []);
      }

      overlayEntriesByGroup.get(groupId).push(entry);
    });

    overlayEntriesByGroup.forEach((groupEntries) => {
      const sortedEntries = groupEntries
        .filter((entry) => entry.shouldShow)
        .sort((a, b) => a.laneNestingOffset - b.laneNestingOffset);

      if (sortedEntries.length === 0) return;

      const isZoomOut = sortedEntries[0].viewportScale < 1;

      if (isZoomOut) {
        resolveGroupOverlapZoomOut(sortedEntries, canvasContainer);
      } else {
        resolveGroupOverlapZoomIn(sortedEntries, canvasContainer);
      }
    });

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
        zoomChanged,
        previousState
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

      const visibilityChanged = !previousState || previousState.visible !== nextState.visible;

      if (visibilityChanged) {
        logOverlay(nextState.visible ? 'overlay.show' : 'overlay.hide', {
          id: containerId,
          xOffset: xOffset,
          poolWidth: poolWidth,
          laneEndCoordinate: laneEndCoordinate,
          translateX: translateX,
          viewportScale: viewportScale,
          zoomChanged: zoomChanged,
          previousVisible: previousState ? previousState.visible : null
        });
      }

      overlayStateByContainer.set(containerId, nextState);
    });

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