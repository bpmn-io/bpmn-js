import { forEach } from 'min-dash';

import inherits from 'inherits';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

var HIGH_PRIORITY = 1500;


/**
 * Specific rules for custom elements
 */
export default function CustomRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(CustomRules, RuleProvider);

CustomRules.$inject = [ 'eventBus' ];


CustomRules.prototype.init = function() {

  this.addRule('connection.create', HIGH_PRIORITY, function(context) {
    var source = context.source,
        target = context.target;

    return canConnect(source, target);
  });

  this.addRule('connection.reconnect', HIGH_PRIORITY, function(context) {

    var connection = context.connection,
        source = context.source,
        target = connection.target;

    return canConnect(source, target, connection);
  });

  this.addRule('connection.updateWaypoints', HIGH_PRIORITY, function(context) {

    // OK! but visually ignore
    return null;
  });

  this.addRule('elements.move', HIGH_PRIORITY, function(context) {

    var target = context.target,
        shapes = context.shapes,
        position = context.position;

    return canMove(shapes, target, position);
  });

  this.addRule('shape.create', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shape = context.shape,
        position = context.position;

    return canCreate(shape, target, position);
  });

  this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
    var shape = context.shape;

    if (isCustom(shape)) {
      return false;
    }
  });
};

function canConnect(source, target) {
  return !isCustom(source) && !isCustom(target);
}

function canCreate(shape, target) {
  if (isType(target, 'custom:triangle')) {
    return false;
  }

  if (isType(target, 'custom:circle')) {
    if (isType(shape, 'custom:triangle')) {
      return true;
    }
    return false;
  }

  if (isCustom(shape)) {
    return true;
  }
}

function canMove(shapes, target, position) {
  var result;

  forEach(shapes, function(shape) {
    if (isType(shape, 'custom:triangle') && isType(target, 'custom:circle')) {
      result = true;
      return false;
    }

    if (isCustom(target)) {
      result = false;
      return false;
    }

    if (isCustom(shape)) {
      result = true;
      return false;
    }
  });

  return result;
}

function isType(element, type) {
  var patt = new RegExp(type, 'i');

  return element && patt.test(element.type);
}

function isCustom(element) {
  return element && /^custom:/.test(element.type);
}
