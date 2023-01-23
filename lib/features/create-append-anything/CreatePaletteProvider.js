import {
  assign
} from 'min-dash';
import { createIcon } from '../../icons/Icons';
import { query as domQuery } from 'min-dom';


/**
 * A palette provider for the create elements menu.
 */
export default function CreatePaletteProvider(palette, translate, popupMenu, canvas) {

  this._translate = translate;
  this._popupMenu = popupMenu;
  this._canvas = canvas;

  palette.registerProvider(800,this);
}

CreatePaletteProvider.$inject = [
  'palette',
  'translate',
  'popupMenu',
  'canvas'
];


CreatePaletteProvider.prototype.getPaletteEntries = function(element) {
  const actions = {},
        translate = this._translate,
        popupMenu = this._popupMenu,
        canvas = this._canvas;

  const getPosition = (event) => {
    const X_OFFSET = 35;
    const Y_OFFSET = 10;

    const target = event && event.target || domQuery('.djs-palette [data-action="create"]');
    const targetPosition = target.getBoundingClientRect();

    return target && {
      x: targetPosition.left + targetPosition.width / 2 + X_OFFSET,
      y: targetPosition.top + targetPosition.height / 2 + Y_OFFSET
    };
  };

  assign(actions, {
    'create': {
      group: 'create',
      imageUrl: createIcon,
      title: translate('Create element'),
      action: {
        click: function(event) {
          const position = getPosition(event);

          const element = canvas.getRootElement();

          popupMenu.open(element, 'bpmn-create', position, {
            title: translate('Create element'),
            width: 300,
            search: true
          });
        }
      }
    },
  });

  return actions;
};
