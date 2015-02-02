'use strict';

var Snap = require('snapsvg');

var Events = require('../../util/Event'),
    Geometry = require('../../util/Geometry');

var BENDPOINT_CLS = module.exports.BENDPOINT_CLS = 'djs-bendpoint';

module.exports.toCanvasCoordinates = function(canvas, event) {

  var position = Events.toPoint(event),
      clientRect = canvas._container.getBoundingClientRect(),
      offset;

  // canvas relative position

  offset = {
    x: clientRect.left,
    y: clientRect.top
  };

  // update actual event payload with canvas relative measures

  var viewbox = canvas.viewbox();

  return {
    x: viewbox.x + (position.x - offset.x) / viewbox.scale,
    y: viewbox.y + (position.y - offset.y) / viewbox.scale
  };
};

module.exports.addBendpoint = function(parentGfx) {
  var groupGfx = parentGfx.group().addClass(BENDPOINT_CLS);

  groupGfx.circle(0, 0, 4).addClass('djs-visual');
  groupGfx.circle(0, 0, 10).addClass('djs-hit');

  return groupGfx;
};


function circlePath(center, r) {
  var x = center.x,
      y = center.y;

  return [
    ['M', x, y],
    ['m', 0, -r],
    ['a', r, r, 0, 1, 1, 0, 2 * r],
    ['a', r, r, 0, 1, 1, 0, -2 * r],
    ['z']
  ];
}

function linePath(points) {
  var segments = [];

  points.forEach(function(p, idx) {
    segments.push([ idx === 0 ? 'M' : 'L', p.x, p.y ]);
  });

  return segments;
}


var INTERSECTION_THRESHOLD = 10;

function getBendpointIntersection(waypoints, reference) {

  var i, w;

  for (i = 0; !!(w = waypoints[i]); i++) {

    if (Geometry.distance(w, reference) <= INTERSECTION_THRESHOLD) {
      return {
        point: waypoints[i],
        bendpoint: true,
        index: i
      };
    }
  }

  return null;
}

function getPathIntersection(waypoints, reference) {

  var intersections = Snap.path.intersection(circlePath(reference, INTERSECTION_THRESHOLD), linePath(waypoints));

  var a = intersections[0],
      b = intersections[intersections.length - 1],
      idx;

  if (!a) {
    // no intersection
    return null;
  }

  if (a !== b) {

    if (a.segment2 !== b.segment2) {
      // we use the bendpoint in between both segments
      // as the intersection point

      idx = Math.max(a.segment2, b.segment2) - 1;

      return {
        point: waypoints[idx],
        bendpoint: true,
        index: idx
      };
    }

    return {
      point: {
        x: (Math.round(a.x + b.x) / 2),
        y: (Math.round(a.y + b.y) / 2)
      },
      index: a.segment2
    };
  }

  return {
    point: {
      x: Math.round(a.x),
      y: Math.round(a.y)
    },
    index: a.segment2
  };
}

/**
 * Returns the closest point on the connection towards a given reference point.
 *
 * @param  {Array<Point>} waypoints
 * @param  {Point} reference
 *
 * @return {Object} intersection data (segment, point)
 */
module.exports.getApproxIntersection = function(waypoints, reference) {
  return getBendpointIntersection(waypoints, reference) || getPathIntersection(waypoints, reference);
};