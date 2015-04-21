module.exports = {
  __depends__: [
    require('../../command'),
    require('../change-support'),
    require('../rules')
  ],
  __init__: [ 'modeling' ],
  modeling: [ 'type', require('./Modeling') ],
  layouter: [ 'type', require('../../layout/BaseLayouter') ]
};
