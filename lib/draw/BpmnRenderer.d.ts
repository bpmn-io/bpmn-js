import Canvas from 'diagram-js/lib/core/Canvas';
import EventBus from 'diagram-js/lib/core/EventBus';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import Styles from 'diagram-js/lib/draw/Styles';
import PathMap from './PathMap';
import TextRenderer from './TextRenderer';

/**
 * A renderer for BPMN elements
 */
export default class BpmnRenderer extends BaseRenderer {

  /**
   * @param config
   * @param eventBus
   * @param styles
   * @param pathMap
   * @param canvas
   * @param textRenderer
   * @param priority
   */
  constructor(
    config: BpmnRendererConfig,
    eventBus: EventBus,
    styles: Styles,
    pathMap: PathMap,
    canvas: Canvas,
    textRenderer: TextRenderer,
    priority?: number
  );
}

export type BpmnRendererConfig = Partial<{
  defaultFillColor: string;
  defaultStrokeColor: string;
  defaultLabelColor: string;
}>;
