import OverlaysModule from 'diagram-js/lib/features/overlays';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';

import DrilldownOverlays from './DrilldownOverlays';
import DrilldownCentering from './DrilldownCentering';
import SubprocessCompatibility from './SubprocessCompatibility';

export default {
  __depends__: [ OverlaysModule, ChangeSupportModule ],
  __init__: [ 'drilldownOverlays', 'drilldownCentering', 'subprocessCompatibility'],
  drilldownOverlays: [ 'type', DrilldownOverlays ],
  drilldownCentering: [ 'type', DrilldownCentering ],
  subprocessCompatibility: [ 'type', SubprocessCompatibility ]
};