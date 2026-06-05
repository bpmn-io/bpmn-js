import CustomElementFactory from './CustomElementFactory.js';
import CustomRenderer from './CustomRenderer.js';
import CustomRules from './CustomRules.js';
import CustomUpdater from './CustomUpdater.js';

export default {
  __init__: [
    'customRenderer',
    'customRules',
    'customUpdater'
  ],
  elementFactory: [ 'type', CustomElementFactory ],
  customRenderer: [ 'type', CustomRenderer ],
  customRules: [ 'type', CustomRules ],
  customUpdater: [ 'type', CustomUpdater ]
};
