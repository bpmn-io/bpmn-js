import OverlaysModule from 'diagram-js/lib/features/overlays';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import PlanesModule from 'diagram-js/lib/features/planes';

import DrilldownBreadcrumbs from './DrilldownBreadcrumbs';
import DrilldownCentering from './DrilldownCentering';
import SubprocessCompatibility from './SubprocessCompatibility';
import DrilldownOverlayBehavior from './DrilldownOverlayBehavior';

export default {
  __depends__: [ OverlaysModule, ChangeSupportModule, PlanesModule ],
  __init__: [ 'drilldownBreadcrumbs', 'drilldownOverlayBehavior', 'drilldownCentering', 'subprocessCompatibility'],
  drilldownBreadcrumbs: [ 'type', DrilldownBreadcrumbs ],
  drilldownCentering: [ 'type', DrilldownCentering ],
  drilldownOverlayBehavior: [ 'type', DrilldownOverlayBehavior ],
  subprocessCompatibility: [ 'type', SubprocessCompatibility ]
};