module.exports = {
  __depends__: [ require('../../command' ) ],
  __init__: [ 'rules' ],
  rules: [ 'type', require('./Rules') ]
};
