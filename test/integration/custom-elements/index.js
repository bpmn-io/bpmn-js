import CustomElementFactory from './CustomElementFactory';
import CustomRenderer from './CustomRenderer';
import CustomRules from './CustomRules';
import CustomUpdater from './CustomUpdater';

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
