'use strict';

module.exports = {
  __depends__: [
    require('../move')
  ],
  __init__: [ 'dropVisuals', 'drop' ],
  dropVisuals: [ 'type', require('./DropVisuals') ],
  drop: [ 'type', require('./Drop') ]
};
