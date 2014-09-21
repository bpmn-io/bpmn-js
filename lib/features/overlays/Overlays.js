'use strict';

var _ = require('lodash'),
    $ = require('jquery');

// document wide unique overlay ids
var ids = new (require('../../util/IdGenerator'))('ov');


/**
 * A plugin that allows users to attach overlays to diagram elements.
 *
 * The overlay service will take care of overlay positioning during updates.
 *
 * @class
 *
 * @example
 *
 * // add a pink badge on the top left of the shape
 * overlays.add(someShape, {
 *   position: {
 *     top: -5,
 *     left: -5
 *   }
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or add via shape id
 *
 * overlays.add('some-element-id', {
 *   position: {
 *     top: -5,
 *     left: -5
 *   }
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or add with optional type
 *
 * overlays.add(someShape, 'badge', {
 *   position: {
 *     top: -5,
 *     left: -5
 *   }
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 *
 * // remove an overlay
 *
 * var id = overlays.add(...);
 * overlays.remove(id);
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementRegistry} elementRegistry
 */
function Overlays(config, eventBus, canvas, elementRegistry) {

  this._eventBus = eventBus;
  this._canvas = canvas;
  this._elementRegistry = elementRegistry;

  this._ids = ids;

  this._overlayDefaults = {
    show: {
      trigger: 'automatic',
      minZoom: 0.7,
      maxZoom: 5.0
    }
  };

  /**
   * Mapping overlay-id > overlay
   */
  this._overlays = {};

  /**
   * Mapping element-id > overlay container
   */
  this._overlayContainers = {};

  // root html element for all overlays
  this._overlayRoot = $('<div class="djs-overlay-container" />')
                        .css({ position: 'absolute', width: 0, height: 0 })
                        .prependTo(canvas.getContainer());

  this._init(config);
}


Overlays.$inject = [ 'config.overlays', 'eventBus', 'canvas', 'elementRegistry' ];

module.exports = Overlays;


/**
 * Returns the overlay with the specified id or a list of overlays
 * for an element with a given type.
 *
 * @example
 *
 * // return the single overlay with the given id
 * overlays.get('some-id');
 *
 * // return all overlays for the shape
 * overlays.get({ element: someShape });
 *
 * // return all overlays on shape with type 'badge'
 * overlays.get({ element: someShape, type: 'badge' });
 *
 * // shape can also be specified as id
 * overlays.get({ element: 'element-id', type: 'badge' });
 *
 *
 * @param {Object} filter
 * @param {String} [filter.id]
 * @param {String|djs.model.Base} [filter.element]
 * @param {String} [filter.type]
 *
 * @return {Object|Array<Object>} the overlay(s)
 */
Overlays.prototype.get = function(filter) {

  if (_.isString(filter)) {
    filter = { id: filter };
  }

  if (filter.element) {
    var container = this._getOverlayContainer(filter.element, true);

    // return a list of overlays when filtering by element (+type)
    if (container) {
      return filter.type ? _.filter(container.overlays, { type: filter.type }) : _.clone(container.overlays);
    } else {
      return [];
    }
  } else
  if (filter.type) {
    return _.filter(this._overlays, { type: filter.type });
  } else {
    // return single element when filtering by id
    return filter.id ? this._overlays[filter.id] : null;
  }
};

/**
 * Adds a HTML overlay to an element.
 *
 * @param {String|djs.model.Base}   element   attach overlay to this shape
 * @param {String}                  [type]    optional type to assign to the overlay
 * @param {Object}                  overlay   the overlay configuration
 *
 * @param {String|DOMElement}       overlay.html                      html element to use as an overlay
 * @param {Object}                  [overlay.show]                    show configuration
 * @param {Number}                  overlay.show.minZoom              minimal zoom level to show the overlay
 * @param {Number}                  overlay.show.maxZoom              maximum zoom level to show the overlay
 * @param {String}                  [overlay.show.trigger=automatic]  automatic or manual (user triggers show)
 * @param {Object}                  overlay.show.position             where to attach the overlay
 * @param {Number}                  [overlay.show.position.left]      relative to element bbox left attachment
 * @param {Number}                  [overlay.show.position.top]       relative to element bbox top attachment
 * @param {Number}                  [overlay.show.position.bottom]    relative to element bbox bottom attachment
 * @param {Number}                  [overlay.show.position.right]     relative to element bbox right attachment
 *
 * @return {String}                 id that may be used to reference the overlay for update or removal
 */
Overlays.prototype.add = function(element, type, overlay) {

  if (_.isObject(type)) {
    overlay = type;
    type = null;
  }

  if (_.isString(element)) {
    element = this._elementRegistry.getById(element);
  }

  if (element.waypoints) {
    throw new Error('overlays for connections are not supported');
  }

  if (!overlay.position) {
    throw new Error('must specifiy overlay position');
  }

  if (!overlay.html) {
    throw new Error('must specifiy overlay html');
  }

  if (!element) {
    throw new Error('invalid element specified');
  }

  var id = this._ids.next();

  overlay = _.extend({}, this._overlayDefaults, overlay, {
    id: id,
    type: type,
    element: element,
    html: $(overlay.html)
  });

  this._addOverlay(overlay);

  return id;
};


/**
 * Remove an overlay with the given id or all overlays matching the given filter.
 *
 * @see Overlays#get for filter options.
 *
 * @param {String} [id]
 * @param {Object} [filter]
 */
Overlays.prototype.remove = function(filter) {

  var overlays = this.get(filter) || [];

  if (!_.isArray(overlays)) {
    overlays = [ overlays ];
  }

  var self = this;

  _.forEach(overlays, function(overlay) {

    var container = self._getOverlayContainer(overlay.element, true);

    if (overlay) {
      overlay.html.remove();
      overlay.htmlContainer.remove();

      delete overlay.htmlContainer;
      delete overlay.element;

      delete self._overlays[overlay.id];
    }

    if (container) {
      var idx = container.overlays.indexOf(overlay);
      if (idx !== -1) {
        container.overlays.splice(idx, 1);
      }
    }
  });

};


Overlays.prototype.show = function() {
  this._overlayRoot.show();
};


Overlays.prototype.hide = function() {
  this._overlayRoot.hide();
};


Overlays.prototype._updateOverlayContainer = function(container) {
  var element = container.element,
      html = container.html;

  // update container left,top according to the elements x,y coordinates
  // this ensures we can attach child elements relative to this container

  // TODO(nre): update according to element bbox (for connections)
  html.css({ left: element.x, top: element.y });
};


Overlays.prototype._updateOverlay = function(overlay) {

  var position = overlay.position,
      htmlContainer = overlay.htmlContainer,
      element = overlay.element;

  // update overlay html relative to shape because
  // it is already positioned on the element

  // update relative
  var left = position.left,
      top = position.top;

  if (position.right !== undefined) {
    left = position.right * -1 + element.width;
  }

  if (position.bottom !== undefined) {
    top = position.bottom * -1 + element.height;
  }

  htmlContainer.css({ left: left || 0, top: top || 0 });
};


Overlays.prototype._createOverlayContainer = function(element) {
  var html = $('<div />')
                .addClass('djs-overlays')
                .addClass('djs-overlays-' + element.id)
                .css({ position: 'absolute' });

  html.appendTo(this._overlayRoot);

  var container = {
    html: html,
    element: element,
    overlays: []
  };

  this._updateOverlayContainer(container);

  return container;
};


Overlays.prototype._updateRoot = function(viewbox) {
  var a = viewbox.scale || 1;
  var d = viewbox.scale || 1;
  var e = viewbox.x || 0;
  var f = viewbox.y || 0;

  var matrix = 'matrix(' + a + ',0,0,' + d + ',' + (-1 * viewbox.x * a) + ',' + (-1 * viewbox.y * d) + ')';

  this._overlayRoot.css('transform', matrix);
};


Overlays.prototype._getOverlayContainer = function(element, raw) {
  var id = (element && element.id) || element;

  var container = this._overlayContainers[id];
  if (!container && !raw) {
    container = this._overlayContainers[id] = this._createOverlayContainer(element);
  }

  return container;
};


Overlays.prototype._addOverlay = function(overlay) {

  var id = overlay.id,
      element = overlay.element;

  var container = this._getOverlayContainer(element);

  var htmlContainer = $('<div>', {
    id: id,
    'class': 'djs-overlay'
  }).css({ position: 'absolute' }).append(overlay.html);

  if (overlay.type) {
    htmlContainer.addClass('djs-overlay-' + overlay.type);
  }

  overlay.htmlContainer = htmlContainer;

  container.overlays.push(overlay);
  container.html.append(htmlContainer);

  this._overlays[id] = overlay;

  this._updateOverlay(overlay);
};

Overlays.prototype._updateOverlayVisibilty = function(viewbox) {

  _.forEach(this._overlays, function(overlay) {
    if (overlay.show) {
      if (overlay.show.minZoom > viewbox.scale ||
          overlay.show.maxZoom < viewbox.scale) {
        overlay.htmlContainer.hide();
      } else {
        overlay.htmlContainer.show();
      }
    }
  });
};

Overlays.prototype._init = function(config) {

  var eventBus = this._eventBus;

  var self = this;


  // scroll/zoom integration

  var updateViewbox = function(viewbox) {
    self._updateRoot(viewbox);
    self._updateOverlayVisibilty(viewbox);

    self.show();
  };

  if (!config || config.deferUpdate !== false) {
    updateViewbox = _.debounce(updateViewbox, 300);
  }

  eventBus.on('canvas.viewbox.changed', function(event) {
    self.hide();
    updateViewbox(event.viewbox);
  });


  // remove integration

  eventBus.on([ 'shape.remove', 'connection.remove' ], function(e) {
    var overlays = self.get({ element: e.element });

    _.forEach(overlays, function(o) {
      self.remove(o.id);
    });
  });


  // move integration

  eventBus.on([
    'commandStack.shape.move.executed',
    'commandStack.shape.move.reverted'
  ], function(e) {
    var element = e.context.shape;

    var container = self._getOverlayContainer(element, true);
    if (container) {
      self._updateOverlayContainer(container);
    }
  });


  // marker integration, simply add them on the overlays as classes, too.

  eventBus.on('element.marker.update', function(e) {
    var container = self._getOverlayContainer(e.element, true);
    if (container) {
      container.html[e.add ? 'addClass' : 'removeClass'](e.marker);
    }
  });
};