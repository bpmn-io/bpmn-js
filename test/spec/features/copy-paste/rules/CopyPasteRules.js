'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');


function CopyPasteRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CopyPasteRules.$inject = [ 'eventBus' ];

inherits(CopyPasteRules, RuleProvider);

module.exports = CopyPasteRules;


CopyPasteRules.prototype.init = function() {

  this.addRule('element.copy', function(context) {
    var element = context.element;

    if (element.host) {
      return false;
    }

    return true;
  });

  this.addRule('element.paste', function(context) {
    if (context.source) {
      return false;
    }

    return true;
  });

  this.addRule('elements.paste', function(context) {
    if (context.target.id === 'parent2') {
      return false;
    }

    return true;
  });
};
