'use strict';

var _ = require('lodash');

var resizableElements = require('./BpmnResizableElements.json').elements,
    minimumSize       = require('./BpmnMinimumSizes.js');


function BpmnResizeHandler(eventBus, resize) {

  var isResizeAllowed = function isResizeAllowed(element) {
    var isAllowed = _.contains(resizableElements, element.type);

    if (isAllowed) {
      return true;
    } else {
      return false;
    }
  };

  var getMinimumSize =  function getMinimumSize(element) {
    var size = minimumSize[element.type];

    if (!size) {
      size = {
        height: 30,
        width:  30
      };
    }

    if (!!size.resolver) {
      return size.resolver(element);
    } else {
      return size;
    }
  };

  // Register Handler
  eventBus.on('canvas.init', function() {
    resize.registerResizableHandler(isResizeAllowed);
    resize.registerMinimumSizeResolver(getMinimumSize);
  });
}

module.exports = BpmnResizeHandler;

BpmnResizeHandler.$inject = [ 'eventBus', 'resize' ];
