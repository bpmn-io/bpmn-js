import Canvas from 'diagram-js/lib/core/Canvas';
import EventBus from 'diagram-js/lib/core/EventBus';

import Viewer from './Viewer';

import { testViewer } from './BaseViewer.spec';

const viewer = new Viewer({
  container: 'container'
});

testViewer(viewer);

const extendedViewer = new Viewer({
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

const typedViewer = new Viewer<TypeMap>();

const bus = typedViewer.get('eventBus');

const canvas = typedViewer.get('canvas');

canvas.zoom('fit-viewport');

typedViewer.on('foo', event => {
  console.log(event.foo);
});

typedViewer.get('eventBus').on('foo', e => console.log(e.foo));