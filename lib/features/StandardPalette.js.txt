var Diagram = require('../Diagram'),
          _ = require('lodash');

/**
 * @namespace djs
 */

/**
 * @class
 */
function StandardPalette(config, events, canvas, paletteDragDrop, injector) {
  'use strict';

  events.on('canvas.init', function(event) {
    init();
  });

  function init() {
    var menuConfig = config.menu || {};

    bootstrapMenus(menuConfig);

    events.fire('standard.palette.init');

    // intercept direct canvas clicks to deselect all
    // selected shapes

  }

  function bootstrapMenus(menus) {
    if(!menus) {
      console.warn('Menu was undefined');
      return;
    }
    menus.forEach(function(menu) {
      var menuContainer = createMenuContainer(menu);
      //then call menu for init
      //Add to page
      menu.parentContainer.appendChild(menuContainer);
    });
  }

  function createMenuContainer(menu) {
    var menuDiv = document.createElement('div');
    menuDiv.setAttributeNS('http://www.w3.org/1999/xhtml', 'id', 'menu-' + menu.id);

    if(menu.align === 'vertical') {
      menuDiv.setAttribute('class', 'djs-menu-vertical');
    } else if(menu.align === 'vertical') {
      menuDiv.setAttribute('class', 'djs-menu-horizontal');
    } else {
      console.warn('Align %s is invalid', menu.align);
    }

    _.forEach(menu.items, function(item) {

      var icon = document.createElement('i');
      var button = document.createElement('button');
      button.setAttribute('class', 'djs-addshape ' + item.cssClass);
      button.appendChild(icon);

      if(item.text) {
        var textNode = document.createTextNode(item.text);
        button.appendChild(textNode);
      }
      button.addEventListener(item.action.type, function(event) {
        injector.invoke(item.action.handler, { event: event });
      });

      menuDiv.appendChild(button);
    });
    var brand = document.createElement('div');
    brand.setAttribute('class', 'djs-menu-brand');
    menuDiv.appendChild(brand);
    return menuDiv;
  }
}

Diagram.plugin('standardPalette', [ 'config', 'eventBus', 'canvas', 'paletteDragDrop', 'injector',  StandardPalette ]);

module.exports = StandardPalette;