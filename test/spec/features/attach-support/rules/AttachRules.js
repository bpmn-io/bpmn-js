'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

var forEach = require('lodash/collection/forEach');

function MoveRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

MoveRules.$inject = [ 'eventBus' ];

inherits(MoveRules, RuleProvider);

module.exports = MoveRules;


MoveRules.prototype.init = function() {

  this.addRule('elements.move', function(context) {

    if (context.target && context.target.retainAttachmentIds) {
      var attachmentIds = context.target.retainAttachmentIds;

      return retainmentAllowed(attachmentIds, context.shapes);
    }
  });

  this.addRule('elements.move', function(context) {
    var shapes = context.shapes,
        target = context.target;

    if (shapes.length === 1 && shapes[0].id === 'attacher' && target) {

      if (target.id === 'host' || target.id === 'host2') {
        return 'attach';
      } else if (target.id === 'parent') {
        return true;
      } else {
        return false;
      }
    }

    if (shapes.length === 1 && shapes[0].id === 'attacher2') {
      return false;
    }
  });

  this.addRule('connection.reconnectEnd', function(context) {
    if (context.target.host.parent.id === 'parent') {
      return false;
    }
    return true;
  });

  this.addRule('connection.reconnectStart', function(context) {
    if (context.source.host.parent.id === 'parent') {
      return false;
    }
    return true;
  });
};


/**
 * Returns 'attach' if all shape ids are contained in the attachmentIds array.
 * Returns false if at least one of the shapes is not contained.
 *
 * @param  {Array<String>} attachmentIds
 * @param  {Array<Object>} shapes
 */
function retainmentAllowed(attachmentIds, shapes) {
  var allowed = 'attach';
  forEach(shapes, function(shape){
    if (attachmentIds.indexOf(shape.id) === -1) {
      allowed = false;
      return;
    }
  });
  return allowed;
}
