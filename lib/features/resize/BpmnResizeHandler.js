'use strict';

var _ = require('lodash');

var resizableElements = require('./BpmnResizableElements.json').elements;


function BpmnResizeHandler(eventBus, resize) {

  var isResizeAllowed = function(element) {
    var isAllowed = _.contains(resizableElements, element.type);

    if (isAllowed) {
      return true;
    } else {
      return false;
    }
  };

  // Register Handler
  eventBus.on('canvas.init', function() {
    resize.registerResizableHandler(isResizeAllowed);
  });
}

module.exports = BpmnResizeHandler;

BpmnResizeHandler.$inject = [ 'eventBus', 'resize' ];
