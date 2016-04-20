module.exports = {
  __depends__: [
    require('../clipboard'),
    require('../rules'),
    require('../mouse-tracking')
  ],
  __init__: [ 'copyPaste' ],
  copyPaste: [ 'type', require('./CopyPaste') ]
};
