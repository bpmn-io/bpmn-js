'use strict';

var forEach = require('lodash/collection/forEach'),
    flatten = require('lodash/array/flatten'),
    filter = require('lodash/collection/filter'),
    groupBy = require('lodash/collection/groupBy'),
    map = require('lodash/collection/map');

var saveClear = require('../../util/Removal').saveClear;

var inherits = require('inherits');

var LOW_PRIORITY = 250,
    HIGH_PRIORITY = 1500;

var CommandInterceptor = require('../../command/CommandInterceptor');


function AttachSupport(eventBus, modeling, moveVisuals, rules) {

  CommandInterceptor.call(this, eventBus);


  // remove all the nested attached elements from the moved
  // shapes; they will be moved together with the host element
  // anyway
  eventBus.on('shape.move.start', HIGH_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes;

    context.shapes = removeAttached(shapes);
  });

  // add attachers to the visual's group
  eventBus.on('shape.move.start', LOW_PRIORITY, function(e) {

    var context = e.context,
        shapes = context.shapes,
        attachers = context.movedAttachers = getAttachers(shapes);

    forEach(attachers, function(attacher) {
      moveVisuals.makeDraggable(context, attacher, true);
    });
  });

  // move all attachments after the other shapes are done moving
  this.postExecuted([ 'shapes.move' ], function(event) {

    var context = event.context,
        closure = context.closure,
        enclosedElements = closure.enclosedElements,
        attachers = getAttachers(closure.enclosedElements);

    // ensure we move all attachers with their hosts
    // if they have not been moved already
    forEach(attachers, function(attacher){
      if (!enclosedElements[attacher.id]) {
        modeling.moveShape(attacher, context.delta, context.newParent);
      }
    });
  });

  // perform the attaching after shapes are done moving
  this.postExecuted([ 'shapes.move' ], function(e) {

    var context = e.context,
        shapes = context.shapes,
        newHost = context.newHost,
        attachers;

    if (shapes.length > 1) {
      return;
    }

    if (newHost) {

      attachers = shapes;
    } else {

      attachers = filter(shapes, function(s) {
        return !!s.host;
      });
    }

    forEach(attachers, function(attacher) {
      modeling.updateAttachment(attacher, newHost);
    });
  });

  // update attachments if the host is replaced
  this.postExecute([ 'shape.replace' ], function(e) {

    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape;

    saveClear(oldShape.attachers, function(attacher) {
      var allowed = rules.allowed('shapes.move', {
        target: newShape,
        shapes: [attacher]
      });

      if (allowed === 'attach') {
        modeling.updateAttachment(attacher, newShape);
      } else {
        modeling.removeShape(attacher);
      }
    });

  });

  // remove attachments
  this.preExecute([ 'shape.delete' ], function(event) {

    var shape = event.context.shape;

    saveClear(shape.attachers, function(attacher) {
      modeling.removeShape(attacher);
    });
  });
}

inherits(AttachSupport, CommandInterceptor);

AttachSupport.$inject = [ 'eventBus', 'modeling', 'moveVisuals', 'rules' ];

module.exports = AttachSupport;


/**
 * Return attachers of the given shapes
 *
 * @param  {Array<djs.model.Base>} shapes
 * @return {Array<djs.model.Base>}
 */
function getAttachers(shapes) {
  return flatten(map(shapes, function(s) {
    return s.attachers || [];
  }));
}


/**
 * Return a filtered list of elements that do not
 * contain attached elements with hosts being part
 * of the selection.
 *
 * @param  {Array<djs.model.Base>} elements
 *
 * @return {Array<djs.model.Base>} filtered
 */
function removeAttached(elements) {

  var ids = groupBy(elements, 'id');

  return filter(elements, function(element) {
    while (element) {

      // host in selection
      if (element.host && ids[element.host.id]) {
        return false;
      }

      element = element.parent;
    }

    return true;
  });
}
