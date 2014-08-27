module.exports = {
  __depends__: [
    require('../../features/touch')
  ],
  __init__: [ 'touchInteraction' ],
  touchInteraction: [ 'type', require('./TouchInteraction') ]
};
