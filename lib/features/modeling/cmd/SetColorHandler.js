import {
  assign,
  forEach,
  isString,
  pick
} from 'min-dash';

import {
  getDi,
  isAny
} from '../../../util/ModelUtil';

import {
  isLabel
} from '../../../util/LabelUtil';

import { isConnection } from 'diagram-js/lib/util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/command/CommandHandler').default} CommandHandler
 *
 * @typedef {import('diagram-js/lib/command/CommandStack').default} CommandStack
 *
 * @typedef {import('../../../model/Types').ModdleElement} ModdleElement
 */

var DEFAULT_COLORS = {
  fill: undefined,
  stroke: undefined
};

/**
 * @implements {CommandHandler}
 *
 * @param {CommandStack} commandStack
 */
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
    var assignedDi = isConnection(element) ? pick(di, [ 'border-color' ]) : di,
        elementDi = getDi(element);

    // TODO @barmac: remove once we drop bpmn.io properties
    ensureLegacySupport(assignedDi);

    if (isLabel(element)) {

      // set label colors as bpmndi:BPMNLabel#color
      self._commandStack.execute('element.updateModdleProperties', {
        element: element,
        moddleElement: elementDi.label,
        properties: {
          color: di['border-color']
        }
      });
    } else {

      // ignore non-compliant di
      if (!isAny(elementDi, [ 'bpmndi:BPMNEdge', 'bpmndi:BPMNShape' ])) {
        return;
      }

      // set colors bpmndi:BPMNEdge or bpmndi:BPMNShape
      self._commandStack.execute('element.updateProperties', {
        element: element,
        properties: {
          di: assignedDi
        }
      });
    }
  });

};

/**
 * Convert color from rgb(a)/hsl to hex. Returns `null` for unknown color names
 * and for colors with alpha less than 1.0. This depends on `<canvas>`
 * serialization of the `context.fillStyle`.
 * Cf. https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-fillstyle
 *
 * @example
 *
 * ```javascript
 * colorToHex('fuchsia'); // "#ff00ff"
 *
 * colorToHex('rgba(1, 2, 3, 0.4)'); // null
 * ```
 *
 * @param {string} color
 *
 * @return {string|null}
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

/**
 * Add legacy properties if required.
 *
 * @param {ModdleElement} di
 */
function ensureLegacySupport(di) {
  if ('border-color' in di) {
    di.stroke = di['border-color'];
  }

  if ('background-color' in di) {
    di.fill = di['background-color'];
  }
}
