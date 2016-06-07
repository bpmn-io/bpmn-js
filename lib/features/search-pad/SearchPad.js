'use strict';

var domClear = require('min-dom/lib/clear'),
    domDelegate = require('min-dom/lib/delegate'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    domAttr = require('min-dom/lib/attr'),
    domify = require('min-dom/lib/domify');

var getBoundingBox = require('../../util/Elements').getBBox;


/**
 * Provides searching infrastructure
 */
function SearchPad(canvas, eventBus, overlays, selection) {
  this._open = false;
  this._results = [];
  this._eventMaps = [];

  this._canvas = canvas;
  this._eventBus = eventBus;
  this._overlays = overlays;
  this._selection = selection;

  // setup elements
  this._container = domify(SearchPad.BOX_HTML);
  this._searchInput = domQuery(SearchPad.INPUT_SELECTOR, this._container);
  this._resultsContainer = domQuery(SearchPad.RESULTS_CONTAINER_SELECTOR, this._container);

  // attach search pad
  this._canvas.getContainer().appendChild(this._container);

  // cleanup on destroy
  eventBus.on([ 'canvas.destroy', 'diagram.destroy' ], this.close, this);
}


SearchPad.$inject = [
  'canvas',
  'eventBus',
  'overlays',
  'selection'
];


/**
 * Binds and keeps track of all event listereners
 */
SearchPad.prototype._bindEvents = function() {
  var self = this;

  function listen(el, selector, type, fn) {
    self._eventMaps.push({
      el: el,
      type: type,
      listener: domDelegate.bind(el, selector, type, fn)
    });
  }

  // close search on clicking anywhere outside
  listen(document, 'html', 'click', function(e) {
    self.close();
  }, true);

  // stop event from propagating and closing search
  // focus on input
  listen(this._container, SearchPad.INPUT_SELECTOR, 'click', function(e) {
    e.stopPropagation();
    e.delegateTarget.focus();
  });

  // preselect result on hover
  listen(this._container, SearchPad.RESULT_SELECTOR, 'mouseover', function(e) {
    e.stopPropagation();
    self._scrollToNode(e.delegateTarget);
    self._preselect(e.delegateTarget);
  });

  // selects desired result on mouse click
  listen(this._container, SearchPad.RESULT_SELECTOR, 'click', function(e) {
    e.stopPropagation();
    self._select(e.delegateTarget);
  });

  // prevent cursor in input from going left and right when using up/down to
  // navigate results
  listen(this._container, SearchPad.INPUT_SELECTOR, 'keydown', function(e) {
    // up
    if (e.keyCode === 38) {
      e.preventDefault();
    }

    // down
    if (e.keyCode === 40) {
      e.preventDefault();
    }
  });

  // handle keyboard input
  listen(this._container, SearchPad.INPUT_SELECTOR, 'keyup', function(e) {
    // escape
    if (e.keyCode === 27) {
      return self.close();
    }

    // enter
    if (e.keyCode === 13) {
      var selected = self._getCurrentResult();

      return selected ? self._select(selected) : self.close();
    }

    // up
    if (e.keyCode === 38) {
      return self._scrollToDirection(true);
    }

    // down
    if (e.keyCode === 40) {
      return self._scrollToDirection();
    }

    // left && right
    // do not search while navigating text input
    if (e.keyCode === 37 || e.keyCode === 39) {
      return;
    }

    // anything else
    self._search(e.delegateTarget.value);
  });
};


/**
 * Unbinds all previously established listeners
 */
SearchPad.prototype._unbindEvents = function() {
  this._eventMaps.forEach(function(m) {
    domDelegate.unbind(m.el, m.type, m.listener);
  });
};


/**
 * Performs a search for the given pattern.
 *
 * @param  {String} pattern
 */
SearchPad.prototype._search = function(pattern) {
  var self = this;

  this._clearResults();

  // do not search on empty query
  if (!pattern || pattern === '') {
    return;
  }

  var searchResults = this._searchProvider.find(pattern);

  if (!searchResults.length) {
    return;
  }

  // append new results
  searchResults.forEach(function(result) {
    var id = result.element.id;
    var node = self._createResultNode(result, id);
    self._results[id] = {
      element: result.element,
      node: node
    };
  });

  // preselect first result
  var node = domQuery(SearchPad.RESULT_SELECTOR, this._resultsContainer);
  this._scrollToNode(node);
  this._preselect(node);
};


/**
 * Navigate to the previous/next result. Defaults to next result.
 * @param  {Boolean} previous
 */
SearchPad.prototype._scrollToDirection = function(previous) {
  var selected = this._getCurrentResult();
  if (!selected) {
    return;
  }

  var node = previous ? selected.previousElementSibling : selected.nextElementSibling;
  if (node) {
    this._scrollToNode(node);
    this._preselect(node);
  }
};


/**
 * Scroll to the node if it is not visible.
 *
 * @param  {Element} node
 */
SearchPad.prototype._scrollToNode = function(node) {
  if (!node || node === this._getCurrentResult()) {
    return;
  }

  var nodeOffset = node.offsetTop;
  var containerScroll = this._resultsContainer.scrollTop;

  var bottomScroll = nodeOffset - this._resultsContainer.clientHeight + node.clientHeight;

  if (nodeOffset < containerScroll) {
    this._resultsContainer.scrollTop = nodeOffset;
  } else if (containerScroll < bottomScroll) {
    this._resultsContainer.scrollTop = bottomScroll;
  }
};


/**
 * Clears all results data.
 */
SearchPad.prototype._clearResults = function() {
  domClear(this._resultsContainer);

  this._results = [];

  this._resetOverlay();

  this._eventBus.fire('searchPad.cleared');
};


/**
 * Get currently selected result.
 *
 * @return {Element}
 */
SearchPad.prototype._getCurrentResult = function() {
  return domQuery(SearchPad.RESULT_SELECTED_SELECTOR, this._resultsContainer);
};


/**
 * Create result DOM element within results container
 * that corresponds to a search result.
 *
 * 'result' : one of the elements returned by SearchProvider
 * 'id' : id attribute value to assign to the new DOM node
 * return : created DOM element
 *
 * @param  {SearchResult} result
 * @param  {String} id
 * @return {Element}
 */
SearchPad.prototype._createResultNode = function(result, id) {
  var node = domify(SearchPad.RESULT_HTML);

  // create only if available
  if (result.primaryTokens.length > 0) {
    createInnerTextNode(node, result.primaryTokens, SearchPad.RESULT_PRIMARY_HTML);
  }

  // secondary tokens (represent element ID) are allways available
  createInnerTextNode(node, result.secondaryTokens, SearchPad.RESULT_SECONDARY_HTML);

  domAttr(node, SearchPad.RESULT_ID_ATTRIBUTE, id);

  this._resultsContainer.appendChild(node);

  return node;
};


/**
 * Register search element provider.
 *
 * SearchProvider.find - provides search function over own elements
 *  (pattern) => [{ text: <String>, element: <Element>}, ...]
 *
 * @param  {SearchProvider} provider
 */
SearchPad.prototype.registerProvider = function(provider) {
  this._searchProvider = provider;
};


/**
 * Open search pad.
 */
SearchPad.prototype.open = function() {
  if (!this._searchProvider) {
    throw new Error('no search provider registered');
  }

  if (this.isOpen()) {
    return;
  }

  this._bindEvents();

  this._open = true;

  domClasses(this._container).add('open');

  this._searchInput.focus();

  this._eventBus.fire('searchPad.opened');
};


/**
 * Close search pad.
 */
SearchPad.prototype.close = function() {
  if (!this.isOpen()) {
    return;
  }

  this._unbindEvents();

  this._open = false;

  domClasses(this._container).remove('open');

  this._clearResults();

  this._searchInput.value = '';
  this._searchInput.blur();

  this._resetOverlay();

  this._eventBus.fire('searchPad.closed');
};


/**
 * Toggles search pad on/off.
 */
SearchPad.prototype.toggle = function() {
  this.isOpen() ? this.close() : this.open();
};


/**
 * Report state of search pad.
 */
SearchPad.prototype.isOpen = function() {
  return this._open;
};


/**
 * Preselect result entry.
 *
 * @param  {Element} element
 */
SearchPad.prototype._preselect = function(node) {
  var selectedNode = this._getCurrentResult();

  // already selected
  if (node === selectedNode) {
    return;
  }

  // removing preselection from current node
  if (selectedNode) {
    domClasses(selectedNode).remove(SearchPad.RESULT_SELECTED_CLASS);
  }

  var id = domAttr(node, SearchPad.RESULT_ID_ATTRIBUTE);
  var element = this._results[id].element;

  domClasses(node).add(SearchPad.RESULT_SELECTED_CLASS);

  this._resetOverlay(element);

  this._centerViewbox(element);

  this._selection.select(element);

  this._eventBus.fire('searchPad.preselected', element);
};


/**
 * Select result node.
 *
 * @param  {Element} element
 */
SearchPad.prototype._select = function(node) {
  var id = domAttr(node, SearchPad.RESULT_ID_ATTRIBUTE);
  var element = this._results[id].element;

  this.close();

  this._resetOverlay();

  this._centerViewbox(element);

  this._selection.select(element);

  this._eventBus.fire('searchPad.selected', element);
};


/**
 * Center viewbox on the element middle point.
 *
 * @param  {Element} element
 */
SearchPad.prototype._centerViewbox = function(element) {
  var viewbox = this._canvas.viewbox();

  var box = getBoundingBox(element);

  var newViewbox = {
    x: (box.x + box.width/2) - viewbox.outer.width/2,
    y: (box.y + box.height/2) - viewbox.outer.height/2,
    width: viewbox.outer.width,
    height: viewbox.outer.height
  };

  this._canvas.viewbox(newViewbox);

  this._canvas.zoom(viewbox.scale);
};


/**
 * Reset overlay removes and, optionally, set
 * overlay to a new element.
 *
 * @param  {Element} element
 */
SearchPad.prototype._resetOverlay = function(element) {
  if (this._overlayId) {
    this._overlays.remove(this._overlayId);
  }

  if (element) {
    var box = getBoundingBox(element);
    var overlay = constructOverlay(box);
    this._overlayId = this._overlays.add(element, overlay);
  }
};


module.exports = SearchPad;

/**
 * Construct overlay object for the given bounding box.
 *
 * @param  {BoundingBox} box
 * @return {Object}
 */
function constructOverlay(box) {

  var offset = 6;
  var w = box.width + offset * 2;
  var h = box.height + offset * 2;

  var styles = [
    'width: '+ w +'px',
    'height: '+ h + 'px'
  ].join('; ');

  return {
    position: {
      bottom: h - offset,
      right: w - offset
    },
    show: true,
    html: '<div style="' + styles + '" class="' + SearchPad.OVERLAY_CLASS + '"></div>'
  };
}


/**
 * Creates and appends child node from result tokens and HTML template.
 *
 * @param  {Element} node
 * @param  {Array<Object>} tokens
 * @param  {String} template
 */
function createInnerTextNode(parentNode, tokens, template) {
  var text = createHtmlText(tokens);
  var childNode = domify(template);
  childNode.innerHTML = text;
  parentNode.appendChild(childNode);
}

/**
 * Create internal HTML markup from result tokens.
 * Caters for highlighting pattern matched tokens.
 *
 * @param  {Array<Object>} tokens
 * @return {String}
 */
function createHtmlText(tokens) {
  var htmlText = '';

  tokens.forEach(function(t) {
    if (t.matched) {
      htmlText += '<strong class="' + SearchPad.RESULT_HIGHLIGHT_CLASS + '">' + t.matched + '</strong>';
    } else {
      htmlText += t.normal;
    }
  });

  return htmlText !== '' ? htmlText : null;
}


/**
 * CONSTANTS
 */
SearchPad.CONTAINER_SELECTOR = '.djs-search-container';
SearchPad.INPUT_SELECTOR = '.djs-search-input input';
SearchPad.RESULTS_CONTAINER_SELECTOR = '.djs-search-results';
SearchPad.RESULT_SELECTOR = '.djs-search-result';
SearchPad.RESULT_SELECTED_CLASS = 'djs-search-result-selected';
SearchPad.RESULT_SELECTED_SELECTOR = '.' + SearchPad.RESULT_SELECTED_CLASS;
SearchPad.RESULT_ID_ATTRIBUTE = 'data-result-id';
SearchPad.RESULT_HIGHLIGHT_CLASS = 'djs-search-highlight';
SearchPad.OVERLAY_CLASS = 'djs-search-overlay';

SearchPad.BOX_HTML =
  '<div class="djs-search-container djs-draggable djs-scrollable">' +
    '<div class="djs-search-input">' +
      '<input type="text"/>' +
    '</div>' +
    '<div class="djs-search-results"></div>' +
  '</div>';

SearchPad.RESULT_HTML =
  '<div class="djs-search-result"></div>';

SearchPad.RESULT_PRIMARY_HTML =
  '<div class="djs-search-result-primary"></div>';

SearchPad.RESULT_SECONDARY_HTML =
  '<p class="djs-search-result-secondary"></p>';
