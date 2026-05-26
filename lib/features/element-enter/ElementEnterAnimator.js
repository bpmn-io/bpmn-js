/**
 * Adds a one-shot `bjs-just-added` class to the element's graphics on
 * `shape.added` / `connection.added`, then removes it after the entry
 * animation duration. Without this hook the CSS animation would also
 * fire on every re-render of an existing element (diagram-js re-mounts
 * .djs-visual on shape updates), which produced the "everything
 * animates after any change" feedback.
 */

var ENTER_DURATION_MS = 500;

export default function ElementEnterAnimator(eventBus, elementRegistry) {

  function flagAdded(element) {

    // skip labels — they re-mount frequently as their text changes
    if (!element || element.labelTarget) {
      return;
    }

    var gfx = elementRegistry.getGraphics(element);
    if (!gfx || !gfx.classList) {
      return;
    }

    gfx.classList.add('bjs-just-added');

    setTimeout(function() {
      gfx.classList.remove('bjs-just-added');
    }, ENTER_DURATION_MS);
  }

  eventBus.on([ 'shape.added', 'connection.added' ], function(event) {
    flagAdded(event.element);
  });
}

ElementEnterAnimator.$inject = [ 'eventBus', 'elementRegistry' ];
