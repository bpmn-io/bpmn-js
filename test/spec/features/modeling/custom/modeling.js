module.exports = {
  __depends__: [
    require('../../../../../lib/command'),
    require('../../../../../lib/features/change-support'),
    require('../../../../../lib/features/rules')
  ],
  __init__: [ 'modeling' ],
  modeling: [ 'type', require('../../../../../lib/features/modeling/Modeling') ],
  layouter: [ 'type', require('./layouter') ]
};
