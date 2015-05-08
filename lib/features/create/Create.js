'use strict';

var MARKER_OK = 'drop-ok',
    MARKER_NOT_OK = 'drop-not-ok';


function Create(eventBus, dragging, rules, modeling, canvas, elementFactory, renderer, styles) {

  // rules

  function canCreate(shape, target, source) {

    if (source) {
      return rules.allowed('shape.append', {
        source: source,
        shape: shape,
        parent: target
      });
    } else {
      return rules.allowed('shape.create', {
        shape: shape,
        parent: target
      });
    }
  }


  // visual helpers

  function createVisual(shape) {
    var group, preview, visual;

    group = canvas.getDefaultLayer().group().attr(styles.cls('djs-drag-group', [ 'no-events' ]));

    preview = group.group().addClass('djs-dragger');

    preview.translate(shape.width / -2, shape.height / -2);

    visual = preview.group().addClass('djs-visual');

    // hijack renderer to draw preview
    renderer.drawShape(visual, shape);

    return group;
  }


  // event handlers

  eventBus.on('create.move', function(event) {

    var context = event.context,
        shape = context.shape,
        visual = context.visual;

    // lazy init drag visual once we received the first real
    // drag move event (this allows us to get the proper canvas local coordinates)
    if (!visual) {
      visual = context.visual = createVisual(shape);
    }

    visual.translate(event.x, event.y);

    var hover = event.hover,
        canExecute;

    canExecute = context.canExecute = hover && canCreate(context.shape, hover, context.source);

    // ignore hover visually if canExecute is null
    if (hover && canExecute !== null) {
      context.target = hover;
      canvas.addMarker(hover, canExecute ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on([ 'create.end', 'create.out', 'create.cleanup' ], function(event) {
    var context = event.context;

    if (context.target) {
      canvas.removeMarker(context.target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('create.end', function(event) {
    var context = event.context,
        source = context.source,
        shape = context.shape,
        target = context.target,
        canExecute = context.canExecute,
        position = {
          x: event.x,
          y: event.y
        };

    if (!canExecute) {
      return false;
    }

    if (source) {
      modeling.appendShape(source, shape, position, target);
    } else {
      modeling.createShape(shape, position, target);
    }
  });


  eventBus.on('create.cleanup', function(event) {
    var context = event.context;

    if (context.visual) {
      context.visual.remove();
    }
  });

  // API

  this.start = function(event, shape, source) {

    dragging.activate(event, 'create', {
      cursor: 'grabbing',
      autoActivate: true,
      data: {
        shape: shape,
        context: {
          shape: shape,
          source: source
        }
      }
    });
  };
}

Create.$inject = [ 'eventBus', 'dragging', 'rules', 'modeling', 'canvas', 'elementFactory', 'renderer', 'styles' ];

module.exports = Create;