import ICONS from './AlignElementsIcons';

import {
  assign,
  forEach,
} from 'min-dash';

/**
 * @typedef {import('diagram-js/lib/features/align-elements/AlignElements').default} AlignElements
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').default} PopupMenu
 * @typedef {import('diagram-js/lib/features/rules/Rules').default} Rules
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 *
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').PopupMenuEntries} PopupMenuEntries
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').default} PopupMenuProvider
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').PopupMenuTarget} PopupMenuTarget
 */

var ALIGNMENT_OPTIONS = [
  'left',
  'center',
  'right',
  'top',
  'middle',
  'bottom'
];

/**
 * A provider for the `Align elements` popup menu.
 *
 * @implements {PopupMenuProvider}
 *
 * @param {PopupMenu} popupMenu
 * @param {AlignElements} alignElements
 * @param {Translate} translate
 * @param {Rules} rules
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

/**
 * @param {PopupMenuTarget} target
 *
 * @return {PopupMenuEntries}
 */
AlignElementsMenuProvider.prototype.getPopupMenuEntries = function(target) {
  var entries = {};

  if (this._isAllowed(target)) {
    assign(entries, this._getEntries(target));
  }

  return entries;
};

AlignElementsMenuProvider.prototype._isAllowed = function(target) {
  return this._rules.allowed('elements.align', { elements: target });
};

/**
 * @param {PopupMenuTarget} target
 *
 * @return {PopupMenuEntries}
 */
AlignElementsMenuProvider.prototype._getEntries = function(target) {
  var alignElements = this._alignElements,
      translate = this._translate,
      popupMenu = this._popupMenu;

  var entries = {};

  forEach(ALIGNMENT_OPTIONS, function(alignment) {
    entries[ 'align-elements-' + alignment ] = {
      group: 'align',
      title: translate('Align elements ' + alignment),
      className: 'bjs-align-elements-menu-entry',
      imageHtml: ICONS[ alignment ],
      action: function() {
        alignElements.trigger(target, alignment);
        popupMenu.close();
      }
    };
  });

  return entries;
};
