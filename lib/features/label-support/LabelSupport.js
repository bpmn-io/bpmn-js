'use strict';

var forEach = require('lodash/collection/forEach'),
    inherits = require('inherits');

var LOW_PRIORITY = 250;

var CommandInterceptor = require('../../command/CommandInterceptor');


function LabelSupport(eventBus, modeling, moveVisuals) {

  CommandInterceptor.call(this, eventBus);

  eventBus.on('shape.move.start', LOW_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes;

    var labels = [];

    forEach(shapes, function(element) {
      var label = element.label;

      if (label && !label.hidden && context.shapes.indexOf(label) === -1) {
        labels.push(label);
      }

      if (element.labelTarget) {
        labels.push(element);
      }
    });

    forEach(labels, function(label) {
      moveVisuals.addDragger(context, label);
    });

  });

  this.postExecute([ 'shapes.move' ], function(e) {
    var context = e.context,
        closure = context.closure,
        enclosedElements = closure.enclosedElements;

    // ensure we move all labels with their respective elements
    // if they have not been moved already

    forEach(enclosedElements, function(e) {
      if (e.label && !enclosedElements[e.label.id]) {
        modeling.moveShape(e.label, context.delta, e.parent);
      }
    });

  });

}

inherits(LabelSupport, CommandInterceptor);

LabelSupport.$inject = [ 'eventBus', 'modeling', 'moveVisuals' ];

module.exports = LabelSupport;
