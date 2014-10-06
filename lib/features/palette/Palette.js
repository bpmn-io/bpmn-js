'use strict';

var _ = require('lodash'),
    $ = require('jquery');

var openPath = '<svg height="25" width="25" style="vertical-align:middle;">' +
     '<path '+
     '  style="fill:#333;stroke:#555;stroke-width:0.99900001;stroke-linecap:round;stroke-miterlimit:4;"' +
     '  d="M 10.5 2.5 C 10.223 2.5 10 2.723 10 3 L 10 10 L 3 10 C 2.723 10 2.5 10.223 2.5 10.5 L 2.5 14.5 C 2.5 '+
     '  14.777 2.723 15 3 15 L 10 15 L 10 22 C 10 22.277 10.223 22.5 10.5 22.5 L 14.5 22.5 C 14.777 22.5 15 22.277 ' +
     '  15 22 L 15 15 L 22 15 C 22.277 15 22.5 14.777 22.5 14.5 L 22.5 10.5 C 22.5 10.223 22.277 10 22 10 L 15 ' +
     '  10 L 15 3 C 15 2.723 14.777 2.5 14.5 2.5 L 10.5 2.5 z " />' +
     '</svg>';

var closePath = '<svg height="25" width="25" style="vertical-align:middle;">' +
     '<rect ' +
       'style="fill:#333;stroke:#555;stroke-width:0.99900001;stroke-linecap:round;stroke-miterlimit:4;" ' +
       'width="20" ' +
       'height="5" ' +
       'x="2.5" ' +
       'y="12" ' +
       'rx="0.5" ' +
       'ry="0.5" />' +
     '</svg>';


/**
 * A palette containing BPMN elements.
 */
function Palette(eventBus, canvas) {

  var paletteStyle = {
    position: 'absolute',
    width: 30,
    height: 30,
    visible: false,
    top: '5px',
    left: '5px',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
    borderRadius: '2px',
    transition: 'height 1.25s',
    overflow: 'hidden'
  };

  this._open       = false;
  this._entryCount = 0;
  this._providers  = [];
  this._eventBus   = eventBus;
  this._canvas     = canvas;
  this._palette    = $('<div class="diagram-palette" class="closed" />')
                      .css(paletteStyle);

  var self = this;

  eventBus.on('canvas.init', function() {
    self._init();
  });
}

Palette.$inject = [ 'eventBus', 'canvas' ];

module.exports = Palette;


/**
 * Register a provider with the palette
 *
 * @param  {PaletteProvider} provider
 */
Palette.prototype.registerProvider = function(provider) {

  this._providers.push(provider);

  // if first provider and palette is already initialized add to diagram
  if (this._providers.length === 1 &&
     !this._palleteAppended) {

    var palette = this._palette;
    var container = this._canvas.getContainer();

    $(container).prepend(palette);
    this._palleteAppended = true;
  }
};


/**
 * Returns the palette entries for a given element
 *
 * @return {Array<PaletteEntryDescriptor>} list of entries
 */
Palette.prototype.getEntries = function() {

  var entries = {};
  var self = this;
  this._entryCount = 0;

  // loop through all providers and their entries.
  // group entries by id so that overriding an entry is possible
  _.forEach(this._providers, function(provider) {
    var e = provider.getPaletteEntries();

    _.forEach(e, function(entry, id) {
      self._entryCount++;
      entries[id] = entry;
    });
  });

  return entries;
};


/**
 * Initialize
 */
Palette.prototype._init = function() {

  var self = this;
  var palette = this._palette;

  // create palette toggle button
  this._toggleOpen   = $('<div class="palette-toggle-open" style="width: 30px; height: 30px;' +
                          'line-height:23px; text-align: center; display:none;" />')
                          .append(closePath);
  this._toggleClosed = $('<div class="palette-toggle-closed" style="width: 30px; height: 30px; ' +
                          'line-height:26px; text-align: center; display: block;" />')
                          .append(openPath);
  this._palette.append(this._toggleOpen);
  this._toggleOpen.on('click', function() {
    self.tooglePalette();
  });
  this._palette.append(this._toggleClosed);
  this._toggleClosed.on('click', function() {
    self.tooglePalette();
  });

  //add palette entries
  this._paletteEntries = $('<div class="diagram-palette-entries" style="display:block;" />');

  this._palette.append(this._paletteEntries);

  var container = this._canvas.getContainer();

  // Only append if already a provider is registered
  if (this._providers.length > 0) {
    $(container).prepend(palette);
    this._palleteAppended = true;
  }
};

Palette.prototype._updateAndOpen = function() {

  var svgStart = '<svg height="25" width="25" style="display: block; margin: auto;">';
  var svgEnd   = '</svg>';

  var entries = this.getEntries();

  var html = $(this._paletteEntries).html('');

  var self = this;

  _.forEach(entries, function(entry, id) {
    var control = $(entry.html ||
                    '<div class="entry" draggable="true" style="width:30px"></div>').attr('data-action', id);

    control.on('dragstart', function(event) {
      event.preventDefault();
    });

    var grouping = entry.group || 'default';

    var container = html.find('[data-group=' + grouping + ']');
    if (!container.length) {
      container = $('<div class="group"></div>').attr('data-group', grouping).appendTo(html);
    }

    control.appendTo(container);

    if (entry.className) {
      control.addClass(entry.className);
    }

    if (entry.img) {
      control.append(svgStart + entry.img + svgEnd);
    } else if (entry.alt) {
      control.text(entry.alt);
    }

    if (entry.action) {
      control.on('click', function(event) {
        entry.action();
      });
    }
  });

  html.addClass('open');
  this._open = true;
};


/**
 * Close the palette
 */
Palette.prototype.close = function() {

    if (this._open) {
      $(this._palette).removeClass('open');
      $(this._palette).css( 'height', '30px' );
    }
    this._toggleOpen.css({
      display: 'none'
    });
    this._toggleClosed.css({
      display: 'block'
    });

    this._open = false;
};


/**
 * Open the palette
 */
Palette.prototype.open = function() {

  if (!this._open) {

    this._updateAndOpen();
    var height = (this._entryCount * 30) || 0;

    $(this._palette).addClass('open');
    $(this._palette).css( 'height', height + 'px' );
  }

  this._toggleOpen.css({
    display: 'block'
  });
  this._toggleClosed.css({
    display: 'none'
  });
};

/**
 * Return true if the palette is opened.
 *
 * @example
 *
 * palette.open();
 *
 * if (palette.isOpen()) {
 *   // yes, we are open
 * }
 *
 * @return {boolean} true if palette is opened
 */
Palette.prototype.isOpen = function() {
  return this._open;
};


Palette.prototype.getPaletteContainer = function() {
  return this._palette;
};

Palette.prototype.tooglePalette = function() {
  if(this._open) {
    this.close();
  } else {
    this.open();
  }
};
