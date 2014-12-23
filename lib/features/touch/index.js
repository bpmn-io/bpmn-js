module.exports = {
  __depends__: [ require('../interaction-events') ],
  __init__: [ 'touchInteractionEvents' ],
  touchInteractionEvents: [ 'type', require('./TouchInteractionEvents') ],
  touchFix: [ 'type', require('./TouchFix') ]
};