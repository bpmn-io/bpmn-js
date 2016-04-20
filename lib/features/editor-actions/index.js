module.exports = {
  __depends__: [
    require('../selection'),
    require('../copy-paste'),
    require('../../navigation/zoomscroll')
  ],
  __init__: [ 'editorActions' ],
  editorActions: [ 'type', require('./EditorActions') ]
};
