var defaultPosition = { x: 100, y: 50 };

export default function SubprocessCentering(eventBus, canvas) {
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
    var storedViewbox = positionMap[planeId];

    if (!storedViewbox) {
      if (!event.plane.rootElement.isImplicit) {
        storedViewbox = {
          x: 0,
          y: 0,
          zoom: 1
        };
      }
      else {
        var currentBoundingBox = canvas.getActiveLayer().getBBox();
        storedViewbox = {
          x: currentBoundingBox.x - defaultPosition.x,
          y: currentBoundingBox.y - defaultPosition.y,
          zoom: 1
        };
      }
    }

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

SubprocessCentering.$inject = [ 'eventBus', 'canvas' ];
