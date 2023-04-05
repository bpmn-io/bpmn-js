import {
  Connection,
  Label,
  Root,
  Shape
} from "diagram-js/lib/model";

export type Moddle = any;

export type ModdleElement = any;

export type ModdleExtension = {};

export type BpmnAttributes = {
  associationDirection: 'None' | 'One' | 'Both';
  cancelActivity: boolean;
  eventDefinitionType: string;
  isExpanded: boolean;
  isForCompensation: boolean;
  isInterrupting: boolean;
  processRef: ModdleElement;
  triggeredByEvent: boolean;
};

export type BpmnElement = {
  businessObject: any;
  di: any;
  type: string;
};

export type BpmnConnection = Connection & BpmnElement;

export type BpmnLabel = Label & BpmnElement;

export type BpmnRoot = Root & BpmnElement;

export type BpmnShape = Shape & BpmnElement;

export type BpmnParent = BpmnRoot | BpmnShape;