'use strict';

var Snap = require('snapsvg');
var _ = require('lodash');

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

  if (_.isObject(padding)) {
    return _.extend({ top: 0, left: 0, right: 0, bottom: 0 }, padding);
  } else {
    return {
      top: padding,
      left: padding,
      right: padding,
      bottom: padding
    };
  }
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

  this._config = _.extend({}, {
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

  var box = _.merge({}, this._config.size, options.box || {}),
      style = _.merge({}, this._config.style, options.style || {}),
      align = parseAlign(options.align || this._config.align),
      padding = parsePadding(options.padding !== undefined ? options.padding : this._config.padding);

  var lines = text.split(/\r?\n/g),
      layouted = [];

  var maxWidth = box.width - padding.left - padding.right;

  var fakeText = parent.text(0, 0, '').attr(style).node;
  // FF regression: ensure text is shown during rendering
  // by attaching it directly to the body
  fakeText.ownerSVGElement.appendChild(fakeText);

  /**
   * Layout the next line and return the layouted element.
   *
   * Alters the lines passed.
   *
   * @param  {Array<String>} lines
   * @return {Object} the line descriptor, an object { width, height, text }
   */
  function layoutNext(lines) {

    var originalLine = lines.shift(),
        fitLine = originalLine;

    var textBBox;

    function fit() {
      if (fitLine.length < originalLine.length) {
        var nextLine = lines[0] || '',
            remainder = originalLine.slice(fitLine.length);

        if (/-\s*$/.test(remainder)) {
          nextLine = remainder.replace(/-\s*$/, '') + nextLine.replace(/^\s+/, '');
        } else {
          nextLine = remainder + ' ' + nextLine;
        }

        lines[0] = nextLine;
      }
      return { width: textBBox.width, height: textBBox.height, text: fitLine };
    }

    function getTextBBox(text) {
      fakeText.textContent = text;
      return fakeText.getBBox();
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
      var length = line.length * (maxWidth / width);

      // try to shorten semantically (i.e. based on spaces and hyphens)
      var shortenedLine = semanticShorten(line, length);

      if (!shortenedLine) {

        // force shorten by cutting the long word
        shortenedLine = line.slice(0, Math.floor(length - 1));
      }

      return shortenedLine;
    }


    while (true) {

      textBBox = getTextBBox(fitLine);

      // try to fit
      if (textBBox.width < maxWidth) {
        return fit();
      }

      fitLine = shortenLine(fitLine, textBBox.width, maxWidth);
    }
  }

  while (lines.length) {
    layouted.push(layoutNext(lines));
  }

  var totalHeight = _.reduce(layouted, function(sum, line, idx) {
    return sum + line.height;
  }, 0);


  // the center x position to align against
  var cx = box.width / 2;

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

  _.forEach(layouted, function(line) {
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
        x = (maxWidth - line.width) / 2 + padding.left;
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