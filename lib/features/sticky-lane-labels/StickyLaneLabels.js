import {
  isHorizontal
} from '../../util/DiUtil';

var LANE_LABEL_SIZE = 30;
var INTERNAL_LANE_OFFSET = 30;

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

export default function StickyLaneLabels(eventBus, overlays, elementRegistry) {
  if (!eventBus || !overlays || !elementRegistry) {
    console.warn('[StickyLaneLabels] Required services missing, skipping initialization.');
    return;
  }

  function addOverlays() {
    try {
      const pools = elementRegistry.filter((e) => e.type === 'bpmn:Participant' || e.type === 'bpmn:Lane');

      // Remove previous labels (only ours)
      overlays.remove({ type: 'sticky-lane-label' });

      pools.forEach((pool) => {
        const name = pool.businessObject.name || '';
        if (!name) return;

        const laneNestingOffset = getLaneNestingOffset(pool);

        overlays.add(pool.id, 'sticky-lane-label', {
          position: { left: laneNestingOffset + 70, top: 0 },
          html: `<div class="sticky-lane-label hidden"><span class="sticky-lane-label-text">${name}</span></div>`
        });
      });

      updateStickyLabels();
    } catch (err) {
      console.error('[StickyLaneLabels] Failed to update lane overlays', err);
    }
  }

  function updateStickyLabels() {
    const stickyLabels = document.querySelectorAll('.djs-overlay-sticky-lane-label');
    stickyLabels.forEach((overlayElement) => {
      const overlayParent = overlayElement.closest('[data-container-id]');
      const containerId = overlayParent?.dataset.containerId;
      const child = overlayElement.querySelector('.sticky-lane-label');
      const childText = overlayElement.querySelector('.sticky-lane-label-text');

      if (!containerId || !child || !childText) return;
      const pool = elementRegistry.get(containerId);
      if (!pool) return;

      const horizontalPool = isHorizontal(pool);
      const laneNestingOffset = getLaneNestingOffset(pool);
      const labelWidth = horizontalPool ? LANE_LABEL_SIZE : pool.width;
      const labelHeight = horizontalPool ? pool.height : LANE_LABEL_SIZE;

      child.style.width = `${labelWidth}px`;
      child.style.height = `${labelHeight}px`;
      childText.style.transformOrigin = 'center';
      childText.style.transform = horizontalPool ? 'rotate(270deg)' : 'none';

      // the pool
      const target = document.querySelector(`[data-element-id="${containerId}"]`);
      if (!target) return;

      const poolTargetTransformMatrix = new DOMMatrix(window.getComputedStyle(target).transform);

      // the viewport
      const viewport = document.querySelector('.viewport');
      if (!viewport) return;

      const viewPortTransformMatrix = new DOMMatrix(window.getComputedStyle(viewport).transform);

      const xOffset = viewPortTransformMatrix.m41 + poolTargetTransformMatrix.m41;

      if (xOffset <= 0) {
        child.classList.remove('hidden');

        const poolWidth = target.getBoundingClientRect().width;

        // - 100 because it shouldn´t interfere with the djs-palette
        const laneLeftOnScreen = poolWidth + xOffset - 100 - laneNestingOffset;
        if (laneLeftOnScreen > 0) {
          overlayElement.style.transform = `translate(${(-1 * xOffset)}px)`;
          return;
        }
      }

      child.classList.add('hidden');
    });
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

StickyLaneLabels.$inject = [ 'eventBus', 'overlays', 'elementRegistry' ];