import Canvas from 'diagram-js/lib/core/Canvas';
import EventBus from 'diagram-js/lib/core/EventBus';

import BaseModeler from './BaseModeler';

import { testViewer } from './BaseViewer.spec';

const modeler = new BaseModeler({
  container: 'container'
});

testViewer(modeler);


const otherModeler = new BaseModeler({
  container: 'container'
});

const extendedModeler = new BaseModeler({
  container: 'container',
  alignToOrigin: false,
  propertiesPanel: {
    attachTo: '#properties-panel'
  }
});


// typed API usage

type FooEvent = {
  /**
   * Very cool field!
   */
  foo: string;
};

type EventMap = {

  foo: FooEvent
};

type TypeMap = {
  canvas: Canvas,
  eventBus: EventBus<EventMap>
};

const typedModeler = new BaseModeler<TypeMap>();

const bus = typedModeler.get('eventBus');

const canvas = typedModeler.get('canvas');

canvas.zoom('fit-viewport');

typedModeler.on('foo', event => {
  console.log(event.foo);
});

typedModeler.get('eventBus').on('foo', e => console.log(e.foo));