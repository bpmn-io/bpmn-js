import DrawModule from '../draw/index.js';
import ImportModule from '../import/index.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    DrawModule,
    ImportModule
  ]
};