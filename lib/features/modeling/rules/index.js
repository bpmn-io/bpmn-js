module.exports = {
  __depends__: [
    require('diagram-js/lib/features/rules')
  ],
  __init__: [ 'modelingRules' ],
  modelingRules: [ 'type', require('./ModelingRules') ]
};
