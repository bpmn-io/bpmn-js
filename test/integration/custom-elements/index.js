module.exports = {
  __init__: [ 'customRenderer', 'customRules', 'customUpdater' ],
  elementFactory: [ 'type', require('./CustomElementFactory') ],
  customRenderer: [ 'type', require('./CustomRenderer') ],
  customRules: [ 'type', require('./CustomRules') ],
  customUpdater: [ 'type', require('./CustomUpdater') ]
};
