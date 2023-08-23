import {
  assign
} from 'min-dash';

import { is } from './ModelUtil';

import { isLabel } from 'diagram-js/lib/util/ModelUtil';

export { isLabel } from 'diagram-js/lib/util/ModelUtil';

/**
 * @typedef {import('diagram-js/lib/util/Types').Point} Point
 * @typedef {import('diagram-js/lib/util/Types').Rect} Rect
 *
 * @typedef {import('../model/Types').Element} Element
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */

export var DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20
};

export var FLOW_LABEL_INDENT = 15;


/**
 * Return true if the given semantic has an external label.
 *
 * @param {Element} semantic
 *
 * @return {boolean}
 */
export function isLabelExternal(semantic) {
  return is(semantic, 'bpmn:Event') ||
         is(semantic, 'bpmn:Gateway') ||
         is(semantic, 'bpmn:DataStoreReference') ||
         is(semantic, 'bpmn:DataObjectReference') ||
         is(semantic, 'bpmn:DataInput') ||
         is(semantic, 'bpmn:DataOutput') ||
         is(semantic, 'bpmn:SequenceFlow') ||
         is(semantic, 'bpmn:MessageFlow') ||
         is(semantic, 'bpmn:Group');
}

/**
 * Return true if the given element has an external label.
 *
 * @param {Element} element
 *
 * @return {boolean}
 */
export function hasExternalLabel(element) {
  return isLabel(element.label);
}

/**
 * Get the position of a sequence flow label.
 *
 * @param  {Point[]} waypoints
 *
 * @return {Point}
 */
export function getFlowLabelPosition(waypoints) {

  // get the waypoints mid
  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  // get position
  var position = getWaypointsMid(waypoints);

  // calculate angle
  var angle = Math.atan((second.y - first.y) / (second.x - first.x));

  var x = position.x,
      y = position.y;

  if (Math.abs(angle) < Math.PI / 2) {
    y -= FLOW_LABEL_INDENT;
  } else {
    x += FLOW_LABEL_INDENT;
  }

  return { x: x, y: y };
}


/**
 * Get the middle of a number of waypoints.
 *
 * @param  {Point[]} waypoints
 *
 * @return {Point}
 */
export function getWaypointsMid(waypoints) {

  var mid = waypoints.length / 2 - 1;

  var first = waypoints[Math.floor(mid)];
  var second = waypoints[Math.ceil(mid + 0.01)];

  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  };
}

/**
 * Get the middle of the external label of an element.
 *
 * @param {Element} element
 *
 * @return {Point}
 */
export function getExternalLabelMid(element) {

  if (element.waypoints) {
    return getFlowLabelPosition(element.waypoints);
  } else if (is(element, 'bpmn:Group')) {
    return {
      x: element.x + element.width / 2,
      y: element.y + DEFAULT_LABEL_SIZE.height / 2
    };
  } else {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height + DEFAULT_LABEL_SIZE.height / 2
    };
  }
}


/**
 * Return the bounds of an elements label, parsed from the elements DI or
 * generated from its bounds.
 *
 * @param {ModdleElement} di
 * @param {Element} element
 *
 * @return {Rect}
 */
export function getExternalLabelBounds(di, element) {

  var mid,
      size,
      bounds,
      label = di.label;

  if (label && label.bounds) {
    bounds = label.bounds;

    size = {
      width: Math.max(DEFAULT_LABEL_SIZE.width, bounds.width),
      height: bounds.height
    };

    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
  } else {

    mid = getExternalLabelMid(element);

    size = DEFAULT_LABEL_SIZE;
  }

  return assign({
    x: mid.x - size.width / 2,
    y: mid.y - size.height / 2
  }, size);
}

/**
 * @param {ModdleElement} semantic
 *
 * @returns {string}
 */
function getLabelAttr(semantic) {
  if (
    is(semantic, 'bpmn:FlowElement') ||
    is(semantic, 'bpmn:Participant') ||
    is(semantic, 'bpmn:Lane') ||
    is(semantic, 'bpmn:SequenceFlow') ||
    is(semantic, 'bpmn:MessageFlow') ||
    is(semantic, 'bpmn:DataInput') ||
    is(semantic, 'bpmn:DataOutput')
  ) {
    return 'name';
  }

  if (is(semantic, 'bpmn:TextAnnotation')) {
    return 'text';
  }

  if (is(semantic, 'bpmn:Group')) {
    return 'categoryValueRef';
  }
}

/**
 * @param {ModdleElement} semantic
 *
 * @returns {string}
 */
function getCategoryValue(semantic) {
  var categoryValueRef = semantic['categoryValueRef'];

  if (!categoryValueRef) {
    return '';
  }


  return categoryValueRef.value || '';
}

/**
 * @param {Element} element
 *
 * @return {string}
 */
export function getLabel(element) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {

    if (attr === 'categoryValueRef') {

      return getCategoryValue(semantic);
    }

    return semantic[attr] || '';
  }
}


/**
 * @param {Element} element
 * @param {string} text
 *
 * @return {Element}
 */
export function setLabel(element, text) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {

    if (attr === 'categoryValueRef') {
      semantic['categoryValueRef'].value = text;
    } else {
      semantic[attr] = text;
    }

  }

  return element;
}
