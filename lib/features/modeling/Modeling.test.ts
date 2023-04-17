import { expectType } from 'ts-expect';

import Modeler from '../../Modeler';

import {
  Connection,
  Element,
  Label,
  Parent,
  Shape
} from '../../model/Types';

import ElementFactory from './ElementFactory';
import Modeling from './Modeling';

import { getBusinessObject } from '../../util/ModelUtil';

import { CustomElementFactory } from './ElementFactory.test';

const modeler = new Modeler();

const elementFactory = modeler.get<ElementFactory>('elementFactory');

const sequenceFlow = elementFactory.create('connection', { type: 'bpmn:SequenceFlow' }),
      process = elementFactory.create('root', { type: 'bpmn:Process' }),
      subProcess = elementFactory.create('shape', { type: 'bpmn:SubProcess' }),
      task = elementFactory.create('shape', { type: 'bpmn:Task' });

const modeling = modeler.get<Modeling>('modeling');

modeling.updateLabel(task, 'foo');

modeling.updateLabel(task, 'foo', {
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

modeling.updateLabel(task, 'foo', {
  x: 100,
  y: 100,
  width: 100,
  height: 100
}, { removeShape: true });

modeling.connect(subProcess, task, sequenceFlow);

modeling.connect(subProcess, task, sequenceFlow, { foo: 'bar' });

modeling.updateModdleProperties(task, { type: 'bpmn:ExtensionElements' }, {
  values: []
});

modeling.updateProperties(task, {
  name: 'foo'
});

const participant = elementFactory.create('shape', { type: 'bpmn:Participant'}),
      lane = elementFactory.create('shape', { type: 'bpmn:Lane'});

modeling.resizeLane(lane, {
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

modeling.resizeLane(lane, {
  x: 100,
  y: 100,
  width: 100,
  height: 100
}, true);

modeling.addLane(participant, 'top');

modeling.addLane(participant, 'bottom');

modeling.splitLane(lane, 3);

modeling.makeCollaboration();

modeling.makeProcess();

modeling.updateLaneRefs([ task ], [ lane ]);

modeling.claimId('foo', task.businessObject);

modeling.unclaimId('foo', task.businessObject);

modeling.setColor([ task ], { fill: 'red', stroke: 'green' });

modeling.setColor([ task ], { fill: 'red' });

modeling.setColor([ task ], { stroke: 'green' });

/**
 * Integration
 */

expectType<Connection>(modeling.createConnection(subProcess, task, sequenceFlow, process));

expectType<Label>(modeling.createLabel(task, { x: 100, y: 100 }, {
  businessObject: getBusinessObject(task)
}));

expectType<Shape>(modeling.createShape(task, { x: 100, y: 100 }, process));

expectType<Element[]>(modeling.createElements([
  subProcess,
  task,
  sequenceFlow
], { x: 100, y: 100 }, process));

modeling.moveShape(task, { x: 100, y: 100 });

modeling.moveConnection(sequenceFlow, { x: 100, y: 100 });

modeling.moveElements([ subProcess, task ], { x: 100, y: 100 });

/**
 * Customization
 */

type CustomElement = {
  foo: string;
} & Element;

type CustomShape = {
  bar: string;
} & Shape & CustomElement;

class CustomModeling extends Modeling<Connection, CustomElement, Label, Parent, CustomShape> {};

const customModeling = modeler.get<CustomModeling>('modeling');

const customShape = customModeling.createShape({ bar: 'bar' }, { x: 100, y: 100 }, modeler.get<CustomElementFactory>('elementFactory').create('root'));

customModeling.distributeElements([
  {
    elements: [ customShape ],
    range: {
      min: 100,
      max: 200
    }
  }
], 'x', 'width');