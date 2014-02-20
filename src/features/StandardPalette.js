var Diagram = require('../Diagram');

/**
 * @namespace djs
 */

/**
 * @class
 */
function StandardPalette(canvas) {
  'use strict';

  console.log('StandardPalette Plugin init');


}

Diagram.plugin('standardPalette', [ 'canvas', StandardPalette ]);

module.exports = StandardPalette;