import { getNewShapePosition } from '../../auto-place/BpmnAutoPlaceUtil';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';
import { is } from '../../../util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/grid-snapping/GridSnapping').default} GridSnapping
 *
 * @typedef {import('diagram-js/lib/util/Types').Axis} Axis
 */

var HIGH_PRIORITY = 2000;

/**
 * @param {EventBus} eventBus
 * @param {GridSnapping} gridSnapping
 */
export default function GridSnappingAutoPlaceBehavior(eventBus, gridSnapping) {
  eventBus.on('autoPlace', HIGH_PRIORITY, function(context) {
    var source = context.source,
        sourceMid = getMid(source),
        shape = context.shape;

    var position = getNewShapePosition(source, shape);

    [ 'x', 'y' ].forEach(function(axis) {
      var options = {};

      // do not snap if x/y equal
      if (position[ axis ] === sourceMid[ axis ]) {
        return;
      }

      if (position[ axis ] > sourceMid[ axis ]) {
        options.min = position[ axis ];
      } else {
        options.max = position[ axis ];
      }

      if (is(shape, 'bpmn:TextAnnotation')) {

        if (isHorizontal(axis)) {
          options.offset = -shape.width / 2;
        } else {
          options.offset = -shape.height / 2;
        }

      }

      position[ axis ] = gridSnapping.snapValue(position[ axis ], options);

    });

    // must be returned to be considered by auto place
    return position;
  });
}

GridSnappingAutoPlaceBehavior.$inject = [
  'eventBus',
  'gridSnapping'
];

// helpers //////////

/**
 * @param {Axis} axis
 *
 * @return {boolean}
 */
function isHorizontal(axis) {
  return axis === 'x';
}