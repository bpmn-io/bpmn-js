module.exports = {
  __depends__: [
    require('../modeling'),
    require('../rules')
  ],
  __init__: [ 'resize' ],
  resize: [ 'type', require('./Resize') ]
};
