import Modeler from '../../Modeler';

import ElementFactory from './ElementFactory';

import {
  Connection,
  Label,
  Root,
  Shape
} from '../../model/Types';

const modeler = new Modeler();

const elementFactory = modeler.get<ElementFactory>('elementFactory');

const shape1 = elementFactory.create('shape', {
  type: 'bpmn:Task',
  id: 'shape1',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

const shape2 = elementFactory.create('shape', {
  type: 'bpmn:Task',
  id: 'shape2',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

const connection = elementFactory.create('connection', {
  type: 'bpmn:SequenceFlow',
  id: 'connection',
  source: shape1,
  target: shape2,
  waypoints: []
});

elementFactory.create('root', {
  type: 'bpmn:Process',
  id: 'root'
});

elementFactory.create('label', {
  type: 'bpmn:Task',
  id: 'label'
});

elementFactory.create('shape', {
  type: 'bpmn:Task'
});

elementFactory.create('connection', {
  type: 'bpmn:SequenceFlow'
});

elementFactory.create('root', {
  type: 'bpmn:Process'
});

elementFactory.create('label', {
  type: 'bpmn:Task'
});

elementFactory.create('connection', {
  type: 'bpmn:Association',
  associationDirection: 'One'
});

elementFactory.create('shape', {
  type: 'bpmn:BoundaryEvent',
  cancelActivity: true,
  eventDefinitionType: 'bpmn:ErrorEventDefinition'
});

elementFactory.create('shape', {
  type: 'bpmn:Task',
  isForCompensation: false
});

elementFactory.create('shape', {
  type: 'bpmn:Participant',
  processRef: {}
});

elementFactory.create('shape', {
  type: 'bpmn:SubProcess',
  triggeredByEvent: true
});

elementFactory.createElement('connection', {
  type: 'bpmn:SequenceFlow'
});

elementFactory.createElement('root', {
  type: 'bpmn:Process'
});

elementFactory.createElement('shape', {
  type: 'bpmn:Task'
});

elementFactory.getDefaultSize(shape1, { type: 'bpmndi:BPMNShape' });

elementFactory.getDefaultSize(connection, { type: 'bpmndi:BPMNEdge' });

elementFactory.createParticipantShape();

elementFactory.createParticipantShape(true);

elementFactory.createParticipantShape({
  type: 'bpmn:Participant',
  isExpanded: true
});

/**
 * Customization
 */

type CustomShape = {
  foo: string;
} & Shape;

export class CustomElementFactory extends ElementFactory<Connection, Label, Root, CustomShape> {};

const customElementFactory = modeler.get<CustomElementFactory>('elementFactory');

const customShape = customElementFactory.createShape({ foo: 'bar' });

console.log(customShape.foo);