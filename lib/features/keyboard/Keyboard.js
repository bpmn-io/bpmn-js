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
 * @param {Config} config
 * @param {EventBus} eventBus
 * @param {EditorActions} editorActions
 */
function Keyboard(config, eventBus, editorActions) {
  var self = this;

  this._config = config || {};
  this._eventBus = eventBus;
  this._editorActions = editorActions;

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
  'editorActions'
];

module.exports = Keyboard;


Keyboard.prototype.bind = function(node) {
  // make sure that the keyboard is only bound once to the DOM
  this.unbind();

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

  var listeners = this._listeners;

  var editorActions = this._editorActions,
      config = this._config;

  // init default listeners

  // undo
  // (CTRL|CMD) + Z
  function undo(key, modifiers) {

    if (isCmd(modifiers) && !isShift(modifiers) && key === 90) {
      editorActions.trigger('undo');

      return true;
    }
  }

  // redo
  // CTRL + Y
  // CMD + SHIFT + Z
  function redo(key, modifiers) {

    if (isCmd(modifiers) && (key === 89 || (key === 90 && isShift(modifiers)))) {
      editorActions.trigger('redo');

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
      editorActions.trigger('stepZoom', { value: 1 });

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
      editorActions.trigger('stepZoom', { value: -1 });

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
      editorActions.trigger('zoom', { value: 1 });

      return true;
    }
  }

  // delete selected element
  // DEL
  function removeSelection(key, modifiers) {

    if (key === 46) {
      editorActions.trigger('removeSelection');

      return true;
    }
  }

  // move canvas left
  // left arrow
  //
  // 37 = Left
  // 38 = Up
  // 39 = Right
  // 40 = Down
  function moveCanvas(key, modifiers) {

    if ([37, 38, 39, 40].indexOf(key) >= 0) {

      var opts = {
        invertY: config.invertY,
        speed: (config.speed || 50),
      };

      switch(key) {
        case 37:    // Left
          opts.direction = 'left';
          break;
        case 38:    // Up
          opts.direction = 'up';
          break;
        case 39:    // Right
          opts.direction = 'right';
          break;
        case 40:    // Down
          opts.direction = 'down';
          break;
      }

      editorActions.trigger('moveCanvas', opts);

      return true;
    }
  }

  listeners.push(undo);
  listeners.push(redo);
  listeners.push(removeSelection);
  listeners.push(zoomIn);
  listeners.push(zoomOut);
  listeners.push(zoomDefault);
  listeners.push(moveCanvas);
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
