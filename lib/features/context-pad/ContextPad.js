'use strict';

var _ = require('lodash');

var ELEMENT_WIDTH = 18;
var MAX_COLS = 1;


var style =  {
  DEFAULT_OPACITY: 0.3,
  HOVER_OPACITY: 1.0,
  HOVER_BACKGROUND: 'rgb(233, 231, 193)'
};


/**
 * A context pad that displays element specific, contextual actions next
 * to a diagram element.
 *
 * @param {EventBus} eventBus
 */
function ContextPad(eventBus, canvas) {

  this._providers = [];

  this._eventBus = eventBus;
  this._canvas = canvas;

  this._pad = null;
  this._context = null;

  this._registerEvents();
}

ContextPad.$inject = [ 'eventBus', 'canvas' ];

/**
 * Registers events needed for interaction with other components
 */
ContextPad.prototype._registerEvents = function() {

  var self = this,
      eventBus = this._eventBus;

  eventBus.on('canvas.viewbox.changed', function(e) {
    self.close();
  });

  eventBus.on('canvas.init', function(e) {
    self._paper = e.paper;
  });

  eventBus.on('shape.hover', function(e) {
    self.open(e.element);
  });

  eventBus.on('shape.out', function(e) {
    self._asyncClosePad();
  });

  eventBus.on('selection.changed', function(e) {
    var newSelection = e.newSelection;

    if (newSelection.length === 1) {
      self.open(newSelection[0]);
      self.getPad().attr('opacity', style.HOVER_OPACITY);
    }
  });
};


/**
 * Register a provider with the context pad
 *
 * @param  {ContextPadProvider} provider
 */
ContextPad.prototype.registerProvider = function(provider) {
  this._providers.push(provider);
};


ContextPad.prototype.getPad = function() {

  if (!this._pad) {
    var self = this,
        pad = this._pad = this._paper.group();

    pad.mouseover(function(e) {
      self._context.open = true;
      pad.attr('opacity', style.HOVER_OPACITY);
    });

    pad.mouseout(function(e) {
      self._asyncClosePad();
      pad.attr('opacity', style.DEFAULT_OPACITY);
    });
  }

  return this._pad;
};


/**
 * Returns the context pad entries for a given element
 *
 * @param {ElementDescriptor} element
 *
 * @return {Array<ContextPadEntryDescriptor>} list of entries
 */
ContextPad.prototype.getEntries = function(element) {
  var entries = {};

  // loop through all providers and their entries.
  // group entries by id so that overriding an entry is possible
  _.forEach(this._providers, function(provider) {
    var e = provider.getContextPadEntries(element);

    _.forEach(e, function(entry, id) {
      entries[id] = entry;
    });
  });

  return entries;
};


/**
 * Trigger an action available on the opened context pad
 *
 * @param  {String} id the identifier of the action
 * @param  {Event} event
 */
ContextPad.prototype.triggerAction = function(id, event) {

  var context = this._context;

  if (!context) {
    throw new Error('context pad not open');
  }

  var entry = context.entries[id];
  entry.action(event, context.element);
};


/**
 * Open the context pad for the given element
 *
 * @param {ElementDescriptor} element
 */
ContextPad.prototype.open = function(element) {
  var context = this._context;

  if (!context || context.element !== element) {

    this._context = context = {
      element: element,
      entries: this.getEntries(element)
    };

    this._showPad(context);
  }

  context.open = true;
};


/**
 * Close the context pad
 */
ContextPad.prototype.close = function() {
  this.getPad().attr({
    visibility: 'hidden'
  });
  this._context = null;
};


/**
 * Return the element the context pad is currently opened for,
 * if it is opened.
 *
 * @example
 *
 * contextPad.open(shape1);
 *
 * if (contextPad.isOpen()) {
 *   // yes, we are open
 * }
 *
 * @return {ElementDescriptor}
 */
ContextPad.prototype.isOpen = function() {
  return this._context && this._context.element;
};

ContextPad.prototype._asyncClosePad = function() {
  var self = this;

  if (!this._context) {
    return;
  }

  this._context.open = false;

  setTimeout(function() {
    if (self._context && !self._context.open) {
      self.close();
    }
  }, 500);
};

ContextPad.prototype._showPad = function(context) {

  var self = this,
      pad = this.getPad(),
      canvas = this._canvas,
      entries = context.entries,
      element = context.element;

  var col = 0,
      row = 0;

  // clear pad
  _.forEach(pad.selectAll('.entry'), function(e) {
    e.remove();
  });


  // (re-)draw pad
  _.forEach(entries, function(entry, id) {

    var e = pad.group().addClass('entry'),
        background,
        control;

    background = e.rect(-1, -1, ELEMENT_WIDTH + 2, ELEMENT_WIDTH + 2, 5, 5);

    if (entry.imageUrl) {
      control = e.image(entry.imageUrl, 0, 0, ELEMENT_WIDTH, ELEMENT_WIDTH);
    } else {
      control = e.circle(ELEMENT_WIDTH / 2, ELEMENT_WIDTH / 2, ELEMENT_WIDTH / 2).attr('fill', 'fuchsia');
    }

    background.attr({
      fill: style.HOVER_BACKGROUND,
      opacity: 0.1
    });

    e.mouseover(function() {
      background.attr({
        opacity: 1.0,
      });
    }).mouseout(function() {
      background.attr({
        opacity: 0.1,
      });
    });

    control.click(function(e) {
      self.triggerAction(id, e);

      e.preventDefault();
      e.stopPropagation();
    });

    e.append(control);

    if (col === MAX_COLS) {
      col = 0;
      row++;
    }

    e.translate((ELEMENT_WIDTH + 4) * col, (ELEMENT_WIDTH + 4) * row);
    col++;
  });

  var editBG = pad.rect(-5, -5, (ELEMENT_WIDTH + 5) * (col + 1) + 10, (ELEMENT_WIDTH + 5) * (row + 1) + 10, 5, 5)
                  .attr({ fill: 'white', opacity: 0.2, 'class': 'entry' });

  pad.prepend(editBG);

  var bbox = canvas.getAbsoluteBBox(element);

  // TODO(nre): append event rect
  pad.translate(bbox.width + bbox.x + 5, bbox.y)
      .attr({
        visibility: 'visible',
        opacity: style.DEFAULT_OPACITY
      });
};


module.exports = ContextPad;