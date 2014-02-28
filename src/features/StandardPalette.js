var Diagram = require('../Diagram'),
          _ = require('../util/underscore');

/**
 * @namespace djs
 */

/**
 * @class
 */
function StandardPalette(config, events, canvas, commandStack, injector) {
  'use strict';

  var xinc = 30;

  events.on('canvas.init', function(event) {
    init();
  });

  function init() {
    var menuConfig = config.menu || {};

    bootstrapMenus(menuConfig);

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
      button.addEventListener('click', function(event) {
        injector.inject(item.action, { event: event });
      });

      menuDiv.appendChild(button);
    });
    return menuDiv;
  }
}

Diagram.plugin('standardPalette', [ 'config', 'events', 'canvas', 'commandStack', 'injector', StandardPalette ]);

module.exports = StandardPalette;