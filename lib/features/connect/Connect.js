'use strict';

var LayoutUtil = require('../../layout/LayoutUtil');

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok';


function Connect(eventBus, dragging, modeling, rules, canvas, graphicsFactory) {

  // TODO(nre): separate UI and events

  // rules

  function canConnect(source, target) {
    return rules.allowed('connection.create', {
      source: source,
      target: target
    });
  }


  // layouting

  function crop(start, end, source, target) {

    var sourcePath = graphicsFactory.getShapePath(source),
        targetPath = target && graphicsFactory.getShapePath(target),
        connectionPath = graphicsFactory.getConnectionPath({ waypoints: [ start, end ] });

    start = LayoutUtil.getElementLineIntersection(sourcePath, connectionPath, true) || start;
    end = (target && LayoutUtil.getElementLineIntersection(targetPath, connectionPath, false)) || end;

    return [ start, end ];
  }


  // event handlers

  eventBus.on('connect.move', function(event) {

    var context = event.context,
        source = context.source,
        target = context.target,
        visual = context.visual,
        start, end, waypoints;

    // update connection visuals during drag

    start = LayoutUtil.getMid(source);

    end = {
      x: event.x,
      y: event.y
    };

    waypoints = crop(start, end, source, target);

    visual.attr('points', [ waypoints[0].x, waypoints[0].y, waypoints[1].x, waypoints[1].y ]);
  });

  eventBus.on('connect.hover', function(event) {
    var context = event.context,
        source = context.source,
        hover = event.hover,
        canExecute;

    canExecute = context.canExecute = canConnect(source, hover);

    // simply ignore hover
    if (canExecute === null) {
      return;
    }

    context.target = hover;

    canvas.addMarker(hover, canExecute ? MARKER_OK : MARKER_NOT_OK);
  });

  eventBus.on([ 'connect.out', 'connect.cleanup' ], function(event) {
    var context = event.context;

    if (context.target) {
      canvas.removeMarker(context.target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
    }

    context.target = null;
  });

  eventBus.on('connect.cleanup', function(event) {
    var context = event.context;

    if (context.visual) {
      context.visual.remove();
    }
  });

  eventBus.on('connect.start', function(event) {
    var context = event.context,
        visual;

    visual = canvas.getDefaultLayer().polyline().attr({
      'stroke': '#333',
      'strokeDasharray': [ 1 ],
      'strokeWidth': 2,
      'pointer-events': 'none'
    });

    context.visual = visual;
  });

  eventBus.on('connect.end', function(event) {

    var context = event.context,
        source = context.source,
        target = context.target,
        canExecute = context.canExecute || canConnect(source, target);

    if (!canExecute) {
      return false;
    }

    modeling.connect(source, target);
  });


  // API

  this.start = function(event, source, autoActivate) {

    dragging.init(event, 'connect', {
      autoActivate: autoActivate,
      data: {
        shape: source,
        context: {
          source: source
        }
      }
    });
  };
}

Connect.$inject = [ 'eventBus', 'dragging', 'modeling', 'rules', 'canvas', 'graphicsFactory' ];

module.exports = Connect;
