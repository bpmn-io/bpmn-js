module.exports = {
  __depends__: [
    require('../move'),
    require('../label-support')
  ],
  __init__: [ 'attachSupport'],
  attachSupport: [ 'type', require('./AttachSupport') ]
};
