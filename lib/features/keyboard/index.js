module.exports = {
  __depends__: [
    require('../editor-actions')
  ],
  __init__: [ 'keyboard' ],
  keyboard: [ 'type', require('./Keyboard') ]
};
