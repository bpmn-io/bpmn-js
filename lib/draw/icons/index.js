import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import cancel from './cancel.svg';
import cancelFilled from './cancel-filled.svg';
import compensation from './compensation.svg';
import compensationFilled from './compensation-filled.svg';
import conditional from './conditional.svg';
import error from './error.svg';
import errorFilled from './error-filled.svg';
import escalation from './escalation.svg';
import escalationFilled from './escalation-filled.svg';
import link from './link.svg';
import linkFilled from './link-filled.svg';
import messageSvg from './message.svg';
import messageFilledSvg from './message-filled.svg';
import multiple from './multiple.svg';
import multipleFilled from './multiple-filled.svg';
import multipleParallel from './multiple-parallel.svg';
import signal from './signal.svg';
import signalFilled from './signal-filled.svg';
import timerSvg from './timer.svg';

import businessRule from './business-rule.svg';
import manual from './manual.svg';
import receive from './receive.svg';
import script from './script.svg';
import send from './send.svg';
import service from './service.svg';
import user from './user.svg';

import complex from './complex.svg';
import eventBased from './event-based.svg';
import eventBasedParallel from './event-based-parallel.svg';
import exclusive from './exclusive.svg';
import parallel from './parallel.svg';

import adhoc from './adhoc.svg';
import collapsed from './collapsed.svg';
import loop from './loop.svg';
import loopParallel from './loop-parallel.svg';
import loopSequential from './loop-sequential.svg';

const DEFAULT_ICON_FILL_COLOR = 'white';
const DEFAULT_ICON_STROKE_COLOR = 'fuchsia';

const parser = new DOMParser();

export const svgStrings = {
  'cancel': cancel,
  'cancel-filled': cancelFilled,
  'compensation': compensation,
  'compensation-filled': compensationFilled,
  'conditional': conditional,
  'error': error,
  'error-filled': errorFilled,
  'escalation': escalation,
  'escalation-filled': escalationFilled,
  'link': link,
  'link-filled': linkFilled,
  'message': messageSvg,
  'message-filled': messageFilledSvg,
  'multiple': multiple,
  'multiple-filled': multipleFilled,
  'multiple-parallel': multipleParallel,
  'signal': signal,
  'signal-filled': signalFilled,
  'timer': timerSvg,

  'business-rule': businessRule,
  'manual': manual,
  'receive': receive,
  'script': script,
  'send': send,
  'service': service,
  'user': user,

  'complex': complex,
  'event-based': eventBased,
  'event-based-parallel': eventBasedParallel,
  'exclusive': exclusive,
  'parallel': parallel,

  'adhoc': adhoc,
  'collapsed': collapsed,
  'loop': loop,
  'loop-parallel': loopParallel,
  'loop-sequential': loopSequential
};

function getSvgWidth(svg) {
  return parseFloat(svgAttr(svg, 'width'));
}

function getSvgHeight(svg) {
  return parseFloat(svgAttr(svg, 'height'));
}

/**
 * @param {SVGAElement} svg
 * @param {SVGPathElement} path
 * @param {number} maxWidth Maximum width depending on aspect ratio
 * @param {number} maxHeight Maximum height depending on aspect ratio
 *
 * @returns {string}
 */
export function getScaledPathData(svg, path, maxWidth, maxHeight) {
  const pathData = path.getAttribute('d');

  return pathData.replace(/([0-9-.]+)/g, (match) => {
    return (parseFloat(match) * getScale(svg, maxWidth, maxHeight)).toFixed(2);
  });
}

function getScale(svg, maxWidth, maxHeight) {
  const width = getSvgWidth(svg),
        height = getSvgHeight(svg);

  const scaleX = maxWidth / width,
        scaleY = maxHeight / height;

  return Math.min(scaleX, scaleY);
}

function parseSvg(svgString) {
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  return doc.querySelector('svg');
}

/**
 * @param {string} path
 * @param {number} width
 * @param {number} height
 *
 * @returns {SVGAElement}
 */
export function getIcon(id, options) {
  const {
    width,
    height,
    box,
    attrs = {}
  } = options;

  const svgString = svgStrings[id];

  if (!svgString) {
    throw new Error(`icon ${id} not found`);
  }

  const svg = parseSvg(svgString);

  const paths = Array.from(svg.querySelectorAll('path'));

  paths.forEach((path) => {
    svgAttr(path, {
      d: getScaledPathData(svg, path, width, height)
    });
  });

  const svgWidth = getSvgWidth(svg),
        svgHeight = getSvgHeight(svg);

  const scale = getScale(svg, width, height);

  const translateX = (box.width - svgWidth * scale) / 2 + (box.x || 0),
        translateY = (box.height - svgHeight * scale) / 2 + (box.y || 0);

  const parent = svgCreate('g', {
    transform: `translate(${ translateX }, ${ translateY })`
  });

  Array.from(svg.children).forEach((child) => {
    if (attrs.fill) {

      if (child.getAttribute('fill') === DEFAULT_ICON_FILL_COLOR) {
        child.setAttribute('fill', attrs.fill);
      } else if (child.getAttribute('stroke') === DEFAULT_ICON_FILL_COLOR) {
        child.setAttribute('stroke', attrs.fill);
      }

    }

    if (attrs.stroke) {

      if (child.getAttribute('fill') === DEFAULT_ICON_STROKE_COLOR) {
        child.setAttribute('fill', attrs.stroke);
      } else if (child.getAttribute('stroke') === DEFAULT_ICON_STROKE_COLOR) {
        child.setAttribute('stroke', attrs.stroke);
      }

    }

    parent.appendChild(child);
  });

  return parent;
}