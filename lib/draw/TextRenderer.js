import { assign } from 'min-dash';

import TextUtil from 'diagram-js/lib/util/Text';

var DEFAULT_FONT_SIZE = 12;
var LINE_HEIGHT_RATIO = 1.2;

var MIN_TEXT_ANNOTATION_HEIGHT = 40;

var TEXT_ANNOTATION_PADDING = 7;

/**
 * @typedef { {
 *   fontFamily: string;
 *   fontSize: number;
 *   fontWeight: string;
 *   lineHeight: number;
 * } } TextRendererStyle
 *
 * @typedef { {
 *   defaultStyle?: Partial<TextRendererStyle>;
 *   externalStyle?: Partial<TextRendererStyle>;
 * } } TextRendererConfig
 *
 * @typedef { import('diagram-js/lib/util/Text').TextLayoutConfig } TextLayoutConfig
 *
 * @typedef { import('diagram-js/lib/util/Types').Rect } Rect
 */


/**
 * Renders text and computes text bounding boxes.
 *
 * @param {TextRendererConfig} [config]
 */
export default function TextRenderer(config) {

  var defaultStyle = assign({
    fontFamily: 'Arial, sans-serif',
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: 'normal',
    lineHeight: LINE_HEIGHT_RATIO
  }, config && config.defaultStyle || {});

  var fontSize = parseInt(defaultStyle.fontSize, 10) - 1;

  var externalStyle = assign({}, defaultStyle, {
    fontSize: fontSize
  }, config && config.externalStyle || {});

  var textUtil = new TextUtil({
    style: defaultStyle
  });

  /**
   * Get the new bounds of an externally rendered,
   * layouted label.
   *
   * @param {Rect} bounds
   * @param {string} text
   *
   * @return {Rect}
   */
  this.getExternalLabelBounds = function(bounds, text) {

    var dimensions = getTextboxDimensions(text, bounds, {
      style: externalStyle
    });

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: Math.ceil(dimensions.height)
    };

  };

  /**
   * Get the new bounds of text annotation.
   *
   * @param {Rect} bounds
   * @param {string} text
   *
   * @return {Rect}
   */
  this.getTextAnnotationBounds = function(bounds, text) {

    var dimensions = getTextboxDimensions(text, bounds, {
      style: defaultStyle,
      align: 'left-top',
      padding: TEXT_ANNOTATION_PADDING
    });

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: Math.max(MIN_TEXT_ANNOTATION_HEIGHT, Math.round(dimensions.height))
    };
  };

  /**
   * Get the text annotation padding.
   *
   * @return {number}
   */
  this.getTextAnnotationPadding = function() {
    return TEXT_ANNOTATION_PADDING;
  };

  /**
   * Get the dimensions of a text element.
   *
   * @param {string} text
   * @param {TextLayoutConfig} [options]
   *
   * @return {import('diagram-js/lib/util/Types').Dimensions}
   */
  this.getDimensions = function(text, options) {
    return textUtil.getDimensions(text, options || {});
  };

  /**
   * Compute dimension of text fitted inside a box.
   *
   * @param {string} text
   * @param {Rect} box
   * @param {TextLayoutConfig} layoutOptions
   *
   * @return {import('diagram-js/lib/util/Types').Dimensions}
   */
  function getTextboxDimensions(text, box, layoutOptions) {
    return textUtil.getDimensions(text, assign({ box: box }, layoutOptions));
  }

  /**
   * Create a layouted text element.
   *
   * @param {string} text
   * @param {TextLayoutConfig} [options]
   *
   * @return {SVGElement} rendered text
   */
  this.createText = function(text, options) {
    return textUtil.createText(text, options || {});
  };

  /**
   * Get default text style.
   */
  this.getDefaultStyle = function() {
    return defaultStyle;
  };

  /**
   * Get the external text style.
   */
  this.getExternalStyle = function() {
    return externalStyle;
  };

}

TextRenderer.$inject = [
  'config.textRenderer'
];