'use strict';

module.exports = {
  __init__: [ 'interactionEvents', 'touchInteractionEvents' ],
  interactionEvents: [ 'type', require('./InteractionEvents') ],
  touchInteractionEvents: [ 'type', require('./TouchInteractionEvents') ]
};