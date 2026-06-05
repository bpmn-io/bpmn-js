import OverlaysModule from 'diagram-js/lib/features/overlays';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import RootElementsModule from 'diagram-js/lib/features/root-elements';

import DrilldownBreadcrumbs from './DrilldownBreadcrumbs.js';
import DrilldownCentering from './DrilldownCentering.js';
import SubprocessCompatibility from './SubprocessCompatibility.js';
import DrilldownOverlayBehavior from './DrilldownOverlayBehavior.js';

export default {
  __depends__: [ OverlaysModule, ChangeSupportModule, RootElementsModule ],
  __init__: [ 'drilldownBreadcrumbs', 'drilldownOverlayBehavior', 'drilldownCentering', 'subprocessCompatibility' ],
  drilldownBreadcrumbs: [ 'type', DrilldownBreadcrumbs ],
  drilldownCentering: [ 'type', DrilldownCentering ],
  drilldownOverlayBehavior: [ 'type', DrilldownOverlayBehavior ],
  subprocessCompatibility: [ 'type', SubprocessCompatibility ]
};