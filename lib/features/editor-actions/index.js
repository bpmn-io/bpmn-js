module.exports = {
  __depends__: [
    require('../selection'),
    require('../../navigation/zoomscroll')
  ],
  __init__: [ 'editorActions' ],
  editorActions: [ 'type', require('./EditorActions') ]
};
