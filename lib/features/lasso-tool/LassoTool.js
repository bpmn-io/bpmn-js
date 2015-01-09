'use strict';

var Dom = require('../../util/Dom');

var Snap = require('snapsvg');

var _ = require('lodash'),
    getEnclosedElements = require('../../util/Elements').getEnclosedElements;


function LassoTool(eventBus, canvas, dragging, elementRegistry, selection) {

  this._selection = selection;

  var self = this,
      container = canvas._container;


  // Select elements
  eventBus.on('lasso.end', function(event) {

    var bbox = toBBox(event);

    var elements = elementRegistry.filter(function(element) {
      return element;
    });

    self.select(elements, bbox);
  });


  function startDragging(event) {

    if (event.button || !event.altKey) {
      return;
    }

    dragging.activate(event, 'lasso', {
      autoActivate: true,
      data: {
        context: {}
      }
    });
  }

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

  Dom.on(container, 'mousedown', startDragging);
}

LassoTool.$inject = [
  'eventBus',
  'canvas',
  'dragging',
  'elementRegistry',
  'selection'
];

module.exports = LassoTool;


LassoTool.prototype.select = function(elements, bbox) {
  var selectedElements = getEnclosedElements(elements, bbox);

  this._selection.select(_.values(selectedElements));
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
