import { is } from '../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 */

/**
 * Move collapsed subprocesses into view when drilling down.
 *
 * Zoom and scroll are saved in a session.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function DrilldownCentering(eventBus, canvas) {

  var currentRoot = null;
  var positionMap = new Map();

  eventBus.on('root.set', function(event) {
    var newRoot = event.element;
    var currentViewbox = canvas.viewbox();
    var storedViewbox = positionMap.get(newRoot);

    positionMap.set(currentRoot, {
      x: currentViewbox.x,
      y: currentViewbox.y,
      zoom: currentViewbox.scale
    });

    currentRoot = newRoot;

    // current root was replaced with a collaboration, we don't update the viewbox
    if (is(newRoot, 'bpmn:Collaboration') && !storedViewbox) {
      return;
    }

    storedViewbox = storedViewbox || { x: 0, y: 0, zoom: 1 };

    var dx = (currentViewbox.x - storedViewbox.x) * currentViewbox.scale,
        dy = (currentViewbox.y - storedViewbox.y) * currentViewbox.scale;

    if (dx !== 0 || dy !== 0) {
      canvas.scroll({
        dx: dx,
        dy: dy
      });
    }

    if (storedViewbox.zoom !== currentViewbox.scale) {
      canvas.zoom(storedViewbox.zoom, { x: 0, y: 0 });
    }
  });

  eventBus.on('diagram.clear', function() {
    positionMap.clear();
    currentRoot = null;
  });

}

DrilldownCentering.$inject = [ 'eventBus', 'canvas' ];


/**
 * ES5 Map implementation. Works.
 */
function Map() {

  this._entries = [];

  this.set = function(key, value) {

    var found = false;

    for (var k in this._entries) {
      if (this._entries[k][0] === key) {
        this._entries[k][1] = value;

        found = true;

        break;
      }
    }

    if (!found) {
      this._entries.push([ key, value ]);
    }
  };

  this.get = function(key) {

    for (var k in this._entries) {
      if (this._entries[k][0] === key) {
        return this._entries[k][1];
      }
    }

    return null;
  };

  this.clear = function() {
    this._entries.length = 0;
  };

  this.remove = function(key) {

    var idx = -1;

    for (var k in this._entries) {
      if (this._entries[k][0] === key) {
        idx = k;

        break;
      }
    }

    if (idx !== -1) {
      this._entries.splice(idx, 1);
    }
  };
}