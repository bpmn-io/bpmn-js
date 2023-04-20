import type {
  Connection as BaseConnection,
  Element as BaseElement,
  Label as BaseLabel,
  Root as BaseRoot,
  Shape as BaseShape
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

export type Element = {
  businessObject: any;
  di: any;
  type: string;
} & BaseElement;

export type Connection = BaseConnection & Element;

export type Label = BaseLabel & Element;

export type Root = BaseRoot & Element;

export type Shape = BaseShape & Element;

export type Parent = Root | Shape;