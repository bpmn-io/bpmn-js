var _ = require('lodash');

var DEFAULT_BOX_PADDING = 5;

var DEFAULT_LABEL_SIZE = {
  width: 150,
  height: 50
};


function linePadding(height) {
  return Math.floor(height / 5);
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
function LabelUtil(config) {

  config = _.extend({}, {
    size: DEFAULT_LABEL_SIZE,
    padding: DEFAULT_BOX_PADDING,
    style: {},
    align: 'center-top'
  }, config || {});

  /**
   * Create a label in the parent node.
   *
   * @method LabelUtil#createLabel
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
  function createLabel(parent, text, options) {

    var box = _.merge({}, config.size, options.box || {}),
        style = _.merge({}, config.style, options.style || {}),
        align = options.align || config.align,
        padding = options.padding !== undefined ? options.padding : config.padding;

    var lines = text.split(/\r?\n/g),
        layouted = [];

    var maxWidth = box.width - padding * 2;

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
            nextLine = remainder + nextLine;
          }

          lines[0] = nextLine;
        }
        return { width: textBBox.width, height: textBBox.height, text: fitLine };
      }

      function getTextBBox(text) {
        var textElement = parent.text(0, 0, fitLine).attr(style);

        var bbox = textElement.getBBox();

        textElement.remove();
        return bbox;
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
        var shortenedLine = '';

        var approximateLength = line.length * (maxWidth / width);

        // try to shorten semantically (i.e. based on spaces and hyphens)
        shortenedLine = semanticShorten(line, approximateLength);

        if (!shortenedLine) {

          // force shorten by cutting the long word
          shortenedLine = line.slice(0, Math.floor(approximateLength - 1));
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
      return sum + (idx ? linePadding(line.height) : 0) + line.height;
    }, 0);


    // the center x position to align against
    var cx = box.width / 2;

    // the y position of the next line
    var y;

    switch (align) {
      case 'center-middle':
        y = (box.height - totalHeight) / 2 - layouted[0].height / 4;
        break;

      default:
        y = 0;
    }

    var textElement = parent.text(0, 0, '').attr(style);

    _.forEach(layouted, function(line) {
      y += line.height;
      parent.el('tspan', { x: cx, y: y, '#text': line.text, textAnchor: 'middle' }).appendTo(textElement);

      y += linePadding(line.height);
    });

    return textElement;
  }

  // API
  this.createLabel = createLabel;
}


module.exports = LabelUtil;