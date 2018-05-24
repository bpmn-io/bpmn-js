import { assign } from 'min-dash';

import TextUtil from 'diagram-js/lib/util/Text';


export default function TextRenderer(config) {

  var defaultStyle = assign({
    fontFamily: 'Arial, sans-serif',
    fontSize: 12
  }, config && config.defaultStyle || {});

  var externalStyle = assign({}, defaultStyle, {
    fontSize: parseInt(defaultStyle.fontSize, 10) - 1
  }, config && config.externalStyle || {});

  var textUtil = new TextUtil({
    style: defaultStyle
  });


  /**
   * Get the new bounds of an externally rendered,
   * layouted label.
   *
   * @param  {Bounds} bounds
   * @param  {String} text
   *
   * @return {Bounds}
   */
  this.getLayoutedBounds = function(bounds, text) {

    var layoutedDimensions = textUtil.getDimensions(text, {
      box: {
        width: 90,
        height: 30,
        x: bounds.width / 2 + bounds.x,
        y: bounds.height / 2 + bounds.y
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
   * Create a layouted text element.
   *
   * @param {String} text
   * @param {Object} [options]
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