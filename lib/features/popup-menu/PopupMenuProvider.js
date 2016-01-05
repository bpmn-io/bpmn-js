'use strict';

/**
 * A basic provider that may be extended to provide entries for the popup menu.
 *
 * Extensions should implement the methods getEntries and register. Optionally
 * the method getHeaderEntries can be implemented.
 */
function PopupMenuProvider(popupMenu) {
  this._popupMenu = popupMenu;

  this.register();
}

PopupMenuProvider.$inject = [ 'popupMenu' ];


module.exports = PopupMenuProvider;


/**
 * This method should implement the creation of a list of entry objects.
 *
 * @param {djs.model.Base} element
 *
 * The following example contains one entry which alerts the id of the current selected
 * element, when clicking on the entry.
 *
 * @example
 * PopupMenuProvider.getEntries = function(element) {
 *   var entries = [{
 *     id: 'alert',
 *     label: 'Alert element ID',
 *     className: 'alert',
 *     action: function () {
 *       alert(element.id);
 *     }
 *   }];
 *
 *  return entries;
 *}
 */
PopupMenuProvider.getEntries = function(element) {};


/**
 * This method should implement the creation of a list of header entry objects.
 *
 * @param  {djs.model.Base} element
 *
 * The following example contains one button as header entry which alerts a string
 * when clicking on it.
 *
 * @example
 * PopupMenuProvider.getHeaderEntries = function(element) {
 *   var headerEntries = [{
 *     id: 'my-button',
 *     className: 'icon-button',
 *     title: 'My button',
 *     active: true,
 *     action: function() {
 *       alert('Button has been clicked');
 *     }
 *   }];
 *
 *   return headerEntries;
 * };
 */
PopupMenuProvider.getHeaderEntries = function(element) {};

/**
 * This method should implement the registration in the popup menu using an id.
 *
 * @example
 * PopupMenuProvider.register = function() {
 *   this._popupMenu.registerProvider('my-provider-id', this);
 * }
 */
PopupMenuProvider.register = function() {};