'use strict';

var values = require('lodash/object/values');

var getEnclosedElements = require('../../util/Elements').getEnclosedElements;

var hasSecondaryModifier = require('../../util/Mouse').hasSecondaryModifier;

var Snap = require('../../../vendor/snapsvg');

var LASSO_TOOL_CURSOR = 'crosshair';


function LassoTool(eventBus, canvas, dragging, elementRegistry, selection, toolManager) {

  this._selection = selection;
  this._dragging = dragging;

  var self = this;

  // lasso visuals implementation

  /**
  * A helper that realizes the selection box visual
  */
  var visuals = {

    create: function(context) {
      var container = canvas.getDefaultLayer(),
          frame;

      frame = context.frame = Snap.create('rect', {
        class: 'djs-lasso-overlay',
        width:  1,
        height: 1,
        x: 0,
        y: 0
      });

      frame.appendTo(container);
    },

    update: function(context) {
      var frame = context.frame,
          bbox  = context.bbox;

      frame.attr({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      });
    },

    remove: function(context) {

      if (context.frame) {
        context.frame.remove();
      }
    }
  };

  toolManager.registerTool('lasso', {
    tool: 'lasso.selection',
    dragging: 'lasso'
  });

  eventBus.on('lasso.selection.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return;
    }

    eventBus.once('lasso.selection.ended', function() {
      self.activateLasso(event.originalEvent, true);
    });
  });

  // lasso interaction implementation

  eventBus.on('lasso.end', function(event) {

    var bbox = toBBox(event);

    var elements = elementRegistry.filter(function(element) {
      return element;
    });

    self.select(elements, bbox);
  });

  eventBus.on('lasso.start', function(event) {

    var context = event.context;

    context.bbox = toBBox(event);
    visuals.create(context);
  });

  eventBus.on('lasso.move', function(event) {

    var context = event.context;

    context.bbox = toBBox(event);
    visuals.update(context);
  });

  eventBus.on('lasso.end', function(event) {

    var context = event.context;

    visuals.remove(context);
  });

  eventBus.on('lasso.cleanup', function(event) {

    var context = event.context;

    visuals.remove(context);
  });


  // event integration

  eventBus.on('element.mousedown', 1500, function(event) {

    if (hasSecondaryModifier(event)) {
      self.activateLasso(event.originalEvent);

      event.stopPropagation();
    }
  });
}

LassoTool.$inject = [
  'eventBus',
  'canvas',
  'dragging',
  'elementRegistry',
  'selection',
  'toolManager'
];

module.exports = LassoTool;


LassoTool.prototype.activateLasso = function(event, autoActivate) {

  this._dragging.init(event, 'lasso', {
    autoActivate: autoActivate,
    cursor: LASSO_TOOL_CURSOR,
    data: {
      context: {}
    }
  });
};

LassoTool.prototype.activateSelection = function(event) {

  this._dragging.init(event, 'lasso.selection', {
    trapClick: false,
    cursor: LASSO_TOOL_CURSOR,
    data: {
      context: {}
    }
  });
};

LassoTool.prototype.select = function(elements, bbox) {
  var selectedElements = getEnclosedElements(elements, bbox);

  this._selection.select(values(selectedElements));
};

LassoTool.prototype.toggle = function() {
  if (this.isActive()) {
    this._dragging.cancel();
  } else {
    this.activateSelection();
  }
};

LassoTool.prototype.isActive = function() {
  var context = this._dragging.context();

  return context && /^lasso/.test(context.prefix);
};



function toBBox(event) {

  var start = {

    x: event.x - event.dx,
    y: event.y - event.dy
  };

  var end = {
    x: event.x,
    y: event.y
  };

  var bbox;

  if ((start.x <= end.x && start.y < end.y) ||
      (start.x < end.x && start.y <= end.y)) {

      bbox = {
        x: start.x,
        y: start.y,
        width:  end.x - start.x,
        height: end.y - start.y
      };
  } else if ((start.x >= end.x && start.y < end.y) ||
             (start.x > end.x && start.y <= end.y)) {

    bbox = {
      x: end.x,
      y: start.y,
      width:  start.x - end.x,
      height: end.y - start.y
    };
  } else if ((start.x <= end.x && start.y > end.y) ||
             (start.x < end.x && start.y >= end.y)) {

    bbox = {
      x: start.x,
      y: end.y,
      width:  end.x - start.x,
      height: start.y - end.y
    };
  } else if ((start.x >= end.x && start.y > end.y) ||
             (start.x > end.x && start.y >= end.y)) {

    bbox = {
      x: end.x,
      y: end.y,
      width:  start.x - end.x,
      height: start.y - end.y
    };
  } else {

    bbox = {
      x: end.x,
      y: end.y,
      width:  0,
      height: 0
    };
  }
  return bbox;
}
