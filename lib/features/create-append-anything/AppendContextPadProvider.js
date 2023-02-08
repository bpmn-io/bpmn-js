import {
  assign
} from 'min-dash';

import {
  appendIcon
} from '../../icons/Icons';

var LOW_PRIORITY = 900;

/**
 * A provider for align elements context pad button
 */
export default function AppendContextPadProvider(contextPad, popupMenu, translate, canvas) {
  contextPad.registerProvider(LOW_PRIORITY, this);

  this._contextPad = contextPad;
  this._popupMenu = popupMenu;
  this._translate = translate;
  this._canvas = canvas;
}

AppendContextPadProvider.$inject = [
  'contextPad',
  'popupMenu',
  'translate',
  'canvas'
];

AppendContextPadProvider.prototype.getContextPadEntries = function(element) {
  const popupMenu = this._popupMenu;
  const translate = this._translate;
  const getAppendMenuPosition = this._getAppendMenuPosition.bind(this);

  if (!popupMenu.isEmpty(element, 'bpmn-append')) {

    // append menu entry
    return {
      'append': {
        group: 'model',
        imageUrl: appendIcon,
        title: translate('Append element'),
        action: {
          click: function(event, element) {

            var position = assign(getAppendMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });

            popupMenu.open(element, 'bpmn-append', position, {
              title: translate('Append element'),
              width: 300,
              search: true
            });
          }
        }
      }
    };
  }
};

AppendContextPadProvider.prototype._getAppendMenuPosition = function(element) {
  const contextPad = this._contextPad;

  const X_OFFSET = 5;

  const pad = contextPad.getPad(element).html;

  const padRect = pad.getBoundingClientRect();

  const pos = {
    x: padRect.right + X_OFFSET,
    y: padRect.top
  };

  return pos;
};