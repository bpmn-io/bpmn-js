import OverlaysModule from 'diagram-js/lib/features/overlays';
import ChangeSupportModule from 'diagram-js/lib/features/change-support';
import RootElementsModule from 'diagram-js/lib/features/root-elements';

import DrilldownBreadcrumbs from './DrilldownBreadcrumbs';
import DrilldownCentering from './DrilldownCentering';
import DrilldownElementRefreshBehavior from './DrilldownElementRefreshBehavior';
import SubprocessCompatibility from './SubprocessCompatibility';
import DrilldownOverlayBehavior from './DrilldownOverlayBehavior';

export default {
  __depends__: [ OverlaysModule, ChangeSupportModule, RootElementsModule ],
  __init__: [ 'drilldownBreadcrumbs', 'drilldownOverlayBehavior', 'drilldownCentering', 'drilldownElementRefreshBehavior', 'subprocessCompatibility' ],
  drilldownBreadcrumbs: [ 'type', DrilldownBreadcrumbs ],
  drilldownCentering: [ 'type', DrilldownCentering ],
  drilldownElementRefreshBehavior: [ 'type', DrilldownElementRefreshBehavior ],
  drilldownOverlayBehavior: [ 'type', DrilldownOverlayBehavior ],
  subprocessCompatibility: [ 'type', SubprocessCompatibility ]
};