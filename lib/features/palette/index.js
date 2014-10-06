module.exports = {
  __depends__: [
    require('diagram-js/lib/features/palette')
  ],
  __init__: [ 'bpmnPaletteProvider' ],
  bpmnPaletteProvider: [ 'type', require('./BpmnPaletteProvider') ],
};
