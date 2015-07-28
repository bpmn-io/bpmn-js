'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

var forEach = require('lodash/collection/forEach');

function ReplaceRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

ReplaceRules.$inject = [ 'eventBus' ];

inherits(ReplaceRules, RuleProvider);

module.exports = ReplaceRules;


ReplaceRules.prototype.init = function() {

  this.addRule('shapes.move', function(context) {

    var attachmentIds = context.target.retainAttachmentIds;

    if (attachmentIds) {
      return retainmentAllowed(attachmentIds, context.shapes);
    }
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
