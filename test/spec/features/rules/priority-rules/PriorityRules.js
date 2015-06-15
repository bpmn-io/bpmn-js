'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');


var HIGH_PRIORITY = 1500;


function PriorityRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

PriorityRules.$inject = [ 'eventBus' ];

inherits(PriorityRules, RuleProvider);

module.exports = PriorityRules;

PriorityRules.prototype.init = function() {

  // a white+black list containing
  // element ids
  var whiteList = [
    'always-resizable'
  ];

  var blackList = [
    'never-resizable'
  ];


  this.addRule('shape.resize', function(context) {
    return context.shape.resizable;
  });


  this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
    var shape = context.shape;

    if (whiteList.indexOf(shape.id) !== -1) {
      return true;
    }

    if (blackList.indexOf(shape.id) !== -1) {
      return false;
    }
  });

};