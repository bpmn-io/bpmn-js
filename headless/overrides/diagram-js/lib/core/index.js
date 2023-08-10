import BaseCoreModule from 'diagram-js/lib/core';

import GraphicsFactory from './GraphicsFactory';
import Canvas from './Canvas';
import ElementRegistry from './ElementRegistry';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ BaseCoreModule ],
  __init__: [ 'canvas' ],
  canvas: [ 'type', Canvas ],
  graphicsFactory: [ 'type', GraphicsFactory ],
  elementRegistry: [ 'type', ElementRegistry ]
};