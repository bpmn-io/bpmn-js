import {
  assign,
  forEach,
  isString,
  pick
} from 'min-dash';


var DEFAULT_COLORS = {
  fill: undefined,
  stroke: undefined
};


export default function SetColorHandler(commandStack) {
  this._commandStack = commandStack;

  this._normalizeColor = function(color) {

    // Remove color for falsy values.
    if (!color) {
      return undefined;
    }

    if (isString(color)) {
      var hexColor = colorToHex(color);

      if (hexColor) {
        return hexColor;
      }
    }

    throw new Error('invalid color value: ' + color);
  };
}

SetColorHandler.$inject = [
  'commandStack'
];


SetColorHandler.prototype.postExecute = function(context) {
  var elements = context.elements,
      colors = context.colors || DEFAULT_COLORS;

  var self = this;

  var di = {};

  if ('fill' in colors) {
    assign(di, {
      'background-color': this._normalizeColor(colors.fill) });
  }

  if ('stroke' in colors) {
    assign(di, {
      'border-color': this._normalizeColor(colors.stroke) });
  }

  forEach(elements, function(element) {
    var assignedDi = isConnection(element) ? pick(di, [ 'border-color' ]) : di;

    // TODO @barmac: remove once we drop bpmn.io properties
    ensureLegacySupport(assignedDi);

    self._commandStack.execute('element.updateProperties', {
      element: element,
      properties: {
        di: assignedDi
      }
    });
  });

};

/**
 * Convert color from rgb(a)/hsl to hex. Returns `null` for unknown color names and for colors
 * with alpha less than 1.0. This depends on `<canvas>` serialization of the `context.fillStyle`.
 * Cf. https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-fillstyle
 *
 * @example
 * ```js
 * var color = 'fuchsia';
 * console.log(colorToHex(color));
 * // "#ff00ff"
 * color = 'rgba(1,2,3,0.4)';
 * console.log(colorToHex(color));
 * // null
 * ```
 *
 * @param {string} color
 * @returns {string|null}
 */
function colorToHex(color) {
  var context = document.createElement('canvas').getContext('2d');

  // (0) Start with transparent to account for browser default values.
  context.fillStyle = 'transparent';

  // (1) Assign color so that it's serialized.
  context.fillStyle = color;

  // (2) Return null for non-hex serialization result.
  return /^#[0-9a-fA-F]{6}$/.test(context.fillStyle) ? context.fillStyle : null;
}

function isConnection(element) {
  return !!element.waypoints;
}

/**
 * Add legacy properties if required.
 * @param {{ 'border-color': string?, 'background-color': string? }} di
 */
function ensureLegacySupport(di) {
  if ('border-color' in di) {
    di.stroke = di['border-color'];
  }

  if ('background-color' in di) {
    di.fill = di['background-color'];
  }
}
