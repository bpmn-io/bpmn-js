'use strict';

var is = require('../../../util/ModelUtil').is;


function ModelingFeedback(eventBus, tooltips, i18n) {

  var _i18n = i18n;

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
      showError(event, _i18n.t('flow elements must be children of pools/participants'));
    }
  });

}


ModelingFeedback.$inject = [ 'eventBus', 'tooltips', 'i18n' ];

module.exports = ModelingFeedback;