import {
  mid,
  setSnapped
} from 'diagram-js/lib/features/snapping/SnapUtil';

import { isCmd } from 'diagram-js/lib/features/keyboard/KeyboardUtil';

import { is } from '../../util/ModelUtil';

import { some } from 'min-dash';

var HIGHER_PRIORITY = 1250;


/**
 * Snap during connect.
 *
 * @param {EventBus} eventBus
 * @param {Rules} rules
 */
export default function BpmnConnectSnapping(eventBus, rules) {
  eventBus.on([
    'connect.hover',
    'connect.move',
    'connect.end',
  ], HIGHER_PRIORITY, function(event) {
    var context = event.context,
        source = context.source,
        target = context.target;

    if (event.originalEvent && isCmd(event.originalEvent)) {
      return;
    }

    if (!context.initialSourcePosition) {
      context.initialSourcePosition = context.sourcePosition;
    }

    var connectionAttrs = rules.allowed('connection.create', {
      source: source,
      target: target
    });

    if (target && isAnyType(connectionAttrs, [
      'bpmn:Association',
      'bpmn:DataInputAssociation',
      'bpmn:DataOutputAssociation',
      'bpmn:SequenceFlow'
    ])) {

      // snap source
      context.sourcePosition = mid(source);

      // snap target
      snapToPosition(event, mid(target));
    } else if (isType(connectionAttrs, 'bpmn:MessageFlow')) {

      if (is(source, 'bpmn:Event')) {

        // snap source
        context.sourcePosition = mid(source);
      }

      if (is(target, 'bpmn:Event')) {

        // snap target
        snapToPosition(event, mid(target));
      }

    } else {

      // un-snap source
      context.sourcePosition = context.initialSourcePosition;
    }
  });
}

BpmnConnectSnapping.$inject = [
  'eventBus',
  'rules'
];

// helpers //////////

function snapToPosition(event, position) {
  setSnapped(event, 'x', position.x);
  setSnapped(event, 'y', position.y);
}

function isType(attrs, type) {
  return attrs && attrs.type === type;
}

function isAnyType(attrs, types) {
  return some(types, function(type) {
    return isType(attrs, type);
  });
}