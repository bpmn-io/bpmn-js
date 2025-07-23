import {
  assign
} from 'min-dash';

import { is } from './ModelUtil';

import { isLabel } from 'diagram-js/lib/util/ModelUtil';

export { isLabel } from 'diagram-js/lib/util/ModelUtil';

import { append as svgAppend, attr as svgAttr, create as svgCreate, remove as svgRemove } from 'tiny-svg';

import { assignStyle } from 'min-dom';

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
      if (!semantic[attr]) {
        return element;
      }

      semantic[attr].value = text;
    } else {
      semantic[attr] = text;
    }

  }

  return element;
}

/**
 * Returns true if the given element is an external label.
 *
 * @param {Element} element
 *
 * @return {boolean}
 */
export function isExternalLabel(element) {
  return isLabel(element) && isLabelExternal(element.labelTarget);
}


// ---------- helper svg --------------

function getHelperSvg() {
  let helperSvg = document.getElementById('helper-svg');

  if (!helperSvg) {
    helperSvg = svgCreate('svg');

    svgAttr(helperSvg, { id: 'helper-svg' });

    assignStyle(helperSvg, {
      visibility: 'hidden',
      position: 'fixed',
      width: 0,
      height: 0,
    });

    document.body.appendChild(helperSvg);
  }

  return helperSvg;
}

// ---------- text measurement ---------

function getTextBBox(text, fakeText) {
  fakeText.textContent = text;

  try {
    const emptyLine = text === '';
    fakeText.textContent = emptyLine ? 'dummy' : text;

    const raw = fakeText.getBBox();

    const box = {
      width: raw.width + raw.x * 2,
      height: raw.height,
    };

    if (emptyLine) box.width = 0;

    return box;
  } catch (e) {
    console.warn('BBox failed:', e);
    return { width: 0, height: 0 };
  }
}

// -------- shorten logic ----------

const SOFT_BREAK = '\u00AD';

function semanticShorten(line, maxLength) {
  const parts = line.split(/(\s|-|\u00AD)/g);
  let part;
  const shortenedParts = [];
  let length = 0;

  while ((part = parts.shift())) {
    if (part.length + length < maxLength) {
      shortenedParts.push(part);
      length += part.length;
    } else {
      if (part === '-' || part === SOFT_BREAK) {
        shortenedParts.pop();
      }
      break;
    }
  }

  const last = shortenedParts[shortenedParts.length - 1];
  if (last === SOFT_BREAK) shortenedParts[shortenedParts.length - 1] = '-';

  return shortenedParts.join('');
}

function shortenLine(line, width, maxWidth) {
  const length = Math.max((line.length * maxWidth) / width, 1);
  let shortened = semanticShorten(line, length);

  if (!shortened) {
    shortened = line.slice(0, Math.max(Math.round(length - 1), 1));
  }
  return shortened;
}

// ---------- layout line -------------

function layoutNext(lines, maxWidth, fakeText) {
  const originalLine = lines.shift();
  let fitLine = originalLine;

  for (;;) {
    const bbox = getTextBBox(fitLine, fakeText);
    bbox.width = fitLine ? bbox.width : 0;

    // fits or too short to split
    if (
      fitLine === ' ' ||
            fitLine === '' ||
            bbox.width < Math.round(maxWidth) ||
            fitLine.length < 2
    ) {
      return fit(lines, fitLine, originalLine, bbox);
    }

    // otherwise shorten and try again
    fitLine = shortenLine(fitLine, bbox.width, maxWidth);
  }
}

function fit(lines, fitLine, originalLine, bbox) {
  if (fitLine.length < originalLine.length) {
    const remainder = originalLine.slice(fitLine.length).trim();
    lines.unshift(remainder);
  }
  return {
    text: fitLine,
    width: Math.round(bbox.width),
    height: bbox.height,
  };
}


// =====================================================
//              PUBLIC: measureTextLines()
// =====================================================

export function measureTextLines(text, style, maxWidth, isTextAnnotation) {

  // prepare helper text node
  const helperText = svgCreate('text');
  svgAttr(helperText, { x: 0, y: 0 });
  svgAttr(helperText, style);

  const helperSvg = getHelperSvg();
  svgAppend(helperSvg, helperText);

  const lines = text.split(/\u00AD?\r?\n/);
  const results = [];

  while (lines.length) {
    const line = layoutNext(lines, maxWidth, helperText, isTextAnnotation);
    results.push(line);
  }

  svgRemove(helperText);

  return results;
}


export function changeBounds(newBounds, element) {
  element.x = newBounds.x;
  element.y = newBounds.y;
  element.width = newBounds.width;
  element.height = newBounds.height;
}


export function getTextAnnotationHeightFromElement(text) {
  return Math.max(text.lastChild.y.animVal[0].value, 30) + 10;
}

export function getTextWidthForTextAnnotation(text, width) {

  if ((text.textContent === '')) {
    return 100;
  }

  let lineLengths = Array.from(measureTextLines(text.textContent, getStyleFromTextannotation(text), width + 5, true))
    .map(elem => elem.width);

  return Math.round(Math.max(...lineLengths));
}

export function canHandleLabelResize(event) {
  const element = event.element,

        currentlabel = getLabel(element),

        renderedLabel = getGfxLabel(event.gfx, currentlabel);

  if (currentlabel !== renderedLabel) {
    return true;
  }
  let renderedLabelHeight = getTextHeightForLabel(event),
      renderedLabelWidth = getTextWidthForLabel(event);
  return !!hasMoreDiffThan(element, renderedLabelHeight, renderedLabelWidth, 5);

}

export function getConnectionGfx(event, connection) {
  const children = event.gfx.parentElement.parentElement.children;
  for (let child of children) {
    const dataElementId = child.firstChild.attributes?.getNamedItem('data-element-id').value;
    if (connection.id === dataElementId) {
      return child;
    }
  }
}

export function getTextHeightForTextAnnotation(event) {
  return Math.max(event.gfx.firstChild.children[1].lastChild.y.animVal[0].value, 30) + 10;
}

export function getTextHeightForLabel(event) {
  const text = event.gfx.firstChild.firstChild;
  return Math.max(Math.round(text.lastChild.y.animVal[0].value), 15);
}

export function getTextWidthForLabel(event) {
  let lineLengths = Array.from(measureTextLines(getGfxLabel(event.gfx), getStyleFromLabel(event), event.element.width + 5))
    .map(elem => elem.width);

  return Math.round(Math.max(...lineLengths));
}

export function getGfxLabel(gfx) {
  return Array.from(gfx.firstChild.firstChild.children)
    .map(child => child.textContent)
    .join('');
}

export function hasMoreDiffThan(element, height, width, padding) {
  return Math.abs(element.width - width) > padding || Math.abs(element.height - height) > padding;
}

function parseStyleFromNode(node) {
  const styleString = node.attributes.style.nodeValue;
  let style = Object.fromEntries(
    styleString.split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const [ key, value ] = part.split(':').map(s => s.trim());
        return [ key, value ];
      })
  );
  style['lineHeight'] = node.attributes.lineHeight.nodeValue;
  return style;
}

export function getStyleFromLabel(event) {
  return parseStyleFromNode(event.gfx.firstChild.firstChild);
}

function getStyleFromTextannotation(text) {
  return parseStyleFromNode(text);
}