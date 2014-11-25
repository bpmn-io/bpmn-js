'use strict';

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
TouchFix.prototype.addBBoxMarker = function(paper) {

  var markerStyle = {
    fill: 'none',
    class: 'outer-bound-marker'
  };

  paper.rect(-10000, -10000, 10, 10).attr(markerStyle);
  paper.rect(10000, 10000, 10, 10).attr(markerStyle);
};
