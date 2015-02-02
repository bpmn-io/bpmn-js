'use strict';

var assign = require('lodash/object/assign'),
    pick = require('lodash/object/pick'),
    filter = require('lodash/collection/filter'),
    forEach = require('lodash/collection/forEach'),
    map = require('lodash/collection/map'),
    debounce = require('lodash/function/debounce');

var Snap = require('snapsvg');


function toPoint(event) {
  return pick(event, [ 'x', 'y' ]);
}

function mid(element) {
  if (element.x === undefined || element.y === undefined) {
    return null;
  }

  return {
    x: Math.round(element.x + element.width / 2),
    y: Math.round(element.y + element.height / 2)
  };
}

function snapTo(candidates, point) {
  return Snap.snapTo(candidates, point);
}

function Snapping(eventBus, canvas) {

  this._canvas = canvas;

  var self = this;

  eventBus.on([ 'shape.move.start', 'create.start' ], function(event) {
    self.initSnap(event);
  });

  eventBus.on([ 'shape.move.move', 'shape.move.end', 'create.move', 'create.end' ], function(event) {
    self.snap(event);
  });

  eventBus.on([ 'shape.move.cleanup', 'create.cleanup' ], function(event) {
    self.hide();
  });

  // delay hide by 1000 seconds since last match
  this._asyncHide = debounce(this.hide, 1000);
}

Snapping.$inject = [ 'eventBus', 'canvas' ];

module.exports = Snapping;


Snapping.prototype.initSnap = function(event) {
  var context = event.context;

  context.snapStart = mid(context.shape) || toPoint(event);
  context.snapPoints = {};
};


Snapping.prototype.snap = function(event) {

  var context = event.context,
      start = context.snapStart,
      x = start.x + event.dx,
      y = start.y + event.dy;

  var sx, sy;

  var snapPoints = this.getSnapPoints(context);

  if (!snapPoints) {
    return;
  }

  // snap
  sx = snapTo(snapPoints.vertical, x);
  sy = snapTo(snapPoints.horizontal, y);

  // show snap controls
  this.showSnap('horizontal', snapPoints.horizontalMap[sy], { x: x, y: sy });
  this.showSnap('vertical', snapPoints.verticalMap[sx], { x: sx, y: y });

  // correction x/y
  var cx = (x - sx),
      cy = (y - sy);

  // update delta
  assign(event, {
    dx: event.dx - cx,
    dy: event.dy - cy,
    x: event.x - cx,
    y: event.y - cy
  });
};


Snapping.prototype._createLine = function(path) {
  var root = this._canvas.getLayer('snap');

  var line = root.path('M0,0 L0,0').addClass('djs-snap-line');

  line.update = function(snap) {
    if (snap) {
      line.attr({
        path: Snap.format(path, snap),
        display: ''
      });
    } else {
      line.attr({
        display: 'none'
      });
    }
  };

  return line;
};

Snapping.prototype._createSnapLines = function() {

  this._snapLines = {
    horizontal: this._createLine('M{start},{snap}L{end},{snap}'),
    vertical: this._createLine('M{snap},{start}L{snap},{end}')
  };
};

Snapping.prototype.showSnap = function(orientation, points, pos) {

  var snap, vertical, coordinates;

  // ensure the snap line has an appropriate length
  // to reach from start to end
  if (points) {
    vertical = orientation === 'vertical';
    coordinates = map(points.concat([ pos ]), vertical ? 'y' : 'x');
    snap = {
      snap: pos[vertical ? 'x' : 'y'],
      start: Math.min.apply(null, coordinates) - 5000,
      end: Math.max.apply(null, coordinates) + 5000,
    };
  }

  var line = this.getSnapLine(orientation);
  if (line) {
    line.update(snap);
  }

  this._asyncHide();
};

Snapping.prototype.getSnapLine = function(orientation) {
  if (!this._snapLines) {
    this._createSnapLines();
  }

  return this._snapLines[orientation];
};

Snapping.prototype.hide = function() {
  forEach(this._snapLines, function(l) {
    l.update();
  });
};

Snapping.prototype.getSnapPoints = function(context) {

  var element = context.shape,
      target = context.target,
      snapPoints = context.snapPoints;

  if (!target) {
    return;
  }

  var points = snapPoints[target.id];

  if (!points) {

    var snapTargets = this.getSnapTargets(element, target);

    var horizontal = [],
        vertical = [],
        horizontalMap = {},
        verticalMap = {};

    forEach(snapTargets, function(t) {
      var snap = mid(t);

      horizontal.push(snap.y);
      vertical.push(snap.x);

      (horizontalMap[snap.y] = horizontalMap[snap.y] || []).push(t);
      (verticalMap[snap.x] = verticalMap[snap.x] || []).push(t);
    });

    points = snapPoints[target.id] = {
      horizontal: horizontal,
      vertical: vertical,
      horizontalMap: horizontalMap,
      verticalMap: verticalMap
    };
  }

  return points;
};

Snapping.prototype.getSnapTargets = function(element, target) {

  // snap to all non connection siblings
  return target && filter(target.children, function(e) {
    return !e.hidden && !e.labelTarget && !e.waypoints && e !== element;
  });
};