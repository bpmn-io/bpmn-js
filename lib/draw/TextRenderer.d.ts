import { Dimensions } from "diagram-js/lib/util/Types";

import { TextLayoutConfig } from 'diagram-js/lib/util/Text';

export type TextRendererStyle = {
  fontFamily: string,
  fontSize: number,
  fontWeight: string,
  lineHeight: number
};

export type TextRendererConfig = {
  defaultStyle?: Partial<TextRendererStyle>,
  externalStyle?: Partial<TextRendererStyle>
}


/**
 * Renders text and computes text bounding boxes.
 */
export default class TextRenderer {

  constructor(config?: TextRendererConfig);

  /**
   * Get the new bounds of an externally rendered,
   * layouted label.
   */
  getExternalLabelBounds(bounds: Dimensions, text: string): Dimensions;

  /**
   * Get the new bounds of text annotation.
   */
  getTextAnnotationBounds(bounds: Dimensions, text: string): Dimensions;

  /**
   * Create a layouted text element.
   *
   * @return rendered text
   */
  createText(text: string, options: TextLayoutConfig): SVGElement;

  /**
   * Get default text style.
   */
  getDefaultStyle(): TextRendererStyle;

  /**
   * Get the external text style.
   */
  getExternalStyle(): TextRendererStyle;
}