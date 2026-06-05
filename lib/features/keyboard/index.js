import KeyboardModule from 'diagram-js/lib/features/keyboard';

import BpmnKeyboardBindings from './BpmnKeyboardBindings.js';

export default {
  __depends__: [
    KeyboardModule
  ],
  __init__: [ 'keyboardBindings' ],
  keyboardBindings: [ 'type', BpmnKeyboardBindings ]
};
