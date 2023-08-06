import {
  isNumber,
  isUndefined,
  some
} from 'min-dash';

import {
  append as svgAppend,
  attr as svgAttr,
  clear as svgClear,
  create as svgCreate
} from 'tiny-svg';

const THRESHOLD = 2;


export default class ElementDetection {
  constructor(canvas, elementRegistry) {
    this._canvas = canvas;
    this._elementRegistry = elementRegistry;
  }

  /**
   * Detect elements intersecting point or rect.
   * Uses element registry.
   *
   * @param {Object} pointOrRect
   *
   * @return {Array}
   */
  detectAt(pointOrRect) {
    if (isPoint(pointOrRect)) {
      pointOrRect = {
        ...pointOrRect,
        width: 0,
        height: 0
      };
    }

    if (!isTRBL(pointOrRect)) {
      pointOrRect = toTRBL(pointOrRect);
    }

    // drawRect(pointOrRect, this._canvas);

    const elements = this._elementRegistry.filter(elementIntersects(pointOrRect));

    return elements;
  }
}

ElementDetection.$inject = [
  'canvas',
  'elementRegistry'
];

// helpers //////////

function elementIntersects(rect) {
  return function(element) {
    if (isConnection(element)) {
      return connectionIntersects(element, rect);
    }

    return element.x <= rect.right &&
      element.x + element.width >= rect.left &&
      element.y <= rect.bottom &&
      element.y + element.height >= rect.top;
  }
}

function isConnection(element) {
  return !!element.waypoints;
}

function connectionIntersects(connection, rect) {
  const segments = getSegments(connection);

  return some(segments, segmentIntersects(rect));
}

function getSegments({ waypoints }) {
  return waypoints.reduce((segments, waypoint, index) => {
    if (isLastIndex(index, waypoints)) {
      return segments;
    }

    return [
      ...segments,
      {
        start: waypoint,
        end: waypoints[ index + 1]
      }
    ];
  }, []);
}

function segmentIntersects(rect) {
  return function(segment) {
    let { start, end } = segment;

    if (isHorizontal(segment)) {
      if (start.x > end.x) {
        start = segment.end;
        end = segment.start;
      }

      return start.y >= rect.top &&
        start.y <= rect.bottom &&
        start.x <= rect.right &&
        end.x >= rect.left;
    } else {
      if (start.y > end.y) {
        start = segment.end;
        end = segment.start;
      }

      return start.x >= rect.left &&
        start.x <= rect.right &&
        start.y <= rect.bottom &&
        end.y >= rect.top;
    }
  };
}

function isHorizontal({ start, end }) {
  return Math.abs(start.y - end.y) <= THRESHOLD;
}

function isLastIndex(index, array) {
  return index + 1 === array.length;
}

function isPoint(pointOrRect) {
  return isNumber(pointOrRect.x) &&
    isNumber(pointOrRect.y) &&
    isUndefined(pointOrRect.width) &&
    isUndefined(pointOrRect.height);
}

function isTRBL(pointOrRect) {
  return isNumber(pointOrRect.top) &&
    isNumber(pointOrRect.right) &&
    isNumber(pointOrRect.bottom) &&
    isNumber(pointOrRect.left);
}

function toTRBL(rect) {
  return {
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    left: rect.x
  };
}

let counter = 0;

const colors = [ 'red', /*'green', 'blue'*/ ];

function drawRect(rect, canvas) {
  const layer = canvas.getLayer('element-detection');

  svgClear(layer);

  const gfx = svgCreate('rect');

  gfx.style.pointerEvents = 'none';

  svgAttr(gfx, {
    fill: colors[ counter % colors.length ],
    fillOpacity: 0.25,
    stroke: colors[ counter % colors.length ],
    strokeOpacity: 0.25,
    strokeWidth: 2,
    x: rect.left,
    y: rect.top,
    width: Math.max(rect.right - rect.left, 2),
    height: Math.max(rect.bottom - rect.top, 2)
  });

  svgAppend(layer, gfx);

  setTimeout(() => {
    // svgClear(layer);
  }, 1000);

  counter++;
}