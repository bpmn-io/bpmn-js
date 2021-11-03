/**
 * Move collapsed subprocesses into view when drilling down. Zoom and scroll
 * are saved in a session.
 *
 * @param {eventBus} eventBus
 * @param {canvas} canvas
 */
export default function DrilldownCentering(eventBus, canvas) {
  var currentPlane = 'base';
  var positionMap = {};

  eventBus.on('plane.set', function(event) {
    var currentViewbox = canvas.viewbox();
    positionMap[currentPlane] = {
      x: currentViewbox.x,
      y: currentViewbox.y,
      zoom: currentViewbox.scale
    };

    var planeId = event.plane.name;
    var storedViewbox = positionMap[planeId] || { x: 0, y: 0, zoom: 1 };

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

    currentPlane = planeId;
  });
}

DrilldownCentering.$inject = [ 'eventBus', 'canvas' ];
