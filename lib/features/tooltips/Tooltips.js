'use strict';

var isString = require('lodash/lang/isString'),
    assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

var domify = require('min-dom/lib/domify'),
    domAttr = require('min-dom/lib/attr'),
    domClasses = require('min-dom/lib/classes'),
    domRemove = require('min-dom/lib/remove'),
    domDelegate = require('min-dom/lib/delegate');


// document wide unique tooltip ids
var ids = new (require('../../util/IdGenerator'))('tt');


function createRoot(parent) {
  var root = domify('<div class="djs-tooltip-container" style="position: absolute; width: 0; height: 0;" />');
  parent.insertBefore(root, parent.firstChild);

  return root;
}


function setPosition(el, x, y) {
  assign(el.style, { left: x + 'px', top: y + 'px' });
}

function setVisible(el, visible) {
  el.style.display = visible === false ? 'none' : '';
}


var tooltipClass = 'djs-tooltip',
    tooltipSelector = '.' + tooltipClass;

/**
 * A service that allows users to render tool tips on the diagram.
 *
 * The tooltip service will take care of updating the tooltip positioning
 * during navigation + zooming.
 *
 * @example
 *
 * ```javascript
 *
 * // add a pink badge on the top left of the shape
 * tooltips.add({
 *   position: {
 *     x: 50,
 *     y: 100
 *   },
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or with optional life span
 * tooltips.add({
 *   position: {
 *     top: -5,
 *     left: -5
 *   },
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>',
 *   ttl: 2000
 * });
 *
 * // remove a tool tip
 * var id = tooltips.add(...);
 * tooltips.remove(id);
 * ```
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function Tooltips(eventBus, canvas) {

  this._eventBus = eventBus;
  this._canvas = canvas;

  this._ids = ids;

  this._tooltipDefaults = {
    show: {
      minZoom: 0.7,
      maxZoom: 5.0
    }
  };

  /**
   * Mapping tooltipId -> tooltip
   */
  this._tooltips = {};

  // root html element for all tooltips
  this._tooltipRoot = createRoot(canvas.getContainer());


  var self = this;

  domDelegate.bind(this._tooltipRoot, tooltipSelector, 'mousedown', function(event) {
    event.stopPropagation();
  });

  domDelegate.bind(this._tooltipRoot, tooltipSelector, 'mouseover', function(event) {
    self.trigger('mouseover', event);
  });

  domDelegate.bind(this._tooltipRoot, tooltipSelector, 'mouseout', function(event) {
    self.trigger('mouseout', event);
  });

  this._init();
}


Tooltips.$inject = [ 'eventBus', 'canvas' ];

module.exports = Tooltips;


/**
 * Adds a HTML tooltip to the diagram
 *
 * @param {Object}               tooltip   the tooltip configuration
 *
 * @param {String|DOMElement}    tooltip.html                 html element to use as an tooltip
 * @param {Object}               [tooltip.show]               show configuration
 * @param {Number}               [tooltip.show.minZoom]       minimal zoom level to show the tooltip
 * @param {Number}               [tooltip.show.maxZoom]       maximum zoom level to show the tooltip
 * @param {Object}               tooltip.position             where to attach the tooltip
 * @param {Number}               [tooltip.position.left]      relative to element bbox left attachment
 * @param {Number}               [tooltip.position.top]       relative to element bbox top attachment
 * @param {Number}               [tooltip.position.bottom]    relative to element bbox bottom attachment
 * @param {Number}               [tooltip.position.right]     relative to element bbox right attachment
 * @param {Number}               [tooltip.timeout=-1]
 *
 * @return {String}              id that may be used to reference the tooltip for update or removal
 */
Tooltips.prototype.add = function(tooltip) {

  if (!tooltip.position) {
    throw new Error('must specifiy tooltip position');
  }

  if (!tooltip.html) {
    throw new Error('must specifiy tooltip html');
  }

  var id = this._ids.next();

  tooltip = assign({}, this._tooltipDefaults, tooltip, {
    id: id
  });

  this._addTooltip(tooltip);

  if (tooltip.timeout) {
    this.setTimeout(tooltip);
  }

  return id;
};

Tooltips.prototype.trigger = function(action, event) {

  var node = event.delegateTarget || event.target;

  var tooltip = this.get(domAttr(node, 'data-tooltip-id'));

  if (!tooltip) {
    return;
  }

  if (action === 'mouseover' && tooltip.timeout) {
    this.clearTimeout(tooltip);
  }

  if (action === 'mouseout' && tooltip.timeout) {
    // cut timeout after mouse out
    tooltip.timeout = 1000;

    this.setTimeout(tooltip);
  }
};

/**
 * Get a tooltip with the given id
 *
 * @param {String} id
 */
Tooltips.prototype.get = function(id) {

  if (typeof id !== 'string') {
    id = id.id;
  }

  return this._tooltips[id];
};

Tooltips.prototype.clearTimeout = function(tooltip) {

  tooltip = this.get(tooltip);

  if (!tooltip) {
    return;
  }

  var removeTimer = tooltip.removeTimer;

  if (removeTimer) {
    clearTimeout(removeTimer);
    tooltip.removeTimer = null;
  }
};

Tooltips.prototype.setTimeout = function(tooltip) {

  tooltip = this.get(tooltip);

  if (!tooltip) {
    return;
  }

  this.clearTimeout(tooltip);

  var self = this;

  tooltip.removeTimer = setTimeout(function() {
    self.remove(tooltip);
  }, tooltip.timeout);
};

/**
 * Remove an tooltip with the given id
 *
 * @param {String} id
 */
Tooltips.prototype.remove = function(id) {

  var tooltip = this.get(id);

  if (tooltip) {
    domRemove(tooltip.html);
    domRemove(tooltip.htmlContainer);

    delete tooltip.htmlContainer;

    delete this._tooltips[tooltip.id];
  }
};


Tooltips.prototype.show = function() {
  setVisible(this._tooltipRoot);
};


Tooltips.prototype.hide = function() {
  setVisible(this._tooltipRoot, false);
};


Tooltips.prototype._updateRoot = function(viewbox) {
  var a = viewbox.scale || 1;
  var d = viewbox.scale || 1;

  var matrix = 'matrix(' + a + ',0,0,' + d + ',' + (-1 * viewbox.x * a) + ',' + (-1 * viewbox.y * d) + ')';

  this._tooltipRoot.style.transform = matrix;
  this._tooltipRoot.style['-ms-transform'] = matrix;
};


Tooltips.prototype._addTooltip = function(tooltip) {

  var id = tooltip.id,
      html = tooltip.html,
      htmlContainer,
      tooltipRoot = this._tooltipRoot;

  // unwrap jquery (for those who need it)
  if (html.get) {
    html = html.get(0);
  }

  // create proper html elements from
  // tooltip HTML strings
  if (isString(html)) {
    html = domify(html);
  }

  htmlContainer = domify('<div data-tooltip-id="' + id + '" class="' + tooltipClass + '" style="position: absolute">');

  htmlContainer.appendChild(html);

  if (tooltip.type) {
    domClasses(htmlContainer).add('djs-tooltip-' + tooltip.type);
  }

  if (tooltip.className) {
    domClasses(htmlContainer).add(tooltip.className);
  }

  tooltip.htmlContainer = htmlContainer;

  tooltipRoot.appendChild(htmlContainer);

  this._tooltips[id] = tooltip;

  this._updateTooltip(tooltip);
};


Tooltips.prototype._updateTooltip = function(tooltip) {

  var position = tooltip.position,
      htmlContainer = tooltip.htmlContainer;

  // update overlay html based on tooltip x, y

  setPosition(htmlContainer, position.x, position.y);
};


Tooltips.prototype._updateTooltipVisibilty = function(viewbox) {

  forEach(this._tooltips, function(tooltip) {
    var show = tooltip.show,
        htmlContainer = tooltip.htmlContainer,
        visible = true;

    if (show) {
      if (show.minZoom > viewbox.scale ||
          show.maxZoom < viewbox.scale) {
        visible = false;
      }

      setVisible(htmlContainer, visible);
    }
  });
};

Tooltips.prototype._init = function() {

  var self = this;

  // scroll/zoom integration

  function updateViewbox(viewbox) {
    self._updateRoot(viewbox);
    self._updateTooltipVisibilty(viewbox);

    self.show();
  }

  this._eventBus.on('canvas.viewbox.changing', function(event) {
    self.hide();
  });

  this._eventBus.on('canvas.viewbox.changed', function(event) {
    updateViewbox(event.viewbox);
  });
};
