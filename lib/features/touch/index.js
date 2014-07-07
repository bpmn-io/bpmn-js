module.exports = {
  __depends__: [
    require('diagram-js/lib/features/touch')
  ],
  __init__: [ 'touchInteraction' ],
  touchInteraction: [ 'type', require('./TouchInteraction') ]
};