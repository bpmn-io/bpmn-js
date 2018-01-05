'use strict';

var path = require('path');

var copySync = require('cpx').copySync;

var diagramAssets = path.join(path.dirname(require.resolve('diagram-js')), '/assets') + '/**';

console.log(diagramAssets);

copySync('assets/**', 'dist/');
copySync(diagramAssets, 'dist/');