import AutoPlaceModule from '../auto-place/index.js';
import ComplexPreviewModule from 'diagram-js/lib/features/complex-preview';
import ModelingModule from '../modeling/index.js';

import AppendPreview from './AppendPreview.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    AutoPlaceModule,
    ComplexPreviewModule,
    ModelingModule
  ],
  __init__: [ 'appendPreview' ],
  appendPreview: [ 'type', AppendPreview ]
};
