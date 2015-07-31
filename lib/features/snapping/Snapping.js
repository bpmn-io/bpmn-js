'use strict';

var filter = require('lodash/collection/filter'),
    forEach = require('lodash/collection/forEach'),
    debounce = require('lodash/function/debounce');


var mid = require('./SnapUtil').mid;

var SnapContext = require('./SnapContext');

var SnapUtil = require('./SnapUtil');


var isSnapped = SnapUtil.isSnapped,
    setSnapped = SnapUtil.setSnapped;


/**
 * A general purpose snapping component for diagram elements.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function Snapping(eventBus, canvas) {

  this._canvas = canvas;

  var self = this;

  eventBus.on([ 'shape.move.start', 'create.start' ], function(event) {
    self.initSnap(event);
  });

  eventBus.on([ 'shape.move.move', 'shape.move.end', 'create.move', 'create.end' ], function(event) {

    if (event.originalEvent && event.originalEvent.ctrlKey) {
      return;
    }

    if (isSnapped(event)) {
      return;
    }

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

  var context = event.context,
      shape = context.shape,
      snapContext = context.snapContext;

  if (!snapContext) {
    snapContext = context.snapContext = new SnapContext();
  }

  var snapMid = mid(shape, event);

  snapContext.setSnapOrigin('mid', {
    x: snapMid.x - event.x,
    y: snapMid.y - event.y
  });

  return snapContext;
};


Snapping.prototype.snap = function(event) {

  var context = event.context,
      snapContext = context.snapContext,
      shape = context.shape,
      target = context.target,
      snapLocations = snapContext.getSnapLocations();

  if (!target) {
    return;
  }

  var snapPoints = snapContext.pointsForTarget(target);

  if (!snapPoints.initialized) {
    this.addTargetSnaps(snapPoints, shape, target);

    snapPoints.initialized = true;
  }


  var snapping = {
    x: isSnapped(event, 'x'),
    y: isSnapped(event, 'y')
  };


  forEach(snapLocations, function(location) {

    var snapOrigin = snapContext.getSnapOrigin(location);

    var snapCurrent = {
      x: event.x + snapOrigin.x,
      y: event.y + snapOrigin.y
    };

    // snap on both axis, if not snapped already
    forEach([ 'x', 'y' ], function(axis) {
      var locationSnapping;

      if (!snapping[axis]) {
        locationSnapping = snapPoints.snap(snapCurrent, location, axis, 7);

        if (locationSnapping !== undefined) {
          snapping[axis] = {
            value: locationSnapping,
            originValue: locationSnapping - snapOrigin[axis]
          };
        }
      }
    });

    // no more need to snap, drop out of interation
    if (snapping.x && snapping.y) {
      return false;
    }
  });


  // show snap visuals

  this.showSnapLine('vertical', snapping.x && snapping.x.value);
  this.showSnapLine('horizontal', snapping.y && snapping.y.value);


  // adjust event { x, y, dx, dy } and mark as snapping
  forEach([ 'x', 'y' ], function(axis) {

    var axisSnapping = snapping[axis];

    if (typeof axisSnapping === 'object') {
      setSnapped(event, axis, axisSnapping.originValue);
    }
  });
};


Snapping.prototype._createLine = function(orientation) {

  var root = this._canvas.getLayer('snap');

  var line = root.path('M0,0 L0,0').addClass('djs-snap-line');

  return {
    update: function(position) {

      if (typeof position !== 'number') {
        line.attr({ display: 'none' });
      } else {
        if (orientation === 'horizontal') {
          line.attr({
            path: 'M-100000,' + position + ' L+100000,' + position,
            display: ''
          });
        } else {
          line.attr({
            path: 'M ' + position + ',-100000 L ' + position + ', +100000',
            display: ''
          });
        }
      }
    }
  };
};


Snapping.prototype._createSnapLines = function() {

  this._snapLines = {
    horizontal: this._createLine('horizontal'),
    vertical: this._createLine('vertical')
  };
};

Snapping.prototype.showSnapLine = function(orientation, position) {

  var line = this.getSnapLine(orientation);

  if (line) {
    line.update(position);
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

Snapping.prototype.addTargetSnaps = function(snapPoints, shape, target) {

  var siblings = this.getSiblings(shape, target);

  forEach(siblings, function(s) {
    snapPoints.add('mid', mid(s));
  });

};

Snapping.prototype.getSiblings = function(element, target) {

  // snap to all non connection siblings
  return target && filter(target.children, function(e) {
    return !e.hidden && !e.labelTarget && !e.waypoints && e.host !== element && e !== element;
  });
};