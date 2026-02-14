export default function StickyLaneLabels(eventBus, overlays, elementRegistry) {
  if (!eventBus || !overlays || !elementRegistry) {
    console.warn('[StickyLaneLabels] Required services missing, skipping initialization.');
    return;
  }

  function addOverlays() {
    try {
      const pools = elementRegistry.filter((e) => e.type === 'bpmn:Participant');

      // Remove previous labels (only ours)
      overlays.remove({ type: 'sticky-lane-label' });

      pools.forEach((pool) => {
        const name = pool.businessObject.name || '';
        if (!name) return;

        overlays.add(pool.id, 'sticky-lane-label', {
          position: { left: pool.width / 2, top: -22 },
          html: `<div class="sticky-lane-label hidden">${name}</div>`
        });
      });
    } catch (err) {
      console.error('[StickyLaneLabels] Failed to update lane overlays', err);
    }
  }

  eventBus.on('canvas.viewbox.changed', () => {
    const stickyLabels = document.querySelectorAll('.djs-overlay-sticky-lane-label');

    stickyLabels.forEach((overlayElement) => {
      const overlayParent = overlayElement.closest('[data-container-id]');
      const containerId = overlayParent?.dataset.containerId;
      const child = overlayElement.querySelector('.sticky-lane-label');

      if (!containerId || !child) return;

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
        const laneLeftOnScreen = poolWidth + xOffset;

        if (laneLeftOnScreen > 0) {
          overlayElement.style.transform = `translate(${(-1 * xOffset)}px)`;
          return;
        }
      }

      child.classList.add('hidden');
    });
  });

  eventBus.on('import.done', addOverlays);
  eventBus.on('commandStack.changed', addOverlays);

  // after label edit
  eventBus.on('element.changed', (e) => {
    if (e.element.type === 'bpmn:Lane') {
      addOverlays();
    }
  });
}

StickyLaneLabels.$inject = [ 'eventBus', 'overlays', 'elementRegistry' ];