'use strict';

module.exports = {
  renderer: [ 'type', require('./Renderer') ],
  snap: [ 'value', require('./Snap') ],
  styles: [ 'type', require('./Styles') ]
};