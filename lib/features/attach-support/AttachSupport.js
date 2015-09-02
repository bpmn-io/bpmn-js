'use strict';

var forEach = require('lodash/collection/forEach'),
    flatten = require('lodash/array/flatten'),
    filter = require('lodash/collection/filter'),
    groupBy = require('lodash/collection/groupBy'),
    map = require('lodash/collection/map');

var saveClear = require('../../util/Removal').saveClear;

var getNewAttachShapeDelta = require('../../util/AttachUtil').getNewAttachShapeDelta;

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

      if (attacher.label) {
        moveVisuals.makeDraggable(context, attacher.label, true);
      }
    });
  });

  // move all attachments after the other shapes are done moving
  this.postExecuted([ 'elements.move' ], function(event) {

    var context = event.context,
        delta = context.delta,
        newParent = context.newParent,
        closure = context.closure,
        enclosedElements = closure.enclosedElements,
        attachers = getAttachers(enclosedElements);

    // ensure we move all attachers with their hosts
    // if they have not been moved already
    forEach(attachers, function(attacher){
      if (!enclosedElements[attacher.id]) {
        modeling.moveShape(attacher, delta, newParent);
      }

      // ensure to move attachment labels if host has moved
      if (attacher.label && !enclosedElements[attacher.label.id]) {
        modeling.moveShape(attacher.label, delta, newParent);
      }
    });
  });

  // perform the attaching after shapes are done moving
  this.postExecuted([ 'elements.move' ], function(e) {

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

  // ensure invalid attachment connections are removed
  this.postExecuted([ 'elements.move' ], function(e) {

    var shapes = e.context.shapes;

    forEach(shapes, function(shape) {

      forEach(shape.attachers, function(attacher) {

        // remove invalid outgoing connections
        forEach(attacher.outgoing, function(connection) {
          var allowed = rules.allowed('connection.reconnectStart', {
            connection: connection,
            source: connection.source,
            target: connection.target
          });

          if (!allowed) {
            modeling.removeConnection(connection);
          }
        });

        // remove invalid incoming connections
        forEach(attacher.incoming, function(connection) {
          var allowed = rules.allowed('connection.reconnectEnd', {
            connection: connection,
            source: connection.source,
            target: connection.target
          });

          if (!allowed) {
            modeling.removeConnection(connection);
          }
        });
      });
    });
  });

  this.postExecute([ 'shape.create' ], function(e) {
    var context = e.context,
        shape = context.shape,
        host = context.host;

    if (host) {
      modeling.updateAttachment(shape, host);
    }
  });

  // update attachments if the host is replaced
  this.postExecute([ 'shape.replace' ], function(e) {

    var context = e.context,
        oldShape = context.oldShape,
        newShape = context.newShape;

    saveClear(oldShape.attachers, function(attacher) {
      var allowed = rules.allowed('elements.move', {
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

  // move shape on host resize
  this.postExecute([ 'shape.resize' ], function(event) {
    var context = event.context,
        shape = context.shape,
        oldBounds = context.oldBounds,
        newBounds = context.newBounds,
        attachers = shape.attachers;

    if (!attachers.length) {
      return;
    }

    forEach(attachers, function(attacher) {
      var delta = getNewAttachShapeDelta(attacher, oldBounds, newBounds);

      modeling.moveShape(attacher, delta, attacher.parent);
    });
  });

  // remove attachments
  this.preExecute([ 'shape.delete' ], function(event) {

    var shape = event.context.shape;

    saveClear(shape.attachers, function(attacher) {
      modeling.removeShape(attacher);
    });

    if (shape.host) {
      modeling.updateAttachment(shape, null);
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
