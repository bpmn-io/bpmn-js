module.exports = {
  __depends__: [
    require('../../cmd'),
    require('../change-support')
  ],
  __init__: [ 'modeling' ],
  modeling: [ 'type', require('./Modeling') ],
  layouter: [ 'type', require('./Layouter') ]
};