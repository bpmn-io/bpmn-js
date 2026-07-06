import { queryAll as domQueryAll } from 'min-dom';

import {
  append as svgAppend,
  attr as svgAttr,
  remove as svgRemove,
} from 'tiny-svg';

import { createLine, updateLine } from 'diagram-js/lib/util/RenderUtil';
import { getMid, getElementLineIntersection } from 'diagram-js/lib/layout/LayoutUtil';
import { getDistancePointPoint } from 'diagram-js/lib/features/bendpoints/GeometricUtil';
import { isLabel } from 'diagram-js/lib/util/ModelUtil';

import { isAny } from '../modeling/util/ModelingUtil';
import { getRoundRectPath, getCirclePath } from '../../draw/BpmnRenderUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/GraphicsFactory').default} GraphicsFactory
 * @typedef {import('../outline/OutlineProvider').default} Outline
 * @typedef {import('diagram-js/lib/features/selection').default} Selection
 *
 * @typedef {import('diagram-js/lib/model/Types').Element} Element
 */

const ALLOWED_ELEMENTS = [ 'bpmn:Event', 'bpmn:SequenceFlow', 'bpmn:Gateway' ];

const LINE_STYLE = {
  class: 'bjs-label-link',
  stroke: 'var(--element-selected-outline-secondary-stroke-color)',
  strokeDasharray: '5, 5',
};

const DISTANCE_THRESHOLD = 15;
const PATH_OFFSET = 2;

/**
 * Render a line between an external label and its target element,
 * when either is selected.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {GraphicsFactory} graphicsFactory
 * @param {Outline} outline
 */
export default function LabelLink(eventBus, canvas, graphicsFactory, outline, selection) {

  const layer = canvas.getLayer('overlays');

  eventBus.on([ 'selection.changed', 'shape.changed' ], function() {
    cleanUp();
  });

  eventBus.on('selection.changed', function({ newSelection }) {

    const allowedElements = newSelection.filter(element => isAny(element, ALLOWED_ELEMENTS));

    if (allowedElements.length === 1) {
      const element = allowedElements[0];
      if (isLabel(element)) {
        createLink(element, element.labelTarget);
      } else if (element.labels?.length) {
        createLink(element.labels[0], element);
      }
    }

    // Only allowed when both label and its target are selected
    if (allowedElements.length === 2) {
      const label = allowedElements.find(isLabel);
      const target = allowedElements.find(el => el.labels?.includes(label));
      if (label && target) {
        createLink(label, target);
      }
    }
  });

  eventBus.on('shape.changed', function({ element }) {

    if (!isAny(element, ALLOWED_ELEMENTS) || !isElementSelected(element)) {
      return;
    }

    if (isLabel(element)) {
      createLink(element, element.labelTarget);
    } else if (element.labels?.length) {
      createLink(element.labels[0], element);
    }
  });

  /**
   * Render a line between an external label and its target.
   *
   * @param {Element} label
   * @param {Element} target
   */
  function createLink(label, target) {

    // Create an auxiliary line between label and target mid points
    const line = createLine(
      [ getMid(target), getMid(label) ],
      LINE_STYLE
    );
    const linePath = line.getAttribute('d');

    // Calculate the intersection point between line and label
    const labelSelected = selection.isSelected(label);
    const labelPath = labelSelected ? getElementOutlinePath(label) : getElementPath(label);
    const labelInter = getElementLineIntersection(labelPath, linePath);

    // Label on top of the target
    if (!labelInter) {
      return;
    }

    // Calculate the intersection point between line and label
    // If the target is a sequence flow, there is no intersection,
    // so we link to the middle of it.
    const targetSelected = selection.isSelected(target);
    const targetPath = targetSelected ? getElementOutlinePath(target) : getElementPath(target);
    const targetInter = getElementLineIntersection(targetPath, linePath) || getMid(target);

    // Do not draw a link if the points are too close
    const distance = getDistancePointPoint(targetInter, labelInter);
    if (distance < DISTANCE_THRESHOLD) {
      return;
    }

    // Connect the actual closest points
    updateLine(line, [ targetInter, labelInter ]);
    svgAppend(layer, line);
  }

  /**
   * Remove all existing label links.
   */
  function cleanUp() {
    domQueryAll(`.${LINE_STYLE.class}`, layer).forEach(svgRemove);
  }

  /**
   * Get element's slightly expanded outline path.
   *
   * @param {Element} element
   * @returns {string} svg path
   */
  function getElementOutlinePath(element) {
    const outlineShape = outline.getOutline(element);

    if (!outlineShape) {
      return getElementPath(element);
    }

    if (outlineShape.x) {
      const shape = {
        x: element.x + parseSvgNumAttr(outlineShape, 'x') - PATH_OFFSET,
        y: element.y + parseSvgNumAttr(outlineShape, 'y') - PATH_OFFSET,
        width: parseSvgNumAttr(outlineShape, 'width') + PATH_OFFSET * 2,
        height: parseSvgNumAttr(outlineShape, 'height') + PATH_OFFSET * 2
      };

      return getRoundRectPath(shape, parseSvgNumAttr(outlineShape, 'rx'));
    }

    if (outlineShape.cx) {
      const radius = parseSvgNumAttr(outlineShape, 'r');

      const shape = {
        x: element.x + parseSvgNumAttr(outlineShape, 'cx') - radius,
        y: element.y + parseSvgNumAttr(outlineShape, 'cy') - radius,
        width: radius * 2,
        height: radius * 2,
      };

      return getCirclePath(shape);
    }
  }

  function getElementPath(element) {
    return graphicsFactory.getShapePath(element);
  }

  function isElementSelected(element) {
    return selection.isSelected(element);
  }
}

LabelLink.$inject = [
  'eventBus',
  'canvas',
  'graphicsFactory',
  'outline',
  'selection'
];

/**
 * Get numeric attribute from SVG element
 * or 0 if not present.
 *
 * @param {SVGElement} node
 * @param {string} attr
 * @returns {number}
 */
function parseSvgNumAttr(node, attr) {
  return parseFloat(svgAttr(node, attr) || 0);
}
