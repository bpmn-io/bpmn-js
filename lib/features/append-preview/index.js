import ComplexPreviewModule from 'diagram-js/lib/features/complex-preview';

import AppendPreview from './AppendPreview';

export default {
  __depends__: [
    ComplexPreviewModule
  ],
  __init__: [ 'appendPreview' ],
  appendPreview: [ 'type', AppendPreview ]
};
