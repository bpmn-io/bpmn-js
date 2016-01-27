'use strict';

var SpaceUtil = require('./SpaceUtil');

var Cursor = require('../../util/Cursor');

var hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier;

var abs = Math.abs,
    round = Math.round;

var HIGH_PRIORITY = 1500,
    SPACE_TOOL_CURSOR = 'crosshair';

var AXIS_TO_DIMENSION = { x: 'width', y: 'height' },
    AXIS_INVERTED = { x: 'y', y: 'x' };

var getAllChildren = require('../../util/Elements').selfAndAllChildren;

var assign = require('lodash/object/assign');


/**
 * A tool that allows users to create and remove space in a diagram.
 *
 * The tool needs to be activated manually via {@link SpaceTool#activate(MouseEvent)}.
 */
function SpaceTool(eventBus, dragging, canvas, modeling, rules, toolManager) {

  this._canvas = canvas;
  this._dragging = dragging;
  this._modeling = modeling;
  this._rules = rules;
  this._toolManager = toolManager;

  var self = this;

  toolManager.registerTool('space', {
    tool: 'spaceTool.selection',
    dragging: 'spaceTool'
  });

  eventBus.on('spaceTool.selection.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return;
    }

    eventBus.once('spaceTool.selection.ended', function() {
      self.activateMakeSpace(event.originalEvent);
    });
  });


  eventBus.on('spaceTool.move', HIGH_PRIORITY , function(event) {

    var context = event.context;

    if (!context.initialized) {
      context.initialized = self.initializeMakeSpace(event, context);
    }
  });


  eventBus.on('spaceTool.end', function(event) {

    var context = event.context,
        axis = context.axis,
        direction = context.direction,
        movingShapes = context.movingShapes,
        resizingShapes = context.resizingShapes;

    // skip if create space has not been initialized yet
    if (!context.initialized) {
      return;
    }

    var delta = { x: round(event.dx), y: round(event.dy) };
    delta[ AXIS_INVERTED[ axis ] ] = 0;

    self.makeSpace(movingShapes, resizingShapes, delta, direction);
  });
}

SpaceTool.$inject = [ 'eventBus', 'dragging', 'canvas', 'modeling', 'rules', 'toolManager' ];

module.exports = SpaceTool;


/**
 * Activate space tool selection
 *
 * @param  {MouseEvent} event
 * @param  {Boolean} autoActivate
 */
SpaceTool.prototype.activateSelection = function(event, autoActivate) {
  this._dragging.init(event, 'spaceTool.selection', {
    trapClick: false,
    cursor: SPACE_TOOL_CURSOR,
    autoActivate: autoActivate,
    data: {
      context: {}
    }
  });
};

/**
 * Activate make space
 *
 * @param  {MouseEvent} event
 */
SpaceTool.prototype.activateMakeSpace = function(event) {
  this._dragging.init(event, 'spaceTool', {
    autoActivate: true,
    cursor: SPACE_TOOL_CURSOR,
    data: {
      context: {}
    }
  });
};

/**
 * Actually make space on the diagram
 *
 * @param  {Array<djs.model.Shape>} movingShapes
 * @param  {Array<djs.model.Shape>} resizingShapes
 * @param  {Point} delta
 * @param  {String} direction
 */
SpaceTool.prototype.makeSpace = function(movingShapes, resizingShapes, delta, direction) {
  return this._modeling.createSpace(movingShapes, resizingShapes, delta, direction);
};

/**
 * Initialize make space and return true if that was successful.
 *
 * @param {Event} event
 * @param {Object} context
 *
 * @return {Boolean} true, if successful
 */
SpaceTool.prototype.initializeMakeSpace = function(event, context) {

  var axis = abs(event.dx) > abs(event.dy) ? 'x' : 'y',
      offset = event['d' + axis],
      // start point of create space operation
      spacePos = event[axis] - offset;

  if (abs(offset) < 5) {
    return false;
  }

  // inverts the offset to choose the shapes
  // on the opposite side of the resizer if
  // a key modifier is pressed
  if (hasPrimaryModifier(event)) {
    offset *= -1;
  }

  var rootShape = this._canvas.getRootElement();

  var allShapes = getAllChildren(rootShape, true);

  var adjustments = this.calculateAdjustments(allShapes, axis, offset, spacePos);

  // store data in context
  assign(context, adjustments, {
    axis: axis,
    direction: SpaceUtil.getDirection(axis, offset)
  });

  Cursor.set('resize-' + (axis === 'x' ? 'ew' : 'ns'));

  return true;
};

/**
 * Calculate adjustments needed when making space
 *
 * @param  {Array<djs.model.Shape>} elements
 * @param  {String} axis
 * @param  {Number} offset
 * @param  {Number} spacePos
 *
 * @return {Object}
 */
SpaceTool.prototype.calculateAdjustments = function(elements, axis, offset, spacePos) {

  var movingShapes = [],
      resizingShapes = [];

  var rules = this._rules;

  // collect all elements that need to be moved _AND_
  // resized given on the initial create space position
  elements.forEach(function(shape) {

    var shapeStart = shape[axis],
        shapeEnd = shapeStart + shape[AXIS_TO_DIMENSION[axis]];

    // checking if it's root
    if (!shape.parent) {
      return;
    }

    // checking if it's a shape
    if (shape.waypoints) {
      return;
    }

    // shape after spacePos
    if (offset > 0 && shapeStart > spacePos) {
      return movingShapes.push(shape);
    }

    // shape before spacePos
    if (offset < 0 && shapeEnd < spacePos) {
      return movingShapes.push(shape);
    }

    // shape on top of spacePos, resize only if allowed
    if (shapeStart < spacePos &&
        shapeEnd > spacePos &&
        rules.allowed('shape.resize', { shape: shape })) {

      return resizingShapes.push(shape);
    }
  });

  return {
    movingShapes: movingShapes,
    resizingShapes: resizingShapes
  };
};

SpaceTool.prototype.toggle = function() {
  if (this.isActive()) {
    this._dragging.cancel();
  } else {
    this.activateSelection();
  }
};

SpaceTool.prototype.isActive = function() {
  var context = this._dragging.context();

  return context && /^spaceTool/.test(context.prefix);
};
