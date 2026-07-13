import {
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
var END_COORDINATE_TOLERANCE = 0;
var ZOOM_CHANGE_EPSILON = 0.0001;
var ZOOM_HYSTERESIS_PX = 6;
var PALETTE_GAP_PX = 4;
var ENABLE_OVERLAY_LOGS = false;

function logOverlay(event, payload) {
  if (!ENABLE_OVERLAY_LOGS) {
    return;
  }

  console.debug(`[StickyLaneLabels] ${event}`, payload);
}

function getLaneNestingOffset(element) {
  if (!element || element.type !== 'bpmn:Lane') {
    return 0;
  }

  let depth = 1;
  let parent = element.parent;

  while (parent && parent.type === 'bpmn:Lane') {
    depth++;
    parent = parent.parent;
  }

  return depth * INTERNAL_LANE_OFFSET;
}

export default function StickyLaneLabels(eventBus, overlays, elementRegistry, textRenderer, canvas) {
  if (!eventBus || !overlays || !elementRegistry || !textRenderer || !canvas) {
    console.warn('[StickyLaneLabels] Required services missing, skipping initialization.');
    return;
  }

  const overlayStateByContainer = new Map();
  let previousViewportScale = null;

  function addOverlays() {
    try {
      const pools = elementRegistry.filter((e) => e.type === 'bpmn:Participant' || e.type === 'bpmn:Lane');

      // Remove previous labels (only ours)
      overlays.remove({ type: 'sticky-lane-label' });
      overlayStateByContainer.clear();

      pools.forEach((pool) => {
        const name = pool.businessObject.name || '';
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
          transform(textElement, 0, labelLength, 270);
        }

        svgAppend(textSvg, textElement);
        overlayElement.appendChild(textSvg);
        overlays.add(pool.id, 'sticky-lane-label', {
          position: { left: laneNestingOffset + 70, top: 0 },
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
    stickyLabels.forEach((overlayElement) => {
      const overlayParent = overlayElement.closest('[data-container-id]');
      const containerId = overlayParent?.dataset.containerId;
      const child = overlayElement.querySelector('.sticky-lane-label');
      const childText = overlayElement.querySelector('.sticky-lane-label-text');

      if (!containerId || !child || !childText) return;
      const pool = elementRegistry.get(containerId);
      if (!pool) return;

      const horizontalPool = isHorizontal(pool);
      const labelWidth = horizontalPool ? LANE_LABEL_SIZE : pool.width;
      const labelHeight = horizontalPool ? pool.height : LANE_LABEL_SIZE;

      child.style.width = `${labelWidth}px`;
      child.style.height = `${labelHeight}px`;
      childText.style.width = `${labelWidth}px`;
      childText.style.height = `${labelHeight}px`;

      // the pool
      const target = canvasContainer.querySelector(`[data-element-id="${containerId}"]`);
      if (!target) return;

      const poolTargetTransformMatrix = new DOMMatrix(window.getComputedStyle(target).transform);

      // the viewport
      const viewport = canvasContainer.querySelector('.viewport');
      if (!viewport) return;

      const viewPortTransformMatrix = new DOMMatrix(window.getComputedStyle(viewport).transform);
      const viewportScale = viewPortTransformMatrix.m11 || 1;
      const zoomChanged = previousViewportScale !== null &&
        Math.abs(viewportScale - previousViewportScale) > ZOOM_CHANGE_EPSILON;
      const xOffset = viewPortTransformMatrix.m41 + poolTargetTransformMatrix.m41;
      const participantBounds = target.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      const participantInViewport = participantBounds.right >= viewportBounds.left &&
        participantBounds.left <= viewportBounds.right;
      const poolWidth = participantBounds.width;
      const laneEndCoordinate = participantBounds.right;
      const previousState = overlayStateByContainer.get(containerId);
      const previousVisible = previousState ? previousState.visible : false;
      const showXThreshold = -ZOOM_HYSTERESIS_PX;
      const hideXThreshold = ZOOM_HYSTERESIS_PX;

      let shouldShow = participantInViewport &&
        xOffset <= showXThreshold &&
        laneEndCoordinate >= END_COORDINATE_TOLERANCE;

      if (previousState && previousVisible) {
        shouldShow = participantInViewport &&
          xOffset <= hideXThreshold &&
          laneEndCoordinate >= END_COORDINATE_TOLERANCE;
      }

      let translateX = 0;
      let rightClamped = false;

      if (shouldShow) {
        child.classList.remove('hidden');
        translateX = Math.max(0, -1 * xOffset);
        overlayElement.style.transform = `translate(${translateX}px)`;

        const overlayBounds = overlayElement.getBoundingClientRect();
        const palette = canvasContainer.querySelector('.djs-palette');
        const paletteBounds = palette && palette.getBoundingClientRect();
        const overlapsPaletteHeight = paletteBounds &&
          overlayBounds.bottom >= paletteBounds.top &&
          overlayBounds.top <= paletteBounds.bottom;
        const minOverlayLeft = paletteBounds && paletteBounds.right + PALETTE_GAP_PX;
        const paletteOverlapLeft = overlapsPaletteHeight && minOverlayLeft - overlayBounds.left;

        if (paletteOverlapLeft > 0) {
          translateX = Math.max(0, translateX + paletteOverlapLeft);
          overlayElement.style.transform = `translate(${translateX}px)`;
        }

        const clampedOverlayBounds = overlayElement.getBoundingClientRect();
        const overflowRight = clampedOverlayBounds.right - participantBounds.right;

        if (overflowRight > 0) {
          translateX = Math.max(0, translateX - overflowRight);
          overlayElement.style.transform = `translate(${translateX}px)`;
          rightClamped = true;
        }

        if (previousState &&
          previousState.visible &&
          viewportScale > 1 &&
          translateX < previousState.translateX &&
          xOffset < previousState.xOffset) {
          translateX = previousState.translateX;
          overlayElement.style.transform = `translate(${translateX}px)`;
          rightClamped = previousState.rightClamped;
        }
      } else {
        child.classList.add('hidden');
        overlayElement.style.transform = '';
      }

      const nextState = {
        visible: shouldShow,
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

    const viewport = canvasContainer.querySelector('.viewport');
    if (!viewport) return;

    const viewPortTransformMatrix = new DOMMatrix(window.getComputedStyle(viewport).transform);
    previousViewportScale = viewPortTransformMatrix.m11 || 1;
  }

  eventBus.on('canvas.viewbox.changed', updateStickyLabels);

  eventBus.on('import.done', addOverlays);
  eventBus.on('commandStack.changed', addOverlays);

  // after label edit
  eventBus.on('element.changed', (e) => {
    if (e.element.type === 'bpmn:Lane' || e.element.type === 'bpmn:Participant') {
      addOverlays();
    }
  });
}

StickyLaneLabels.$inject = [ 'eventBus', 'overlays', 'elementRegistry', 'textRenderer', 'canvas' ];