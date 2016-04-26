'use strict';

var is = require('../../../util/ModelUtil').is;

var COLLAB_ERR_MSG = 'flow elements must be children of pools/participants';

function ModelingFeedback(eventBus, tooltips, translate) {

  function showError(position, message) {
    tooltips.add({
      position: {
        x: position.x + 5,
        y: position.y + 5
      },
      type: 'error',
      timeout: 2000,
      html: '<div>' + message + '</div>'
    });
  }

  eventBus.on([ 'shape.move.rejected', 'create.rejected' ], function(event) {
    var context = event.context,
        shape = context.shape,
        target = context.target;

    if (is(target, 'bpmn:Collaboration') && is(shape, 'bpmn:FlowNode')) {
      showError(event, translate(COLLAB_ERR_MSG));
    }
  });

  eventBus.on([ 'elements.paste.rejected' ], function(event) {
    var context = event.context,
        position = context.position,
        target = context.target;

    if (is(target, 'bpmn:Collaboration')) {
      showError(position, translate(COLLAB_ERR_MSG));
    }
  });
}


ModelingFeedback.$inject = [ 'eventBus', 'tooltips', 'translate' ];

module.exports = ModelingFeedback;
