module.exports = {
  __depends__: [
    require('diagram-js/lib/features/palette')
  ],
  __init__: [ 'paletteProvider' ],
  paletteProvider: [ 'type', require('./PaletteProvider') ]
};
