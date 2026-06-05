import Canvas from 'diagram-js/lib/core/Canvas.js';
import EventBus from 'diagram-js/lib/core/EventBus.js';

import Modeler from './Modeler.js';

import { testViewer } from './BaseViewer.spec.js';

const modeler = new Modeler({
  container: 'container'
});

testViewer(modeler);

modeler.createDiagram();


const otherModeler = new Modeler({
  container: 'container'
});

const extendedModeler = new Modeler({
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

const typedViewer = new Modeler<TypeMap>();

const bus = typedViewer.get('eventBus');

const canvas = typedViewer.get('canvas');

canvas.zoom('fit-viewport');

typedViewer.on('foo', event => {
  console.log(event.foo);
});

typedViewer.get('eventBus').on('foo', e => console.log(e.foo));