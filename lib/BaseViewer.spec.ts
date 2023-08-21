import CommandStack from 'diagram-js/lib/command/CommandStack';

import { Event } from 'diagram-js/lib/core/EventBus';

import BaseViewer, {
  ImportDoneEvent,
  ImportParseCompleteEvent,
  ImportParseStartEvent,
  SaveXMLDoneEvent,
  SaveXMLStartEvent
} from './BaseViewer';

import OverlaysModule from 'diagram-js/lib/features/overlays';

const viewer = new BaseViewer();

const configuredViewer = new BaseViewer({
  width: 100,
  height: 100,
  position: 'absolute',
  container: 'container',
  moddleExtensions: {
    foo: {}
  },
  additionalModules: [
    OverlaysModule
  ]
});

testViewer(viewer);

const extendedViewer = new BaseViewer({
  container: 'container',
  alignToOrigin: false,
  propertiesPanel: {
    attachTo: '#properties-panel'
  }
});

export function testViewer(viewer: BaseViewer) {
  viewer.importXML('<?xml version="1.0" encoding="UTF-8"?>', 'BPMNDiagram_1');

  viewer.importXML('<?xml version="1.0" encoding="UTF-8"?>')
    .then(({ warnings }) => {
      console.log(warnings);
    })
    .catch(error => {
      const {
        message,
        warnings
      } = error;

      console.log(message, warnings);
    });

  viewer.importDefinitions({ $type: 'bpmn:Definitions' }, 'BPMNDiagram_1');

  viewer.importDefinitions({ $type: 'bpmn:Definitions' })
    .then(({ warnings }) => {
      console.log(warnings);
    })
    .catch(error => {
      const {
        message,
        warnings
      } = error;

      console.log(message, warnings);
    });

  viewer.open('BPMNDiagram_1');

  viewer.open({ $type: 'bpmn:BPMNDiagram' })
    .then(({ warnings }) => {
      console.log(warnings);
    })
    .catch(error => {
      const {
        message,
        warnings
      } = error;

      console.log(message, warnings);
    });

  viewer.saveXML({ format: true, preamble: false })
    .then(({ xml, error }) => {
      if (error) {
        console.log(error);
      } else {
        console.log(xml);
      }
    })
    .catch(error => {
      console.log(error);
    });

  viewer.saveXML();

  viewer.saveSVG();

  viewer.getModules();

  viewer.clear();

  viewer.destroy();

  viewer.get<CommandStack>('commandStack').undo();

  viewer.invoke((commandStack: CommandStack) => commandStack.undo());

  viewer.on('foo', () => console.log('foo'));

  viewer.on([ 'foo', 'bar' ], () => console.log('foo'));

  viewer.on('foo', 2000, () => console.log('foo'));

  viewer.on('foo', 2000, () => console.log('foo'), { foo: 'bar' });

  viewer.off('foo', () => console.log('foo'));

  viewer.attachTo(document.createElement('div'));

  viewer.getDefinitions();

  viewer.detach();

  viewer.on<ImportParseStartEvent>('import.parse.start', ({ xml }) => {
    console.log(xml);
  });

  viewer.on<ImportParseCompleteEvent>('import.parse.complete', ({
    error,
    definitions,
    elementsById,
    references,
    warnings
  }) => {
    if (error) {
      console.error(error);
    }

    if (warnings.length) {
      warnings.forEach(warning => console.log(warning));
    }

    console.log(definitions, elementsById, references);
  });

  viewer.on<ImportDoneEvent>('import.done', ({ error, warnings }) => {
    if (error) {
      console.error(error);
    }

    if (warnings.length) {
      warnings.forEach(warning => console.log(warning));
    }
  });

  viewer.on<SaveXMLStartEvent>('saveXML.start', ({ definitions }) => {
    console.log(definitions);
  });

  viewer.on<SaveXMLDoneEvent>('saveXML.done', ({ error, xml }) => {
    if (error) {
      console.error(error);
    } else {
      console.log(xml);
    }
  });

  viewer.on<Event>('detach', () => {});
}