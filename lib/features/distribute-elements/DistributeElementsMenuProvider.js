import ICONS from './DistributeElementsIcons';

import { assign } from 'min-dash';

/**
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').default} PopupMenu
 * @typedef {import('./BpmnDistributeElements').default} DistributeElements
 * @typedef {import('diagram-js/lib/i18n/translate/translate').default} Translate
 * @typedef {import('diagram-js/lib/features/rules/Rules').default} Rules
 *
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').PopupMenuEntries} PopupMenuEntries
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenuProvider').default} PopupMenuProvider
 * @typedef {import('diagram-js/lib/features/popup-menu/PopupMenu').PopupMenuTarget} PopupMenuTarget
 */

var LOW_PRIORITY = 900;

/**
 * A provider for the distribute elements popup menu.
 *
 * @implements {PopupMenuProvider}
 *
 * @param {PopupMenu} popupMenu
 * @param {DistributeElements} distributeElements
 * @param {Translate} translate
 * @param {Rules} rules
 */
export default function DistributeElementsMenuProvider(
    popupMenu, distributeElements, translate, rules) {
  this._distributeElements = distributeElements;
  this._translate = translate;
  this._popupMenu = popupMenu;
  this._rules = rules;

  popupMenu.registerProvider('align-elements', LOW_PRIORITY, this);
}

DistributeElementsMenuProvider.$inject = [
  'popupMenu',
  'distributeElements',
  'translate',
  'rules'
];

/**
 * @param {PopupMenuTarget} target
 *
 * @return {PopupMenuEntries}
 */
DistributeElementsMenuProvider.prototype.getPopupMenuEntries = function(target) {
  var entries = {};

  if (this._isAllowed(target)) {
    assign(entries, this._getEntries(target));
  }

  return entries;
};

DistributeElementsMenuProvider.prototype._isAllowed = function(elements) {
  return this._rules.allowed('elements.distribute', { elements: elements });
};

DistributeElementsMenuProvider.prototype._getEntries = function(elements) {
  var distributeElements = this._distributeElements,
      translate = this._translate,
      popupMenu = this._popupMenu;

  var entries = {
    'distribute-elements-horizontal': {
      group: 'distribute',
      title: translate('Distribute elements horizontally'),
      className: 'bjs-align-elements-menu-entry',
      imageHtml: ICONS['horizontal'],
      action: function(event, entry) {
        distributeElements.trigger(elements, 'horizontal');
        popupMenu.close();
      }
    },
    'distribute-elements-vertical': {
      group: 'distribute',
      title: translate('Distribute elements vertically'),
      imageHtml: ICONS['vertical'],
      action: function(event, entry) {
        distributeElements.trigger(elements, 'vertical');
        popupMenu.close();
      }
    },
  };

  return entries;
};
