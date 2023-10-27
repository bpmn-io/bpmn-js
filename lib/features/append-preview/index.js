import AutoPlaceModule from '../auto-place';
import ComplexPreviewModule from 'diagram-js/lib/features/complex-preview';
import ModelingModule from '../modeling';

import AppendPreview from './AppendPreview';

export default {
  __depends__: [
    AutoPlaceModule,
    ComplexPreviewModule,
    ModelingModule
  ],
  __init__: [ 'appendPreview' ],
  appendPreview: [ 'type', AppendPreview ]
};
