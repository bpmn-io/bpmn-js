'use strict';

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create');


function TouchFix(canvas, eventBus) {

  var self = this;

  eventBus.on('canvas.init', function(e) {
    self.addBBoxMarker(e.svg);
  });
}

TouchFix.$inject = [ 'canvas', 'eventBus' ];

module.exports = TouchFix;


/**
 * Safari mobile (iOS 7) does not fire touchstart event in <SVG> element
 * if there is no shape between 0,0 and viewport elements origin.
 *
 * So touchstart event is only fired when the <g class="viewport"> element was hit.
 * Putting an element over and below the 'viewport' fixes that behavior.
 */
TouchFix.prototype.addBBoxMarker = function(svg) {

  var markerStyle = {
    fill: 'none',
    class: 'outer-bound-marker'
  };

  var rect1 = svgCreate('rect');
  svgAttr(rect1, {
    x: -10000,
    y: 10000,
    width: 10,
    height: 10
  });
  svgAttr(rect1, markerStyle);

  svgAppend(svg, rect1);

  var rect2 = svgCreate('rect');
  svgAttr(rect2, {
    x: 10000,
    y: 10000,
    width: 10,
    height: 10
  });
  svgAttr(rect2, markerStyle);

  svgAppend(svg, rect2);
};
