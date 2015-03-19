'use strict';

var domEvent = require('min-dom/lib/event'),
    stopEvent = require('./Event').stopEvent;

function trap(event) {
  stopEvent(event);

  toggle(false);
}

function toggle(active) {
  domEvent[active ? 'bind' : 'unbind'](document.body, 'click', trap, true);
}

/**
 * Installs a click trap that prevents a ghost click following a dragging operation.
 *
 * @return {Function} a function to immediately remove the installed trap.
 */
function install() {

  toggle(true);

  return function() {
    toggle(false);
  };
}

module.exports.install = install;