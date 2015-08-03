'use strict';

var domEvent = require('min-dom/lib/event'),
    domMatches = require('min-dom/lib/matches');

/**
 * A keyboard abstraction that may be activated and
 * deactivated by users at will, consuming key events
 * and triggering diagram actions.
 *
 * The implementation fires the following key events that allow
 * other components to hook into key handling:
 *
 *  - keyboard.bind
 *  - keyboard.unbind
 *  - keyboard.init
 *  - keyboard.destroy
 *
 * All events contain the fields (node, listeners).
 *
 * A default binding for the keyboard may be specified via the
 * `keyboard.bindTo` configuration option.
 *
 * @param {EventBus} eventBus
 * @param {CommandStack} commandStack
 * @param {Modeling} modeling
 * @param {Selection} selection
 */
function Keyboard(config, eventBus, commandStack, modeling, selection, zoomScroll, canvas) {

  var self = this;

  this._commandStack = commandStack;
  this._modeling = modeling;
  this._selection = selection;
  this._eventBus = eventBus;
  this._zoomScroll = zoomScroll;
  this._canvas = canvas;

  this._listeners = [];

  // our key handler is a singleton that passes
  // (keycode, modifiers) to each listener.
  //
  // listeners must indicate that they handled a key event
  // by returning true. This stops the event propagation.
  //
  this._keyHandler = function(event) {

    var i, l,
        target = event.target,
        listeners = self._listeners,
        code = event.keyCode || event.charCode || -1;

    if (domMatches(target, 'input, textarea')) {
      return;
    }

    for (i = 0; !!(l = listeners[i]); i++) {
      if (l(code, event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  // properly clean dom registrations
  eventBus.on('diagram.destroy', function() {
    self._fire('destroy');

    self.unbind();
    self._listeners = null;
  });

  eventBus.on('diagram.init', function() {
    self._fire('init');

    if (config && config.bindTo) {
      self.bind(config.bindTo);
    }
  });

  this._init();
}

Keyboard.$inject = [
  'config.keyboard',
  'eventBus',
  'commandStack',
  'modeling',
  'selection',
  'zoomScroll',
  'canvas'];

module.exports = Keyboard;


Keyboard.prototype.bind = function(node) {
  this._node = node;

  // bind key events
  domEvent.bind(node, 'keydown', this._keyHandler, true);

  this._fire('bind');
};

Keyboard.prototype.getBinding = function() {
  return this._node;
};

Keyboard.prototype.unbind = function() {
  var node = this._node;

  if (node) {
    this._fire('unbind');

    // unbind key events
    domEvent.unbind(node, 'keydown', this._keyHandler, true);
  }

  this._node = null;
};


Keyboard.prototype._fire = function(event) {
  this._eventBus.fire('keyboard.' + event, { node: this._node, listeners: this._listeners });
};

Keyboard.prototype._init = function() {

  var listeners = this._listeners,
      commandStack = this._commandStack,
      modeling = this._modeling,
      selection = this._selection,
      zoomScroll = this._zoomScroll,
      canvas = this._canvas;

  // init default listeners

  // undo
  // (CTRL|CMD) + Z
  function undo(key, modifiers) {

    if (isCmd(modifiers) && !isShift(modifiers) && key === 90) {
      commandStack.undo();

      return true;
    }
  }

  // redo
  // CTRL + Y
  // CMD + SHIFT + Z
  function redo(key, modifiers) {

    if (isCmd(modifiers) && (key === 89 || (key === 90 && isShift(modifiers)))) {
      commandStack.redo();

      return true;
    }
  }

  /**
   * zoom in one step
   * CTRL + +
   *
   * 107 = numpad plus
   * 187 = regular plus
   * 171 = regular plus in Firefox (german keyboard layout)
   *  61 = regular plus in Firefox (US keyboard layout)
   */
  function zoomIn(key, modifiers) {

    if ((key === 107 || key === 187 || key === 171 || key === 61) && isCmd(modifiers)) {

      zoomScroll.stepZoom(1);

      return true;
    }
  }

  /**
   * zoom out one step
   * CTRL + -
   *
   * 109 = numpad minus
   * 189 = regular minus
   * 173 = regular minus in Firefox (US and german keyboard layout)
   */
  function zoomOut(key, modifiers) {

    if ((key === 109 || key === 189 || key === 173)  && isCmd(modifiers)) {

      zoomScroll.stepZoom(-1);

      return true;
    }
  }

  /**
   * zoom to the default level
   * CTRL + 0
   *
   * 96 = numpad zero
   * 48 = regular zero
   */
  function zoomDefault(key, modifiers) {

    if ((key === 96 || key === 48) && isCmd(modifiers)) {

      canvas.zoom(1);

      return true;
    }
  }

  // delete selected element
  // DEL
  function remove(key, modifiers) {

    if (key === 46) {

      var selectedElements = selection.get();

      if (selectedElements.length) {
        modeling.removeElements(selectedElements.slice());
      }

      return true;
    }
  }

  listeners.push(undo);
  listeners.push(redo);
  listeners.push(remove);
  listeners.push(zoomIn);
  listeners.push(zoomOut);
  listeners.push(zoomDefault);
};


/**
 * Add a listener function that is notified with (key, modifiers) whenever
 * the keyboard is bound and the user presses a key.
 *
 * @param {Function} listenerFn
 */
Keyboard.prototype.addListener = function(listenerFn) {
  this._listeners.push(listenerFn);
};

Keyboard.prototype.hasModifier = hasModifier;
Keyboard.prototype.isCmd = isCmd;
Keyboard.prototype.isShift = isShift;


function hasModifier(modifiers) {
  return (modifiers.ctrlKey || modifiers.metaKey || modifiers.shiftKey || modifiers.altKey);
}

function isCmd(modifiers) {
  return modifiers.ctrlKey || modifiers.metaKey;
}

function isShift(modifiers) {
  return modifiers.shiftKey;
}
