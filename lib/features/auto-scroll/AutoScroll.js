'use strict';

var assign = require('lodash/object/assign');

var EventUtil = require('../../util/Event');


/**
 * Initiates canvas scrolling if current cursor point is close to a border.
 * Cancelled when current point moves back inside the scrolling borders
 * or cancelled manually.
 *
 * Default options :
 *   scrollThresholdIn: [ 20, 25, 20, 20 ],
 *   scrollThresholdOut: [ -1000, 0, -1000, -1000 ],
 *   scrollRepeatTimeout: 15,
 *   scrollStep: 10
 *
 * Threshold order:
 *   [ left, top, right, bottom ]
 */
function AutoScroll(eventBus, canvas, mouseTracking) {

  this._canvas = canvas;
  this._mouseTracking = mouseTracking;

  this._opts = {
    scrollThresholdIn: [ 20, 25, 20, 20 ],
    scrollThresholdOut: [ -1000, 0, -1000, -1000 ],
    scrollRepeatTimeout: 15,
    scrollStep: 10
  };

  var self = this;

  eventBus.on('drag.move', function(e) {
    var point = self._toBorderPoint(e);

    self.startScroll(point);
  });

  eventBus.on([ 'drag.cleanup' ], function() {
    self.stopScroll();
  });
}

AutoScroll.$inject = [ 'eventBus', 'canvas', 'mouseTracking'];

module.exports = AutoScroll;


/**
 * Starts scrolling loop.
 * Point is given in global scale in canvas container box plane.
 *
 * @param  {Object} point { x: X, y: Y }
 */
AutoScroll.prototype.startScroll = function(point) {

  var canvas = this._canvas;
  var opts = this._opts;
  var self = this;

  var clientRect = canvas.getContainer().getBoundingClientRect();

  var diff = [
    point.x,
    point.y,
    clientRect.width - point.x,
    clientRect.height - point.y
  ];

  this.stopScroll();

  var dx = 0,
      dy = 0;

  for (var i = 0; i < 4; i++) {
    if (between(diff[i], opts.scrollThresholdOut[i], opts.scrollThresholdIn[i])) {
      if (i === 0) {
        dx = opts.scrollStep;
      } else if (i == 1) {
        dy = opts.scrollStep;
      } else if (i == 2) {
        dx = -opts.scrollStep;
      } else if (i == 3) {
        dy = -opts.scrollStep;
      }
    }
  }

  if (dx !== 0 || dy !== 0) {
    canvas.scroll({ dx: dx, dy: dy });

    this._scrolling = setTimeout(function() {
      self.startScroll(point);
    }, opts.scrollRepeatTimeout);
  }
};

function between(val, start, end) {
  if (start < val && val < end) {
    return true;
  }

  return false;
}


/**
 * Stops scrolling loop.
 */
AutoScroll.prototype.stopScroll = function() {
  clearTimeout(this._scrolling);
};


/**
 * Overrides defaults options.
 *
 * @param  {Object} options
 */
AutoScroll.prototype.setOptions = function(options) {
  this._opts = assign({}, this._opts, options);
};


/**
 * Converts event to a point in canvas container plane in global scale.
 *
 * @param  {Event} event
 * @return {Point}
 */
AutoScroll.prototype._toBorderPoint = function(event) {
  var clientRect = this._canvas._container.getBoundingClientRect();

  var globalPosition = EventUtil.toPoint(event.originalEvent);

  return {
    x: globalPosition.x - clientRect.left,
    y: globalPosition.y - clientRect.top
  };
};