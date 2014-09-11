'use strict';

var LayoutUtil = require('../../layout/Util');


function Connect(modeling, eventBus, elementRegistry, selection, canvas, layout) {

  // TODO(nre): separate UI and events

  var context = null;


  ////// layouting //////////////////////////

  function crop(start, end, source, target) {

    var sourcePath = LayoutUtil.getShapePath(elementRegistry.getGraphicsByElement(source)),
        targetPath = target && LayoutUtil.getShapePath(elementRegistry.getGraphicsByElement(target)),
        connectionPath = LayoutUtil.getConnectionPath([ start, end ]);

    start = LayoutUtil.getElementLineIntersection(sourcePath, connectionPath, true) || start;
    end = (target && LayoutUtil.getElementLineIntersection(targetPath, connectionPath, false)) || end;

    return [ start, end ];
  }


  ////// listeners //////////////////////////

  function registerListeners() {
    document.addEventListener('mousemove', connectMove);
    document.addEventListener('mouseup', connectRelease);
    document.addEventListener('keydown', connectKeyPress);

    eventBus.on('shape.click', connectClick);
    eventBus.on('shape.hover', connectHover);
    eventBus.on('shape.out', connectOut);
  }

  function unregisterListeners() {
    document.removeEventListener('mousemove', connectMove);
    document.removeEventListener('mouseup', connectRelease);
    document.removeEventListener('keydown', connectKeyPress);

    eventBus.off('shape.click', connectClick);
    eventBus.off('shape.hover', connectHover);
    eventBus.off('shape.out', connectOut);
  }

  function connectMove(e) {

    var viewbox = canvas.viewbox();

    var connection = context.connection;

    var start = LayoutUtil.getMidPoint(context.source);

    var end = {
      x: viewbox.x + (e.offsetX || e.layerX) / viewbox.scale,
      y: viewbox.y + (e.offsetY || e.layerY) / viewbox.scale
    };

    var waypoints = crop(start, end, context.source, context.hover);

    connection.attr('points', [ waypoints[0].x, waypoints[0].y, waypoints[1].x, waypoints[1].y ]);
  }

  function connectHover(e) {
    var element = e.element;

    var ok = modeling.canConnect(context.source, element);

    // simply ignore hover
    if (ok === null) {
      return;
    }

    if (ok) {
      context.target = element;
    }

    context.hover = element;

    canvas.addMarker(element, context.target ? 'connect-ok' : 'connect-not-ok');
  }

  function connectOut(e) {
    clearMarkers();

    context.hover = context.target = null;
  }

  function clearMarkers() {
    if (context.hover) {
      canvas.removeMarker(context.hover, context.target ? 'connect-ok' : 'connect-not-ok');
    }
  }

  function connectClick(e) {
    connectHover(e);
    connectRelease(e);
  }

  function connectRelease(e) {
    finish(e, context.target);
  }

  function connectKeyPress(event) {

    // ESC
    if (context && event.which === 27) {
      cancel();
    }
  }


  //////// api //////////////////////////////////

  function start(event, source) {

    var connection = canvas.getLayer().polyline().attr({
      'stroke': '#333',
      'strokeDasharray': [ 1 ],
      'strokeWidth': 2,
      'pointer-events': 'none'
    });

    context = {
      selection: selection.get(),
      source: source,
      connection: connection
    };

    // remove selection
    selection.select([]);

    registerListeners();
  }

  function finish(event, target) {

    var source = context && context.source;

    if (source && target && modeling.canConnect(source, target)) {
      modeling.connect(context.source, target);
    }

    cleanup();
  }

  function cancel() {
    cleanup();
  }

  function cleanup() {

    if (!context) {
      return;
    }

    // restore selection
    selection.select(context.selection);

    clearMarkers();

    unregisterListeners();

    context.connection.remove();
    context = null;
  }

  this.cancel = cancel;
  this.start = start;
  this.finish = finish;

  this.active = function() {
    return context;
  };
}


Connect.$inject = [ 'modeling', 'eventBus', 'elementRegistry', 'selection', 'canvas' ];

module.exports = Connect;