import Copilot from './Copilot';
import OpenAIProvider from './OpenAIProvider';

export default {
  __depends__: [

    // TODO
  ],
  __init__: [
    'copilot',
    'openaiprovider'
  ],
  copilot: [ 'type', Copilot ],
  openaiprovider: [ 'type', OpenAIProvider ]
};