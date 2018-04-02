import translate from 'diagram-js/lib/i18n/translate';

import BpmnImporter from './BpmnImporter';

export default {
  __depends__: [
    translate
  ],
  bpmnImporter: [ 'type', BpmnImporter ]
};