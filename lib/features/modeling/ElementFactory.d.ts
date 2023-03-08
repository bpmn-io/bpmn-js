import { default as BaseElementFactory } from 'diagram-js/lib/core/ElementFactory';

import { TranslateFunction } from 'diagram-js/lib/i18n/translate/translate';

import {
  Base,
  Connection,
  ModelAttrsConnection,
  ModelAttrsRoot,
  ModelAttrsShape,
  ModelTypeConnection,
  ModelTypeRoot,
  ModelTypeShape,
  Root,
  Shape
} from 'diagram-js/lib/model';

import { Dimension } from 'diagram-js/lib/util/Types';

import BpmnFactory from './BpmnFactory';

import { Moddle } from '../../BaseModeler';
import { ModdleElement } from '../../BaseViewer';

declare module 'diagram-js/lib/model' {
  interface ModelAttrsShape {

    /**
     * The type of BPMN element.
     */
    type: string;

    processRef?: ModdleElement;
    isInterrupting?: boolean;
    isForCompensation?: boolean;
    isExpanded?: boolean;
    triggeredByEvent?: boolean;
    cancelActivity?: boolean;

    /**
     * The type of the optional event definition.
     */
    eventDefinitionType?: string;
  }

  interface ModelAttrsConnection {

    /**
     * The type of BPMN element.
     */
    type: string;

    associationDirection?: 'None' | 'One' | 'Both';
  }
}

export default class ElementFactory extends BaseElementFactory {

  /**
   * A BPMN-aware factory for diagram elements.
   *
   * @param bpmnFactory
   * @param moddle
   * @param translate
   */
  constructor(bpmnFactory: BpmnFactory, moddle: Moddle, translate: TranslateFunction);

  /**
   * Create a BPMN connection.
   *
   * @param attrs The attributes of the connection to be created.
   *
   * @return The created connection.
   */
  createBpmnElement(elementType: ModelTypeConnection, attrs: ModelAttrsConnection): Connection;

  /**
   * Create a BPMN root.
   *
   * @param attrs The attributes of the root to be created.
   *
   * @return The created root.
   */
  createBpmnElement(elementType: ModelTypeRoot, attrs: ModelAttrsRoot): Root;

  /**
   * Create a BPMN shape.
   *
   * @param attrs The attributes of the shape to be created.
   *
   * @return The created shape.
   */
  createBpmnElement(elementType: ModelTypeShape, attrs: ModelAttrsShape): Shape;

  /**
   * Get the default size of a diagram element.
   *
   * @param element The element.
   * @param di The DI.
   *
   * @returns Default width and height of the element.
   */
  getDefaultSize(element: Base, di: ModdleElement): Dimension;

  /**
   * Create participant.
   *
   * @param attrs Attributes or whether the participant is
   * expanded.
   *
   * @returns The created participant.
   */
  createParticipantShape(attrs?: ModelAttrsShape | boolean): Shape;
}