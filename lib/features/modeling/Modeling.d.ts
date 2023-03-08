import { default as BaseModeling } from 'diagram-js/lib/features/modeling/Modeling';

import { ModdleElement } from '../../BaseViewer';

import BpmnRules from '../rules/BpmnRules';
import CommandStack from 'diagram-js/lib/command/CommandStack';
import ElementFactory from './ElementFactory';
import EventBus from 'diagram-js/lib/core/EventBus';

import {
  Base,
  Root,
  Shape
} from 'diagram-js/lib/model';

import { Rect } from 'diagram-js/lib/util/Types';

import { Colors } from '../../util/Types';

export interface UpdateLabelHints {

  /**
   * Whether to remove the shape if the updated label is empty.
   */
  removeShape: boolean;
}

export default class Modeling extends BaseModeling {

  /**
   * The BPMN 2.0 modeling entry point.
   *
   * @param eventBus
   * @param elementFactory
   * @param commandStack
   * @param bpmnRules
   */
  constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack, bpmnRules: BpmnRules);

  /**
   * Update an element's label.
   *
   * @param element The element.
   * @param newLabel The new label.
   * @param newBounds The optional bounds of the label.
   * @param hints The optional hints.
   */
  updateLabel(element: Base, newLabel: string, newBounds?: Rect, hints?: UpdateLabelHints): void;

  /**
   * Update a model element's properties.
   *
   * @param element The element.
   * @param moddleElement The model element.
   * @param properties The updated properties.
   */
  updateModdleProperties(element: Base, moddleElement: ModdleElement, properties: Object): void;

  /**
   * Update an element's properties.
   *
   * @param element The element.
   * @param properties The updated properties.
   */
  updateProperties(element: Base, properties: Object): void;

  /**
   * Resize a lane.
   *
   * @param laneShape The lane.
   * @param newBounds The new bounds of the lane.
   * @param balanced Wether to resize neighboring lanes.
   */
  resizeLane(laneShape: Shape, newBounds: Rect, balanced?: boolean): void;

  /**
   * Add a lane.
   *
   * @param targetLaneShape The shape to add the lane to.
   * @param location The location.
   *
   * @return The added lane.
   */
  addLane(targetLaneShape: Shape, location: 'top' | 'bottom'): Shape;

  /**
   * Split a lane.
   *
   * @param targetLane The lane to split.
   * @param count The number of lanes to split the lane into. Must not
   * exceed the number of existing lanes.
   */
  splitLane(targetLane: Shape, count: number): void;

  /**
   * Turn a process into a collaboration.
   *
   * @return The root of the collaboration.
   */
  makeCollaboration(): Root;

  /**
   * Transform a collaboration into a process.
   *
   * @return {Root} The root of the process.
   */
  makeProcess(): Root;

  /**
   * Update the referenced lanes of each flow node.
   *
   * @param flowNodeShapes The flow nodes to update.
   * @param laneShapes The lanes.
   */
  updateLaneRefs(flowNodeShapes: Shape[], laneShapes: Shape[]): void;

  /**
   * Claim an ID.
   *
   * @param id The ID to claim.
   * @param moddleElement The model element the ID is claimed for.
   */
  claimId(id: string, moddleElement: ModdleElement): void;

  /**
   * Unclaim an ID.
   *
   * @param id The ID to unclaim.
   * @param moddleElement The model element the ID is claimed for.
   */
  unclaimId(id: string, moddleElement: ModdleElement): void;

  /**
   * Set the color(s) of one or many elements.
   *
   * @param elements The elements to set the color(s) for.
   * @param colors The color(s) to set.
   */
  setColor(elements: Base[], colors: Colors): void;
}