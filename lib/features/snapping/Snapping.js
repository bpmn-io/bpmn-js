'use strict';

var _ = require('lodash'),
    Snap = require('snapsvg');


function mid(element) {
  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };
}


function Snapping(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;

  this._init();

  this._createSnapLines();
}

Snapping.$inject = [ 'eventBus', 'canvas' ];

module.exports = Snapping;


Snapping.prototype._init = function() {

  var self = this;

  this._eventBus.on('shape.move.start', function(e) {
    self.initSnap(e.dragContext);
  });

  this._eventBus.on('shape.move', function(e) {
    self.snap(e.dragContext);
  });

  this._eventBus.on('shape.move.end', function(e) {
    self.hide();
  });


  // delay hide by 2000 seconds since last match
  this._asyncHide = _.debounce(this.hide, 1000);
};

Snapping.prototype.initSnap = function(dragContext) {
  // fix start to point to element mid
  _.extend(dragContext.start, mid(dragContext.element));

  dragContext.snapPoints = this.getSnapPoints(dragContext.element);
};


Snapping.prototype.snap = function(dragContext) {

  var x = dragContext.start.x + dragContext.delta.x,
      y = dragContext.start.y + dragContext.delta.y;

  var sx, sy;

  var snapPoints = dragContext.snapPoints;

  // snap
  sy = Snap.snapTo(snapPoints.horizontal, y);
  sx = Snap.snapTo(snapPoints.vertical, x);

  // show snap controls
  this.showSnap('horizontal', snapPoints.horizontalMap[sy], { x: x, y: sy });
  this.showSnap('vertical', snapPoints.verticalMap[sx], { x: sx, y: y });

  // update delta
  _.extend(dragContext.delta, {
    x: sx - dragContext.start.x,
    y: sy - dragContext.start.y
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
    coordinates = _.map(points.concat([ pos ]), vertical ? 'y' : 'x');
    snap = {
      snap: pos[vertical ? 'x' : 'y'],
      start: Math.min.apply(null, coordinates) - 500,
      end: Math.max.apply(null, coordinates) + 500,
    };
  }

  var line = this._snapLines[orientation];
  if (line) {
    line.update(snap);
  }

  this._asyncHide();
};

Snapping.prototype.hide = function() {
  _.forEach(this._snapLines, function(l) {
    l.update();
  });
};

Snapping.prototype.getSnapPoints = function(element) {
  var snapTargets = this.getSnapTargets(element);

  var horizontal = [],
      vertical = [],
      horizontalMap = {},
      verticalMap = {};

  _.forEach(snapTargets, function(t) {
    var snap = mid(t);

    horizontal.push(snap.y);
    vertical.push(snap.x);

    (horizontalMap[snap.y] = horizontalMap[snap.y] || []).push(t);
    (verticalMap[snap.x] = verticalMap[snap.x] || []).push(t);
  });

  return {
    horizontal: horizontal,
    vertical: vertical,
    horizontalMap: horizontalMap,
    verticalMap: verticalMap
  };
};

Snapping.prototype.getSnapTargets = function(element) {

  // snap to all non connection siblings
  return element.parent && _.filter(element.parent.children, function(e) {
    return  !e.hidden && !e.labelTarget && !e.waypoints && e !== element;
  });
};