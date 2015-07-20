module.exports = {
  __depends__: [
    require('../move')
  ],
  __init__: [ 'labelSupport'],
  labelSupport: [ 'type', require('./LabelSupport') ]
};
