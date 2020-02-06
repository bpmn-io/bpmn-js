import { forEach } from 'min-dash';

import { is } from '../../../util/ModelUtil';

import { isExpanded } from '../../../util/DiUtil';

import {
  PARTICIPANT_MIN_DIMENSIONS,
  SUB_PROCESS_MIN_DIMENSIONS,
  TEXT_ANNOTATION_MIN_DIMENSIONS
} from './ResizeBehavior';

export default function SpaceToolBehavior(eventBus) {
  eventBus.on('spaceTool.getMinDimensions', function(context) {
    var shapes = context.shapes,
        minDimensions = {};

    forEach(shapes, function(shape) {
      var id = shape.id;

      if (is(shape, 'bpmn:Participant')) {
        minDimensions[ id ] = PARTICIPANT_MIN_DIMENSIONS;
      }

      if (is(shape, 'bpmn:SubProcess') && isExpanded(shape)) {
        minDimensions[ id ] = SUB_PROCESS_MIN_DIMENSIONS;
      }

      if (is(shape, 'bpmn:TextAnnotation')) {
        minDimensions[ id ] = TEXT_ANNOTATION_MIN_DIMENSIONS;
      }
    });

    return minDimensions;
  });
}

SpaceToolBehavior.$inject = [ 'eventBus' ];
