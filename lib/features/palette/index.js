'use strict';

module.exports = {
  __depends__: [ require('../tool-manager') ],
  __init__: [ 'palette' ],
  palette: [ 'type', require('./Palette') ]
};
