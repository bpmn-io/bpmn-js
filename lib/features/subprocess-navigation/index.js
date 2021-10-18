import OverlaysModule from 'diagram-js/lib/features/overlays';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';

import SubprocessCentering from './SubprocessCentering';
import SubprocessCompatibility from './SubprocessCompatibility';
import SubprocessOverlays from './SubprocessOverlays';

export default {
  __depends__: [ OverlaysModule, ChangeSupportModule ],
  __init__: [ 'subprocessOverlays', 'subprocessCompatibility', 'subprocessCentering' ],
  subprocessOverlays: [ 'type', SubprocessOverlays ],
  subprocessCompatibility: [ 'type', SubprocessCompatibility ],
  subprocessCentering: [ 'type', SubprocessCentering ]
};