import { assign } from 'min-dash';

import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import {
  is,
  isAny
} from '../../util/ModelUtil';

import { isLabel } from '../../util/LabelUtil';

import {
  DATA_OBJECT_REFERENCE_OUTLINE_PATH,
  DATA_STORE_REFERENCE_OUTLINE_PATH,
  DATA_OBJECT_REFERENCE_STANDARD_SIZE,
  DATA_STORE_REFERENCE_STANDARD_SIZE,
  createPath
} from './OutlineUtil';

const DEFAULT_OFFSET = 5;

/**
 * BPMN-specific outline provider.
 *
 * @implements {BaseOutlineProvider}
 *
 * @param {Outline} outline
 * @param {Styles} styles
 */
export default function OutlineProvider(outline, styles) {

  this._styles = styles;
  outline.registerProvider(this);
}

OutlineProvider.$inject = [
  'outline',
  'styles'
];

/**
 * Returns outline for a given element.
 *
 * @param {Element} element
 *
 * @return {Outline}
 */
OutlineProvider.prototype.getOutline = function(element) {

  const OUTLINE_STYLE = this._styles.cls('djs-outline', [ 'no-fill' ]);

  var outline;

  if (isLabel(element)) {
    return;
  }

  if (is(element, 'bpmn:Gateway')) {
    outline = svgCreate('rect');

    assign(outline.style, {
      'transform-box': 'fill-box',
      'transform': 'rotate(45deg)',
      'transform-origin': 'center'
    });

    svgAttr(outline, assign({
      x: 2,
      y: 2,
      rx: 4,
      width: element.width - 4,
      height: element.height - 4,
    }, OUTLINE_STYLE));

  } else if (isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess', 'bpmn:Group', 'bpmn:CallActivity' ])) {
    outline = svgCreate('rect');

    svgAttr(outline, assign({
      x: -DEFAULT_OFFSET,
      y: -DEFAULT_OFFSET,
      rx: 14,
      width: element.width + DEFAULT_OFFSET * 2,
      height: element.height + DEFAULT_OFFSET * 2
    }, OUTLINE_STYLE));

  } else if (is(element, 'bpmn:EndEvent')) {

    outline = svgCreate('circle');

    // Extra 1px offset needed due to increased stroke-width of end event
    // which makes it bigger than other events.

    svgAttr(outline, assign({
      cx: element.width / 2,
      cy: element.height / 2,
      r: element.width / 2 + DEFAULT_OFFSET + 1
    }, OUTLINE_STYLE));

  } else if (is(element, 'bpmn:Event')) {
    outline = svgCreate('circle');

    svgAttr(outline, assign({
      cx: element.width / 2,
      cy: element.height / 2,
      r: element.width / 2 + DEFAULT_OFFSET
    }, OUTLINE_STYLE));

  } else if (is(element, 'bpmn:DataObjectReference') && isStandardSize(element, 'bpmn:DataObjectReference')) {

    outline = createPath(
      DATA_OBJECT_REFERENCE_OUTLINE_PATH,
      { x: -6, y: -6 },
      OUTLINE_STYLE
    );

  } else if (is(element, 'bpmn:DataStoreReference') && isStandardSize(element, 'bpmn:DataStoreReference')) {

    outline = createPath(
      DATA_STORE_REFERENCE_OUTLINE_PATH,
      { x: -6, y: -6 },
      OUTLINE_STYLE
    );
  }

  return outline;
};

/**
 * Updates the outline for a given element.
 * Returns true if the update for the given element was handled by this provider.
 *
 * @param {Element} element
 * @param {Outline} outline
 * @returns {boolean}
 */
OutlineProvider.prototype.updateOutline = function(element, outline) {

  if (isLabel(element)) {
    return;
  }

  if (isAny(element, [ 'bpmn:SubProcess', 'bpmn:Group' ])) {

    svgAttr(outline, {
      width: element.width + DEFAULT_OFFSET * 2,
      height: element.height + DEFAULT_OFFSET * 2
    });

    return true;

  } else if (isAny(element, [
    'bpmn:Event',
    'bpmn:Gateway',
    'bpmn:DataStoreReference',
    'bpmn:DataObjectReference'
  ])) {
    return true;
  }

  return false;
};


// helpers //////////

function isStandardSize(element, type) {
  var standardSize;

  if (type === 'bpmn:DataObjectReference') {
    standardSize = DATA_OBJECT_REFERENCE_STANDARD_SIZE;
  } else if (type === 'bpmn:DataStoreReference') {
    standardSize = DATA_STORE_REFERENCE_STANDARD_SIZE;
  }

  return element.width === standardSize.width
          && element.height === standardSize.height;
}