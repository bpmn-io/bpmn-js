import GlobalConnectModule from 'diagram-js/lib/features/global-connect';

import BpmnGlobalConnect from './BpmnGlobalConnect';

export default {
  __depends__: [
    GlobalConnectModule
  ],
  __init__: [ 'bpmnGlobalConnect' ],
  bpmnGlobalConnect: [ 'type', BpmnGlobalConnect ]
};
