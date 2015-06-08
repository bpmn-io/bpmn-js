'use strict';

var isObject = require('lodash/lang/isObject'),
    assign = require('lodash/object/assign'),
    pick = require('lodash/object/pick'),
    forEach = require('lodash/collection/forEach'),
    reduce = require('lodash/collection/reduce'),
    merge = require('lodash/object/merge');

var Snap = require('../../vendor/snapsvg');

var DEFAULT_BOX_PADDING = 0;

var DEFAULT_LABEL_SIZE = {
  width: 150,
  height: 50
};


function parseAlign(align) {

  var parts = align.split('-');

  return {
    horizontal: parts[0] || 'center',
    vertical: parts[1] || 'top'
  };
}

function parsePadding(padding) {

  if (isObject(padding)) {
    return assign({ top: 0, left: 0, right: 0, bottom: 0 }, padding);
  } else {
    return {
      top: padding,
      left: padding,
      right: padding,
      bottom: padding
    };
  }
}

function getTextBBox(text, fakeText) {
  fakeText.textContent = text;
  return pick(fakeText.getBBox(), [ 'width', 'height' ]);
}


/**
 * Layout the next line and return the layouted element.
 *
 * Alters the lines passed.
 *
 * @param  {Array<String>} lines
 * @return {Object} the line descriptor, an object { width, height, text }
 */
function layoutNext(lines, maxWidth, fakeText) {

  var originalLine = lines.shift(),
      fitLine = originalLine;

  var textBBox;

  while (true) {
    textBBox = getTextBBox(fitLine, fakeText);

    textBBox.width = fitLine ? textBBox.width : 0;

    // try to fit
    if (fitLine === ' ' || fitLine === '' || textBBox.width < Math.round(maxWidth) || fitLine.length < 4) {
      return fit(lines, fitLine, originalLine, textBBox);
    }

    fitLine = shortenLine(fitLine, textBBox.width, maxWidth);
  }
}

function fit(lines, fitLine, originalLine, textBBox) {
  if (fitLine.length < originalLine.length) {
    var nextLine = lines[0] || '',
        remainder = originalLine.slice(fitLine.length).trim();

    if (/-\s*$/.test(remainder)) {
      nextLine = remainder.replace(/-\s*$/, '') + nextLine.replace(/^\s+/, '');
    } else {
      nextLine = remainder + ' ' + nextLine;
    }

    lines[0] = nextLine;
  }
  return { width: textBBox.width, height: textBBox.height, text: fitLine };
}


/**
 * Shortens a line based on spacing and hyphens.
 * Returns the shortened result on success.
 *
 * @param  {String} line
 * @param  {Number} maxLength the maximum characters of the string
 * @return {String} the shortened string
 */
function semanticShorten(line, maxLength) {
  var parts = line.split(/(\s|-)/g),
      part,
      shortenedParts = [],
      length = 0;

  // try to shorten via spaces + hyphens
  if (parts.length > 1) {
    while ((part = parts.shift())) {
      if (part.length + length < maxLength) {
        shortenedParts.push(part);
        length += part.length;
      } else {
        // remove previous part, too if hyphen does not fit anymore
        if (part === '-') {
          shortenedParts.pop();
        }

        break;
      }
    }
  }

  return shortenedParts.join('');
}


function shortenLine(line, width, maxWidth) {
  var length = Math.max(line.length * (maxWidth / width), 1);

  // try to shorten semantically (i.e. based on spaces and hyphens)
  var shortenedLine = semanticShorten(line, length);

  if (!shortenedLine) {

    // force shorten by cutting the long word
    shortenedLine = line.slice(0, Math.max(Math.round(length - 1), 1));
  }

  return shortenedLine;
}


/**
 * Creates a new label utility
 *
 * @param {Object} config
 * @param {Dimensions} config.size
 * @param {Number} config.padding
 * @param {Object} config.style
 * @param {String} config.align
 */
function Text(config) {

  this._config = assign({}, {
    size: DEFAULT_LABEL_SIZE,
    padding: DEFAULT_BOX_PADDING,
    style: {},
    align: 'center-top'
  }, config || {});
}


/**
 * Create a label in the parent node.
 *
 * @method Text#createText
 *
 * @param {SVGElement} parent the parent to draw the label on
 * @param {String} text the text to render on the label
 * @param {Object} options
 * @param {String} options.align how to align in the bounding box.
 *                             Any of { 'center-middle', 'center-top' }, defaults to 'center-top'.
 * @param {String} options.style style to be applied to the text
 *
 * @return {SVGText} the text element created
 */
Text.prototype.createText = function(parent, text, options) {

  var box = merge({}, this._config.size, options.box || {}),
      style = merge({}, this._config.style, options.style || {}),
      align = parseAlign(options.align || this._config.align),
      padding = parsePadding(options.padding !== undefined ? options.padding : this._config.padding);

  var lines = text.split(/\r?\n/g),
      layouted = [];

  var maxWidth = box.width - padding.left - padding.right;

  // FF regression: ensure text is shown during rendering
  // by attaching it directly to the body
  var fakeText = parent.paper.text(0, 0, '').attr(style).node;

  while (lines.length) {
    layouted.push(layoutNext(lines, maxWidth, fakeText));
  }

  var totalHeight = reduce(layouted, function(sum, line, idx) {
    return sum + line.height;
  }, 0);

  // the y position of the next line
  var y, x;

  switch (align.vertical) {
    case 'middle':
      y = (box.height - totalHeight) / 2 - layouted[0].height / 4;
      break;

    default:
      y = padding.top;
  }

  var textElement = parent.text().attr(style);

  forEach(layouted, function(line) {
    y += line.height;

    switch (align.horizontal) {
      case 'left':
        x = padding.left;
        break;

      case 'right':
        x = (maxWidth - padding.right - line.width);
        break;

      default:
        // aka center
        x = Math.max(((maxWidth - line.width) / 2 + padding.left), 0);
    }


    var tspan = Snap.create('tspan', { x: x, y: y }).node;
    tspan.textContent = line.text;

    textElement.append(tspan);
  });

  // remove fake text
  fakeText.parentNode.removeChild(fakeText);

  return textElement;
};


module.exports = Text;
