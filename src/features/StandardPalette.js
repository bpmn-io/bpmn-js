var Diagram = require('../Diagram');

/**
 * @namespace djs
 */

/**
 * @class
 */
function StandardPalette(config, events, canvas, commandStack) {
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
      var body = document.querySelector('body');
      body.appendChild(menuContainer);
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

    var addButton = document.createElement('button');
    addButton.setAttribute('class', 'djs-addshape');
    addButton.innerHTML = 'Add shape';
    addButton.addEventListener('click',
      function() {
        xinc = xinc + 10;
        commandStack.execute('addShape', {x: xinc, y:30, width: 100, height: 80 });
      }, false);
    menuDiv.appendChild(addButton);

    var undoButton = document.createElement('button');
    undoButton.setAttribute('class', 'djs-undo');
    undoButton.innerHTML = 'Undo';
    undoButton.addEventListener('click',
      function() {
        commandStack.undo();
      }, false);
    menuDiv.appendChild(undoButton);
    return menuDiv;
  }
}

Diagram.plugin('standardPalette', [ 'config', 'events', 'canvas', 'commandStack', StandardPalette ]);

module.exports = StandardPalette;