module.exports = {
  __depends__: [
    require('../modeling'),
    require('../rules'),
    require('../dragging')
  ],
  __init__: [ 'resize' ],
  resize: [ 'type', require('./Resize') ]
};
