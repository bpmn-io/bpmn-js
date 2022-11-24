import {
  assign
} from 'min-dash';

import ICONS from './AlignElementsIcons';

var LOW_PRIORITY = 900;

/**
 * A provider for align elements context pad button
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

AlignElementsContextPadProvider.prototype._getEntries = function(elements) {
  var self = this;

  return {
    'align-elements': {
      group: 'align-elements',
      title: self._translate('Align elements'),
      imageUrl: ICONS['align'],
      action: {
        click: function(event, elements) {
          var position = self._getMenuPosition(elements);

          assign(position, {
            cursor: {
              x: event.x,
              y: event.y
            }
          });

          self._popupMenu.open(elements, 'align-elements', position);
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
