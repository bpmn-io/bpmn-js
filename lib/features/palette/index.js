module.exports = {
  __depends__: [
    require('diagram-js/lib/features/palette'),
    require('diagram-js/lib/features/create')
  ],
  __init__: [ 'paletteProvider' ],
  paletteProvider: [ 'type', require('./PaletteProvider') ]
};
