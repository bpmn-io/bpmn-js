module.exports = {
  __depends__: [
    require('diagram-js/lib/features/palette'),
    require('diagram-js/lib/features/create'),
    require('diagram-js/lib/features/space-tool'),
    require('diagram-js/lib/features/lasso-tool')
  ],
  __init__: [ 'paletteProvider' ],
  paletteProvider: [ 'type', require('./PaletteProvider') ]
};
