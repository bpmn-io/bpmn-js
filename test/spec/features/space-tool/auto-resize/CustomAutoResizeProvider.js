'use strict';

var inherits = require('inherits');

var AutoResizeProvider = require('../../../../../lib/features/auto-resize/AutoResizeProvider');


function CustomAutoResizeProvider(eventBus) {
  AutoResizeProvider.call(this, eventBus);

  this.canResize = function(elements, target) {
    return target.parent;
  };
}

inherits(CustomAutoResizeProvider, AutoResizeProvider);

module.exports = CustomAutoResizeProvider;