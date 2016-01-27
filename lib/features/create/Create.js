'use strict';

var MARKER_OK = 'drop-ok',
    MARKER_NOT_OK = 'drop-not-ok',
    MARKER_ATTACH = 'attach-ok',
    MARKER_NEW_PARENT = 'new-parent';


function Create(eventBus, dragging, rules, modeling, canvas, styles, graphicsFactory) {

  // rules

  function canCreate(shape, target, source, position) {

    if (source) {
      return rules.allowed('shape.append', {
        source: source,
        shape: shape,
        target: target,
        position: position
      });
    } else {
      return rules.allowed('shape.create', {
        shape: shape,
        target: target,
        position: position
      });
    }
  }


  /** set drop marker on an element */
  function setMarker(element, marker) {

    [ MARKER_ATTACH, MARKER_OK, MARKER_NOT_OK, MARKER_NEW_PARENT ].forEach(function(m) {

      if (m === marker) {
        canvas.addMarker(element, m);
      } else {
        canvas.removeMarker(element, m);
      }
    });
  }


  // visual helpers

  function createVisual(shape) {
    var group, preview, visual;

    group = canvas.getDefaultLayer().group().attr(styles.cls('djs-drag-group', [ 'no-events' ]));

    preview = group.group().addClass('djs-dragger');

    preview.translate(shape.width / -2, shape.height / -2);

    visual = preview.group().addClass('djs-visual');

    // hijack renderer to draw preview
    graphicsFactory.drawShape(visual, shape);

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

    var position = {
      x: event.x,
      y: event.y
    };

    canExecute = context.canExecute = hover && canCreate(context.shape, hover, context.source, position);

    // ignore hover visually if canExecute is null
    if (hover && canExecute !== null) {
      context.target = hover;

      if (canExecute === 'attach') {
        setMarker(hover, MARKER_ATTACH);
      } else {
        setMarker(hover, context.canExecute ? MARKER_NEW_PARENT : MARKER_NOT_OK);
      }
    }
  });

  eventBus.on([ 'create.end', 'create.out', 'create.cleanup' ], function(event) {
    var context = event.context,
        target = context.target;

    if (target) {
      setMarker(target, null);
    }
  });

  eventBus.on('create.end', function(event) {
    var context = event.context,
        source = context.source,
        shape = context.shape,
        target = context.target,
        canExecute = context.canExecute,
        isAttach,
        position = {
          x: event.x,
          y: event.y
        };

    if (!canExecute) {
      return false;
    }

    if (source) {
      shape = modeling.appendShape(source, shape, position, target);
    } else {
      isAttach = canExecute === 'attach';

      shape = modeling.createShape(shape, position, target, isAttach);
    }

    // make sure we provide the actual attached
    // shape with the context so that selection and
    // other components can use it right after the create
    // operation ends
    context.shape = shape;
  });


  eventBus.on('create.cleanup', function(event) {
    var context = event.context;

    if (context.visual) {
      context.visual.remove();
    }
  });

  // API

  this.start = function(event, shape, source) {

    dragging.init(event, 'create', {
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

Create.$inject = [ 'eventBus', 'dragging', 'rules', 'modeling', 'canvas', 'styles', 'graphicsFactory' ];

module.exports = Create;
