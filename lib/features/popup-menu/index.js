module.exports = {
  __depends__: [
    require('diagram-js/lib/features/popup-menu'),
    require('../replace')
  ],
  __init__: [ 'replaceMenuProvider' ],
  replaceMenuProvider: [ 'type', require('./ReplaceMenuProvider') ]
};