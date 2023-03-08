import Modeler from '../../Modeler';

import ElementFactory from './ElementFactory';
import Modeling from './Modeling';

const modeler = new Modeler();

const elementFactory = modeler.get<ElementFactory>('elementFactory');

const connection = elementFactory.create('connection', { type: 'bpmn:SequenceFlow' }),
      root = elementFactory.create('root', { type: 'bpmn:Process' }),
      shape = elementFactory.create('shape', { type: 'bpmn:Task' });

const modeling = modeler.get<Modeling>('modeling');

modeling.updateLabel(shape, 'foo');

modeling.updateLabel(shape, 'foo', {
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

modeling.updateLabel(shape, 'foo', {
  x: 100,
  y: 100,
  width: 100,
  height: 100
}, { removeShape: true });

modeling.updateModdleProperties(shape, { type: 'bpmn:ExtensionElements' }, {
  values: []
});

modeling.updateProperties(shape, {
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

modeling.updateLaneRefs([ shape ], [ lane ]);

modeling.claimId('foo', shape.businessObject);

modeling.unclaimId('foo', shape.businessObject);

modeling.setColor([ shape ], { fill: 'red', stroke: 'green' });

modeling.setColor([ shape ], { fill: 'red' });

modeling.setColor([ shape ], { stroke: 'green' });