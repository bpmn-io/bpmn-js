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

  // update attachments if a the host is replaced
  this.postExecute([ 'shape.replace' ], function(e) {

    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape,
        attachers = oldShape.attachers.slice();

    forEach(attachers, function(attacher){

      var allowed = rules.allowed('shapes.move', {
        target: newShape,
        shapes: [attacher]
      });

      if (allowed === 'attach') {
        modeling.updateAttachment(attacher, newShape);
      }
    });
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

  // add attachers to move operation
  this.preExecute([ 'shapes.move' ], function(e) {
    var context = e.context,
        shapes = context.shapes;

    var attachers = getAttachers(shapes);

    forEach(attachers, function(attacher) {
      context.shapes.push(attacher);
    });

  });

  // perform the attaching after shapes are done moving
  this.postExecute([ 'shapes.move' ], function(e) {
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

  // remove attachments
  this.preExecute([ 'shape.delete' ], function(event) {

    var shape = event.context.shape;

    if (shape.attachers) {
      saveClear(shape.attachers, function(attacher) {
        modeling.removeShape(attacher);
      });
    }
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
