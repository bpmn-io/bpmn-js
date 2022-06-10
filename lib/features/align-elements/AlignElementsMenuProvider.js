import ICONS from './AlignElementsIcons';

import {
  assign,
  forEach,
} from 'min-dash';

var ALIGNMENT_OPTIONS = [
  'left',
  'center',
  'right',
  'top',
  'middle',
  'bottom'
];

/**
 * A provider for align elements popup menu.
 */
export default function AlignElementsMenuProvider(popupMenu, alignElements, translate, rules) {

  this._alignElements = alignElements;
  this._translate = translate;
  this._popupMenu = popupMenu;
  this._rules = rules;

  popupMenu.registerProvider('align-elements', this);
}

AlignElementsMenuProvider.$inject = [
  'popupMenu',
  'alignElements',
  'translate',
  'rules'
];

AlignElementsMenuProvider.prototype.getPopupMenuEntries = function(elements) {
  var entries = {};

  if (this._isAllowed(elements)) {
    assign(entries, this._getEntries(elements));
  }

  return entries;
};

AlignElementsMenuProvider.prototype._isAllowed = function(elements) {
  return this._rules.allowed('elements.align', { elements: elements });
};

AlignElementsMenuProvider.prototype._getEntries = function(elements) {
  var alignElements = this._alignElements,
      translate = this._translate,
      popupMenu = this._popupMenu;

  var entries = {};

  forEach(ALIGNMENT_OPTIONS, function(alignment) {
    entries[ 'align-elements-' + alignment ] = {
      group: 'align',
      title: translate('Align elements ' + alignment),
      className: 'bjs-align-elements-menu-entry',
      imageUrl: ICONS[alignment],
      action: function(event, entry) {
        alignElements.trigger(elements, alignment);
        popupMenu.close();
      }
    };
  });

  return entries;
};
