import DrawModule from '../draw';
import ImportModule from '../import';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    DrawModule,
    ImportModule
  ]
};