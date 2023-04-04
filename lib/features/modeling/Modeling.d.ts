import BaseModeling, { ModelingHints } from 'diagram-js/lib/features/modeling/Modeling';
import EventBus from 'diagram-js/lib/core/EventBus';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import CommandStack, { CommandHandlerConstructor } from 'diagram-js/lib/command/CommandStack';
import { Base, ModelAttrsConnection, Root, Shape } from 'diagram-js/lib/model';
import { DirectionTRBL, Rect } from 'diagram-js/lib/util/Types';
import { ModdleElement } from '../../BaseViewer';

export type ModelingUpdateLabelHints = {
  removeShape?: boolean
} & ModelingHints

export type ModelingColorsHints = {
  fill?: string
  stroke?: string
} & ModelingHints

/**
 * BPMN 2.0 modeling features activator
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 * @param {BpmnRules} bpmnRules
 */
export default class Modeling extends BaseModeling {
  constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack, bpmnRules: Object);

  getHandlers(): Map<string, CommandHandlerConstructor>;

  updateLabel(element: Base, newLabel: string, newBounds?: Rect, hints?: ModelingUpdateLabelHints): void;

  connect(source: Base, target: Base, attrs?: ModelAttrsConnection, hints?: ModelingHints): typeof BaseModeling.prototype.createConnection;

  updateModdleProperties(source: Base, target: ModdleElement, properties: Record<string, unknown>): void;

  updateProperties(source: Base, properties: Record<string, unknown>): void;

  resizeLane(laneShape: Base, newBounds: Rect, balanced?: boolean): void;

  addLane(targetLaneShape: Shape, location?: DirectionTRBL): Shape;

  splitLane(targetLane: Shape, count: number): void;

  makeCollaboration(): Root;

  updateLaneRefs(flowNodeShapes: Shape[], laneShapes: Shape[]): void;

  /**
   * Transform the current diagram into a process.
   */
  makeProcess(): void;

  claimId(id: string, moddleElement: ModdleElement): void;

  unclaimId(id: string, moddleElement: ModdleElement): void;

  setColor(elements: Base, colors?: ModelingColorsHints): void;
  setColor(elements: Base[], colors?: ModelingColorsHints): void;
}
