import OverlaysModule from 'diagram-js/lib/features/overlays';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';

import SubprocessElements from './SubprocessElements';
import SubprocessCentering from './SubprocessCentering';
import SubprocessCompatibility from './SubprocessCompatibility';
import SubprocessOverlays from './SubprocessOverlays';
import SubprocessFlows from './SubprocessFlows';

export default {
  __depends__: [ OverlaysModule, ChangeSupportModule ],
  __init__: [ 'subprocessElements', 'subprocessOverlays', 'subprocessCompatibility', 'subprocessCentering', 'subprocessFlows' ],
  subprocessElements: [ 'type', SubprocessElements ],
  subprocessOverlays: [ 'type', SubprocessOverlays ],
  subprocessCompatibility: [ 'type', SubprocessCompatibility ],
  subprocessCentering: [ 'type', SubprocessCentering ],
  subprocessFlows: ['type', SubprocessFlows]
};