import {
  assign
} from 'min-dash';

import ICONS from './AlignElementsIcons';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/features/context-pad/ContextPad').default} ContextPad
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').default} PopupMenu
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 *
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('diagram-js/lib/features/context-pad/ContextPad').ContextPadEntries} ContextPadEntries
 * @typedef {import('diagram-js/lib/features/context-pad/ContextPadProvider').default} ContextPadProvider
 */

var LOW_PRIORITY = 900;

/**
 * A provider for the `Align elements` context pad entry.
 *
 * @implements {ContextPadProvider}
 *
 * @param {ContextPad} contextPad
 * @param {PopupMenu} popupMenu
 * @param {Translate} translate
 * @param {Canvas} canvas
 */
export default function AlignElementsContextPadProvider(contextPad, popupMenu, translate, canvas) {

  contextPad.registerProvider(LOW_PRIORITY, this);

  this._contextPad = contextPad;
  this._popupMenu = popupMenu;
  this._translate = translate;
  this._canvas = canvas;
}

AlignElementsContextPadProvider.$inject = [
  'contextPad',
  'popupMenu',
  'translate',
  'canvas'
];

/**
 * @param {Element[]} elements
 *
 * @return {ContextPadEntries}
 */
AlignElementsContextPadProvider.prototype.getMultiElementContextPadEntries = function(elements) {
  var actions = {};

  if (this._isAllowed(elements)) {
    assign(actions, this._getEntries(elements));
  }

  return actions;
};

AlignElementsContextPadProvider.prototype._isAllowed = function(elements) {
  return !this._popupMenu.isEmpty(elements, 'align-elements');
};

AlignElementsContextPadProvider.prototype._getEntries = function() {
  var self = this;

  return {
    'align-elements': {
      group: 'align-elements',
      title: self._translate('Align elements'),
      html: `<div class="entry">${ICONS['align']}</div>`,
      action: {
        click: function(event, target) {
          var position = self._getMenuPosition(target);

          assign(position, {
            cursor: {
              x: event.x,
              y: event.y
            }
          });

          self._popupMenu.open(target, 'align-elements', position);
        }
      }
    }
  };
};

AlignElementsContextPadProvider.prototype._getMenuPosition = function(elements) {
  var Y_OFFSET = 5;

  var pad = this._contextPad.getPad(elements).html;

  var padRect = pad.getBoundingClientRect();

  var pos = {
    x: padRect.left,
    y: padRect.bottom + Y_OFFSET
  };

  return pos;
};
