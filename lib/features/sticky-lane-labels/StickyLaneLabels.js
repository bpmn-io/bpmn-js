export default function StickyLaneLabels(eventBus, overlays, elementRegistry) {
  if (!eventBus || !overlays || !elementRegistry) {
    console.warn('[StickyLaneLabels] Required services missing, skipping initialization.');
    return;
  }

  function addOverlays() {
    try {
      console.log(elementRegistry.getAll());
      const lanes = elementRegistry.filter(e => e.type === 'bpmn:Participant');

      // Remove previous labels (only ours)
      overlays.remove({ type: 'sticky-lane-label' });

      lanes.forEach(lane => {
        const name = lane.businessObject.name || '';
        if (!name) return;



        overlays.add(lane.id, 'sticky-lane-label', {
          position: { left: 10, top: lane.height / 2 },
          html: `<div class="sticky-lane-label hidden">${name}</div>`
        });
      });
    } catch (err) {
      console.error('[StickyLaneLabels] Failed to update lane overlays', err);
    }
  }

  eventBus.on('canvas.viewbox.changed', function (e) {
    const { x, y, scale } = e.viewbox;
    const stickyLabels = document.querySelectorAll('.djs-overlay-sticky-lane-label');
    stickyLabels.forEach(overlayElement => {
      const overlayParent = overlayElement.closest('[data-container-id]');
      const containerId = overlayParent?.dataset.containerId;
      const child = overlayElement.querySelector('.sticky-lane-label');

      // the pool
      const target = document.querySelector(`[data-element-id="${containerId}"]`);
      const poolTargetTransformMatrix = new DOMMatrix(window.getComputedStyle(target).transform);

      // the viewport
      const viewport = document.querySelector('.viewport');
      const viewPortTransformMatrix = new DOMMatrix(window.getComputedStyle(viewport).transform);



      if (viewPortTransformMatrix.m41 + poolTargetTransformMatrix.m41 <= 0) {
        child.classList.remove('hidden');
        //console.log(scale, x);
        const poolWidth = target.getBoundingClientRect().width;

        const pixelAlreadyLeftTheScreen = viewPortTransformMatrix.m41 + poolTargetTransformMatrix.m41;

        const laneLeftOnScreen = poolWidth + pixelAlreadyLeftTheScreen;


        if (laneLeftOnScreen > 0) {
          overlayElement.style.transform = `translate(${-1 * pixelAlreadyLeftTheScreen + 70 }px) `;
          return;
        }
        console.log(pixelAlreadyLeftTheScreen, laneLeftOnScreen);
        //overlayElement.style.transform = `translate(${-1 * pixelAlreadyLeftTheScreen + laneLeftOnScreen / 2 }px) `;


      }

        child.classList.add('hidden');

    });
  });

  eventBus.on('import.done', addOverlays);
  eventBus.on('commandStack.changed', addOverlays);
  // after label edit
  eventBus.on('element.changed', function (e) {
    if (e.element.type === 'bpmn:Lane') {
      addOverlays();
    }
  });
}

StickyLaneLabels.$inject = [ 'eventBus', 'overlays', 'elementRegistry' ];
