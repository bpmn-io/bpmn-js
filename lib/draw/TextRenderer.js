import { assign } from 'min-dash';

var DEFAULT_FONT_SIZE = 12;
var LINE_HEIGHT_RATIO = 1.2;

var MIN_TEXT_ANNOTATION_HEIGHT = 30;

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
 * @typedef { import('diagram-js/lib/draw/TextLayouter').TextLayoutConfig } TextLayoutConfig
 *
 * @typedef { import('diagram-js/lib/util/Types').Rect } Rect
 */


/**
 * Renders text and computes text bounding boxes.
 *
 * @param {import('diagram-js/lib/draw/TextLayouter').default} textLayouter
 * @param {TextRendererConfig} [config]
 */
export default function TextRenderer(textLayouter, config) {

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

    var layoutedDimensions = textLayouter.getDimensions(text, {
      box: {
        width: 90,
        height: 30
      },
      style: externalStyle
    });

    // resize label shape to fit label text
    return {
      x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
      y: Math.round(bounds.y),
      width: Math.ceil(layoutedDimensions.width),
      height: Math.ceil(layoutedDimensions.height)
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

    var layoutedDimensions = textLayouter.getDimensions(text, {
      box: bounds,
      style: defaultStyle,
      align: 'left-top',
      padding: 5
    });

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: Math.max(MIN_TEXT_ANNOTATION_HEIGHT, Math.round(layoutedDimensions.height))
    };
  };

  /**
   * Create a layouted text element.
   *
   * @param {string} text
   * @param {TextLayoutConfig} [options]
   *
   * @return {SVGElement} rendered text
   */
  this.createText = function(text, options) {
    return textLayouter.createText(text, assign({ style: defaultStyle }, options || {}));
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
  'textLayouter',
  'config.textRenderer'
];