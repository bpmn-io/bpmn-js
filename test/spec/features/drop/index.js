module.exports = {
  __depends__: [
    require('../../../../lib/features/rules')
  ],
  __init__:  [ 'rules' ],
  rules: [ 'type', require('./TestRules') ]
};
