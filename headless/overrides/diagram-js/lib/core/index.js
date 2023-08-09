import BaseCoreModule from 'diagram-js/lib/core';

import GraphicsFactory from './GraphicsFactory';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ BaseCoreModule ],
  __init__: [ 'canvas' ],
  graphicsFactory: [ 'type', GraphicsFactory ]
};